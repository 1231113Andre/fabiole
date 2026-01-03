import { Logger } from '../utils/logger';
import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';

/**
 * @fileoverview Account lockout mechanism
 * @description Tracks failed login attempts and locks accounts after threshold
 *              Uses Redis for persistent storage
 */

interface LockoutEntry {
  attempts: number;
  lockedUntil: number;
  lastAttempt: number;
}

/**
 * Configuration
 */
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const REDIS_KEY_PREFIX = 'fabiole:lockout:';
const EXPIRED_LOCKOUT_TTL_SECONDS = 3600; // 1 hour - how long to keep expired lockout entries

/**
 * Get lockout entry from Redis
 */
async function getLockoutEntryFromRedis(key: string): Promise<LockoutEntry | null> {
  if (!isRedisEnabled()) {
    throw new Error('Redis is not enabled or not connected');
  }
  
  const redis = getRedisClient();
  if (!redis || redis.status !== 'ready') {
    throw new Error('Redis client is not ready');
  }
  
  const data = await redis.get(`${REDIS_KEY_PREFIX}${key}`);
  if (!data) return null;
  
  try {
    return JSON.parse(data) as LockoutEntry;
  } catch (parseError) {
    // If data in Redis is corrupted, delete it and return null
    Logger.error('Security', `Corrupted lockout entry in Redis for key: ${key}, deleting it`, parseError);
    await redis.del(`${REDIS_KEY_PREFIX}${key}`).catch(() => {
      // Ignore deletion errors
    });
    return null;
  }
}

/**
 * Set lockout entry in Redis
 */
async function setLockoutEntryInRedis(key: string, entry: LockoutEntry, ttlSeconds?: number): Promise<void> {
  if (!isRedisEnabled()) {
    throw new Error('Redis is not enabled or not connected');
  }
  
  const redis = getRedisClient();
  if (!redis || redis.status !== 'ready') {
    throw new Error('Redis client is not ready');
  }
  
  const redisKey = `${REDIS_KEY_PREFIX}${key}`;
  const now = Date.now();
  
  // Calculate TTL based on lockedUntil or use provided TTL
  let ttl: number;
  if (ttlSeconds !== undefined) {
    ttl = ttlSeconds;
  } else if (entry.lockedUntil > now) {
    // Account is currently locked - TTL until lockout expires
    ttl = Math.ceil((entry.lockedUntil - now) / 1000);
  } else {
    // Lockout expired or no lockout - keep entry for tracking attempts history
    // This prevents immediate retry attacks while not storing data indefinitely
    ttl = EXPIRED_LOCKOUT_TTL_SECONDS;
  }
  
  // Ensure minimum TTL of 60 seconds
  ttl = Math.max(ttl, 60);
  
  // ioredis: set(key, value, 'EX', seconds)
  await redis.set(redisKey, JSON.stringify(entry), 'EX', ttl);
}

/**
 * Delete lockout entry from Redis
 */
async function deleteLockoutEntryFromRedis(key: string): Promise<void> {
  if (!isRedisEnabled()) {
    throw new Error('Redis is not enabled or not connected');
  }
  
  const redis = getRedisClient();
  if (!redis || redis.status !== 'ready') {
    throw new Error('Redis client is not ready');
  }
  
  await redis.del(`${REDIS_KEY_PREFIX}${key}`);
}


/**
 * Get lockout key from email and optional IP
 */
function getLockoutKey(email: string, ip?: string): string {
  return ip ? `${email.toLowerCase()}:${ip}` : email.toLowerCase();
}

/**
 * Check if account is locked
 * @param email - User email
 * @param ip - Optional IP address
 * @returns Object with isLocked boolean and remaining time in seconds
 */
export async function checkAccountLockout(
  email: string,
  ip?: string
): Promise<{ isLocked: boolean; remainingSeconds?: number }> {
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
      };
    }

    // Lockout expired, but keep entry for tracking attempts
    return { isLocked: false };
  } catch (error) {
    // If Redis is unavailable, allow access (fail open)
    // This prevents Redis outages from blocking all logins
    Logger.error('Security', 'Failed to check account lockout status, allowing access', error);
    return { isLocked: false };
  }
}

/**
 * Record a failed login attempt
 * @param email - User email
 * @param ip - Optional IP address
 * @returns Object with isLocked boolean and attempts count
 */
export async function recordFailedAttempt(
  email: string,
  ip?: string
): Promise<{ isLocked: boolean; attempts: number; remainingSeconds?: number }> {
  const key = getLockoutKey(email, ip);
  const now = Date.now();
  
  try {
    // Get existing entry from Redis
    const existing = await getLockoutEntryFromRedis(key);
    const entry: LockoutEntry = existing || {
      attempts: 0,
      lockedUntil: 0,
      lastAttempt: now,
    };

    entry.attempts++;
    entry.lastAttempt = now;

    // Lock account if threshold reached
    if (entry.attempts >= MAX_ATTEMPTS) {
      entry.lockedUntil = now + LOCKOUT_DURATION_MS;
      Logger.warn('Security', `Account Lockout Triggered: Identity ${email} has reached the maximum failed attempt threshold (${entry.attempts}). Access restricted for 15 minutes.`);
    }

    // Save to Redis
    await setLockoutEntryInRedis(key, entry);

    const isLocked = entry.lockedUntil > now;
    const remainingSeconds = isLocked
      ? Math.ceil((entry.lockedUntil - now) / 1000)
      : undefined;

    return {
      isLocked,
      attempts: entry.attempts,
      remainingSeconds,
    };
  } catch (error) {
    // If Redis is unavailable, log error but don't block the login attempt
    // This prevents Redis outages from breaking authentication flow
    Logger.error('Security', 'Failed to record failed login attempt', error);
    
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
    Logger.error('Security', 'Failed to clear failed attempts', error);
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

