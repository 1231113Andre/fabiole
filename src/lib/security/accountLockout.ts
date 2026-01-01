import { Logger } from '../utils/logger';

/**
 * @fileoverview Account lockout mechanism
 * @description Tracks failed login attempts and locks accounts after threshold
 *              Uses in-memory storage with automatic cleanup
 */

interface LockoutEntry {
  attempts: number;
  lockedUntil: number;
  lastAttempt: number;
}

/**
 * In-memory store for account lockouts
 * Key format: email:ip or just email
 */
const lockoutStore = new Map<string, LockoutEntry>();

/**
 * Configuration
 */
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Cleanup expired lockout entries
 */
let cleanupScheduled = false;
function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;

  setTimeout(() => {
    cleanupScheduled = false;
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of lockoutStore.entries()) {
      // Remove if lockout expired and no recent attempts
      if (entry.lockedUntil < now && entry.lastAttempt < now - LOCKOUT_DURATION_MS) {
        lockoutStore.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      Logger.info('Security', `Automated Account Protection: Purged ${cleaned} stale lockout tracking entries from memory.`);
    }
  }, CLEANUP_INTERVAL_MS);
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
export function checkAccountLockout(
  email: string,
  ip?: string
): { isLocked: boolean; remainingSeconds?: number } {
  const key = getLockoutKey(email, ip);
  const entry = lockoutStore.get(key);

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
}

/**
 * Record a failed login attempt
 * @param email - User email
 * @param ip - Optional IP address
 * @returns Object with isLocked boolean and attempts count
 */
export function recordFailedAttempt(
  email: string,
  ip?: string
): { isLocked: boolean; attempts: number; remainingSeconds?: number } {
  const key = getLockoutKey(email, ip);
  const now = Date.now();
  let entry = lockoutStore.get(key);

  if (!entry) {
    entry = {
      attempts: 0,
      lockedUntil: 0,
      lastAttempt: now,
    };
  }

  entry.attempts++;
  entry.lastAttempt = now;

  // Lock account if threshold reached
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
    Logger.warn('Security', `Account Lockout Triggered: Identity ${email} has reached the maximum failed attempt threshold (${entry.attempts}). Access restricted for 15 minutes.`);
  }

  lockoutStore.set(key, entry);

  // Schedule cleanup if needed
  if (lockoutStore.size > 1000 && !cleanupScheduled) {
    scheduleCleanup();
  }

  const isLocked = entry.lockedUntil > now;
  const remainingSeconds = isLocked
    ? Math.ceil((entry.lockedUntil - now) / 1000)
    : undefined;

  return {
    isLocked,
    attempts: entry.attempts,
    remainingSeconds,
  };
}

/**
 * Clear failed attempts on successful login
 * @param email - User email
 * @param ip - Optional IP address
 */
export function clearFailedAttempts(email: string, ip?: string): void {
  const key = getLockoutKey(email, ip);
  lockoutStore.delete(key);
  Logger.success('Security', `Account Protection Reset: Login restrictions and attempt tracking cleared for identity: ${email}.`);
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

