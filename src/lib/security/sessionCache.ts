/**
 * @fileoverview Session validation cache
 * @description Caches JWT verification results to improve performance
 *              JWT verification is expensive, so we cache valid sessions
 */

import { memoryCache } from '@/lib/cache/memoryCache';

/**
 * Cache TTL for session validation (30 seconds)
 * Short enough to catch expired sessions quickly, long enough to improve performance
 */
const SESSION_CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Cache key for session validation
 */
function getSessionCacheKey(token: string): string {
  // Use first 20 chars of token as key (JWT header is consistent)
  return `session:${token.substring(0, 20)}`;
}

/**
 * Get cached session validation result
 */
export function getCachedSession<T>(token: string): T | null {
  const key = getSessionCacheKey(token);
  return memoryCache.get<T>(key);
}

/**
 * Cache session validation result
 */
export function setCachedSession<T>(token: string, payload: T): void {
  const key = getSessionCacheKey(token);
  memoryCache.set(key, payload, SESSION_CACHE_TTL);
}

/**
 * Clear cached session (on logout or invalidation)
 */
export function clearCachedSession(token: string): void {
  const key = getSessionCacheKey(token);
  memoryCache.delete(key);
}

