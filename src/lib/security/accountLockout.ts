import { Logger } from '../utils/logger';
import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';
import { emitSecurityEvent } from '@/lib/security/securityEvents';
import type Redis from 'ioredis';

/**
 * @fileoverview Account lockout mechanism
 * @description Tracks failed login attempts and locks accounts after threshold
 *              Uses Redis for persistent storage with atomic operations
 */

interface LockoutEntry {
  attempts: number;
  lockedUntil: number;
  lastAttempt: number;
  lockoutCount: number; // Number of times account has been locked (for progressive lockout)
}

interface IpRateLimitEntry {
  attempts: number;
  lastAttempt: number;
}

/**
 * Configuration
 */
const MAX_ATTEMPTS = 5;
const BASE_LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes base
const MAX_LOCKOUT_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours max
const REDIS_KEY_PREFIX = 'fabiole:lockout:';
const REDIS_IP_KEY_PREFIX = 'fabiole:iplimit:';
const EXPIRED_LOCKOUT_TTL_SECONDS = 3600; // 1 hour - how long to keep expired lockout entries

// IP Rate Limiting config
const IP_MAX_ATTEMPTS = 50; // Max attempts per IP across all accounts
const IP_WINDOW_SECONDS = 900; // 15 minute sliding window

/**
 * Lua script for atomic failed attempt recording
 * Prevents race conditions by doing GET + INCREMENT + SET atomically
 */
const RECORD_ATTEMPT_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local maxAttempts = tonumber(ARGV[2])
local baseLockoutMs = tonumber(ARGV[3])
local maxLockoutMs = tonumber(ARGV[4])
local ttlSeconds = tonumber(ARGV[5])

local data = redis.call('GET', key)
local entry

if data then
  entry = cjson.decode(data)
else
  entry = {attempts = 0, lockedUntil = 0, lastAttempt = now, lockoutCount = 0}
end

entry.attempts = entry.attempts + 1
entry.lastAttempt = now

-- Lock account if threshold reached
if entry.attempts >= maxAttempts then
  entry.lockoutCount = (entry.lockoutCount or 0) + 1
  -- Progressive lockout: exponential backoff with cap
  local multiplier = math.min(math.pow(2, entry.lockoutCount - 1), maxLockoutMs / baseLockoutMs)
  local lockoutDuration = math.min(baseLockoutMs * multiplier, maxLockoutMs)
  entry.lockedUntil = now + lockoutDuration
end

local entryJson = cjson.encode(entry)
redis.call('SET', key, entryJson, 'EX', ttlSeconds)

return entryJson
`;

/**
 * Lua script for atomic IP rate limiting
 */
const IP_RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local maxAttempts = tonumber(ARGV[2])
local windowSeconds = tonumber(ARGV[3])

local data = redis.call('GET', key)
local entry

if data then
  entry = cjson.decode(data)
  -- Check if window expired, reset if so
  if (now - entry.lastAttempt) > (windowSeconds * 1000) then
    entry = {attempts = 1, lastAttempt = now}
  else
    entry.attempts = entry.attempts + 1
    entry.lastAttempt = now
  end
else
  entry = {attempts = 1, lastAttempt = now}
end

local entryJson = cjson.encode(entry)
redis.call('SET', key, entryJson, 'EX', windowSeconds)

local isBlocked = entry.attempts > maxAttempts
return cjson.encode({blocked = isBlocked, attempts = entry.attempts})
`;

/**
 * Get a ready Redis client or throw
 */
function getReadyRedisClient(): Redis {
  if (!isRedisEnabled()) {
    throw new Error('Redis is not enabled or not connected');
  }

  const redis = getRedisClient();
  if (!redis) {
    throw new Error('Redis client is not ready');
  }

  return redis;
}

/**
 * Get lockout entry from Redis
 */
async function getLockoutEntryFromRedis(key: string): Promise<LockoutEntry | null> {
  const redis = getReadyRedisClient();

  const data = await redis.get(`${REDIS_KEY_PREFIX}${key}`);
  if (!data) return null;

  try {
    return JSON.parse(data) as LockoutEntry;
  } catch (parseError) {
    // If data in Redis is corrupted, delete it and return null
    Logger.error('Security', `Corrupted lockout entry in Redis for key: ${key}, deleting it.`, parseError);
    await redis.del(`${REDIS_KEY_PREFIX}${key}`).catch(() => {
      // Ignore deletion errors
    });
    return null;
  }
}

