/**
 * @fileoverview Session validation cache
 * @description Caches JWT verification results to improve performance
 *              Uses Redis for multi-instance support, falls back to memory
 */

import { memoryCache } from '@/lib/cache/memoryCache';
import {
  getCachedSessionRedis,
  setCachedSessionRedis,
  clearCachedSessionRedis
} from '@/lib/cache/redisCache';

/**
 * Cache TTL for session validation (30 seconds)
 * Short enough to catch expired sessions quickly, long enough to improve performance
 */
const SESSION_CACHE_TTL_MS = 30 * 1000; // 30 seconds

/**
 * Get session cache key (hash of token for security)
 * Uses first 20 chars of token as identifier
 */
function getSessionCacheKey(token: string): string {
  return token.substring(0, 20);
}

/**
 * Get cached session validation result
 * Tries Redis first, falls back to memory cache
 */
export async function getCachedSession<T>(token: string): Promise<T | null> {
  const key = getSessionCacheKey(token);

  // Try Redis first
  const redisResult = await getCachedSessionRedis<T>(key);
  if (redisResult) {
    return redisResult;
  }

  // Fallback to memory cache
  return memoryCache.get<T>(`session:${key}`);
}

/**
 * Cache session validation result
 * Stores in both Redis and memory for optimal performance
 */
export async function setCachedSession<T>(token: string, payload: T): Promise<void> {
  const key = getSessionCacheKey(token);

  // Store in Redis (async, non-blocking)
  setCachedSessionRedis(key, payload).catch(() => {
    // Ignore Redis errors, memory cache will work
  });

  // Also store in memory for faster local access
  memoryCache.set(`session:${key}`, payload, SESSION_CACHE_TTL_MS);
}

/**
 * Clear cached session (on logout or invalidation)
 * Clears from both Redis and memory
 */
export async function clearCachedSession(token: string): Promise<void> {
  const key = getSessionCacheKey(token);

  // Clear from Redis
  await clearCachedSessionRedis(key);

  // Clear from memory
  memoryCache.delete(`session:${key}`);
}

/**
 * Synchronous version for backward compatibility
 * Only checks memory cache
 */
export function getCachedSessionSync<T>(token: string): T | null {
  const key = getSessionCacheKey(token);
  return memoryCache.get<T>(`session:${key}`);
}

/**
 * Synchronous set for backward compatibility
 */
export function setCachedSessionSync<T>(token: string, payload: T): void {
  const key = getSessionCacheKey(token);
  memoryCache.set(`session:${key}`, payload, SESSION_CACHE_TTL_MS);

  // Also fire-and-forget to Redis
  setCachedSessionRedis(key, payload).catch(() => { });
}

/**
 * Synchronous clear for backward compatibility
 */
export function clearCachedSessionSync(token: string): void {
  const key = getSessionCacheKey(token);
  memoryCache.delete(`session:${key}`);

  // Also fire-and-forget to Redis
  clearCachedSessionRedis(key).catch(() => { });
}