/**
 * Delete lockout entry from Redis
 */
async function deleteLockoutEntryFromRedis(key: string): Promise<void> {
  const redis = getReadyRedisClient();
  await redis.del(`${REDIS_KEY_PREFIX}${key}`);
}

/**
 * Get lockout key from email and optional IP
 */
function getLockoutKey(email: string, ip?: string): string {
  return ip ? `${email.toLowerCase()}:${ip}` : email.toLowerCase();
}

/**
 * Calculate lockout duration based on progressive lockout
 */
function calculateLockoutDuration(lockoutCount: number): number {
  const multiplier = Math.min(Math.pow(2, lockoutCount - 1), MAX_LOCKOUT_DURATION_MS / BASE_LOCKOUT_DURATION_MS);
  return Math.min(BASE_LOCKOUT_DURATION_MS * multiplier, MAX_LOCKOUT_DURATION_MS);
}

/**
 * Check if IP is rate limited (too many attempts across all accounts)
 * @param ip - IP address
 * @returns Object with isBlocked boolean and attempts count
 */
export async function checkIpRateLimit(ip: string): Promise<{ isBlocked: boolean; attempts: number }> {
  try {
    const redis = getReadyRedisClient();
    const key = `${REDIS_IP_KEY_PREFIX}${ip}`;

    const data = await redis.get(key);
    if (!data) {
      return { isBlocked: false, attempts: 0 };
    }

    const entry = JSON.parse(data) as IpRateLimitEntry;
    const isBlocked = entry.attempts > IP_MAX_ATTEMPTS;

    return { isBlocked, attempts: entry.attempts };
  } catch (error) {
    // Fail open on Redis errors
    Logger.error('Security', 'Failed to check IP rate limit, allowing access.', error);
    emitSecurityEvent({ type: 'REDIS_IP_RATE_LIMIT_FAIL_OPEN' });
    return { isBlocked: false, attempts: 0 };
  }
}

/**
 * Record IP attempt (atomic using Lua script)
 * @param ip - IP address
 * @returns Object with isBlocked boolean and attempts count
 */
export async function recordIpAttempt(ip: string): Promise<{ isBlocked: boolean; attempts: number }> {
  try {
    const redis = getReadyRedisClient();
    const key = `${REDIS_IP_KEY_PREFIX}${ip}`;
    const now = Date.now();

    const result = await redis.eval(
      IP_RATE_LIMIT_SCRIPT,
      1,
      key,
      now.toString(),
      IP_MAX_ATTEMPTS.toString(),
      IP_WINDOW_SECONDS.toString()
    ) as string;

    const parsed = JSON.parse(result);

    if (parsed.blocked) {
      Logger.warn('Security', `IP Rate Limit Triggered: IP ${ip} has exceeded ${IP_MAX_ATTEMPTS} attempts in ${IP_WINDOW_SECONDS}s window.`);
      emitSecurityEvent({ type: 'IP_RATE_LIMIT', identifier: ip, context: { attempts: parsed.attempts } });
    }

    return { isBlocked: parsed.blocked, attempts: parsed.attempts };
  } catch (error) {
    // Fail open on Redis errors
    Logger.error('Security', 'Failed to record IP attempt.', error);
    emitSecurityEvent({ type: 'REDIS_IP_RATE_LIMIT_FAIL_OPEN' });
    return { isBlocked: false, attempts: 0 };
  }
}

/**
 * Check if account is locked
 * @param email - User email
 * @param ip - Optional IP address
 * @returns Object with isLocked boolean, remaining time in seconds, and lockout count
 */
export async function checkAccountLockout(
  email: string,
  ip?: string
): Promise<{ isLocked: boolean; remainingSeconds?: number; lockoutCount?: number }> {
  const key = getLockoutKey(email, ip);

  try {
    const entry = await getLockoutEntryFromRedis(key);

    if (!entry) {
      return { isLocked: false };
    }

    const now = Date.now();

    // Check if still locked
    if (entry.lockedUntil > now) {
      const remainingSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
      return {
        isLocked: true,
        remainingSeconds,
        lockoutCount: entry.lockoutCount || 1,
      };
    }

    // Lockout expired, but keep entry for tracking attempts
    return { isLocked: false, lockoutCount: entry.lockoutCount || 0 };
  } catch (error) {
    // If Redis is unavailable, allow access (fail open)
    // This prevents Redis outages from blocking all logins
    Logger.error('Security', 'Failed to check account lockout status, allowing access.', error);
    emitSecurityEvent({ type: 'REDIS_LOCKOUT_FAIL_OPEN' });
    return { isLocked: false };
  }
}

/**
 * Record a failed login attempt (atomic using Lua script)
 * @param email - User email
 * @param ip - Optional IP address
 * @returns Object with isLocked boolean, attempts count, and remaining seconds
 */
export async function recordFailedAttempt(
  email: string,
  ip?: string
): Promise<{ isLocked: boolean; attempts: number; remainingSeconds?: number; lockoutDuration?: number; lockoutCount?: number }> {
  const key = getLockoutKey(email, ip);
  const now = Date.now();

  try {
    const redis = getReadyRedisClient();
    const redisKey = `${REDIS_KEY_PREFIX}${key}`;

    // Use Lua script for atomic operation
    const result = await redis.eval(
      RECORD_ATTEMPT_SCRIPT,
      1,
      redisKey,
      now.toString(),
      MAX_ATTEMPTS.toString(),
      BASE_LOCKOUT_DURATION_MS.toString(),
      MAX_LOCKOUT_DURATION_MS.toString(),
      EXPIRED_LOCKOUT_TTL_SECONDS.toString()
    ) as string;

    const entry = JSON.parse(result) as LockoutEntry;

    const isLocked = entry.lockedUntil > now;
    const remainingSeconds = isLocked
      ? Math.ceil((entry.lockedUntil - now) / 1000)
      : undefined;

    if (isLocked) {
      const lockoutDuration = calculateLockoutDuration(entry.lockoutCount);
      const lockoutMinutes = Math.ceil(lockoutDuration / 60000);
      Logger.warn('Security', `Account Lockout Triggered: Identity ${email} has reached the maximum failed attempt threshold (${entry.attempts}). Access restricted for ${lockoutMinutes} minutes (lockout #${entry.lockoutCount}).`);
      emitSecurityEvent({ type: 'ACCOUNT_LOCKOUT', identifier: email, context: { attempts: entry.attempts, lockoutCount: entry.lockoutCount } });
    }

    return {
      isLocked,
      attempts: entry.attempts,
      remainingSeconds,
      lockoutDuration: isLocked ? calculateLockoutDuration(entry.lockoutCount) : undefined,
      lockoutCount: entry.lockoutCount ?? 1,
    };
  } catch (error) {
    // If Redis is unavailable, log error but don't block the login attempt
    // This prevents Redis outages from breaking authentication flow
    Logger.error('Security', 'Failed to record failed login attempt.', error);
    emitSecurityEvent({ type: 'REDIS_LOCKOUT_FAIL_OPEN' });

    // Return unlocked state so login can proceed
    return {
      isLocked: false,
      attempts: 0,
    };
  }
}

/**
 * Clear failed attempts on successful login
 * @param email - User email
 * @param ip - Optional IP address
 */
export async function clearFailedAttempts(email: string, ip?: string): Promise<void> {
  const key = getLockoutKey(email, ip);

  try {
    await deleteLockoutEntryFromRedis(key);
    Logger.success('Security', `Account Protection Reset: Login restrictions and attempt tracking cleared for identity: ${email}.`);
  } catch (error) {
    // Log error but don't throw - clearing lockout is not critical
    Logger.error('Security', 'Failed to clear failed attempts.', error);
  }
}

/**
 * Get client IP from request
 */
export function getClientIp(request: Request): string | undefined {
  // Try various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return undefined;
}

/**
 * Get lockout info for display purposes (Portuguese)
 */
export function formatLockoutDuration(lockoutCount: number): string {
  const durationMs = calculateLockoutDuration(lockoutCount);
  const minutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours} hora${hours === 1 ? '' : 's'}`;
  }
  return `${minutes} minuto${minutes === 1 ? '' : 's'}`;
}
