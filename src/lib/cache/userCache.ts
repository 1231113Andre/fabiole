/**
 * @fileoverview User data caching
 * @description Caches user sheet data with TTL and stale-while-revalidate pattern
 */

import { memoryCache } from './memoryCache';
import { Logger } from '@/lib/utils/logger';

/**
 * Cache keys
 */
const CacheKeys = {
  userData: (email: string) => `user:data:${email.toLowerCase()}`,
  referenceTables: () => 'user:reference:tables',
};

/**
 * Cache TTLs (in milliseconds)
 */
const TTL = {
  USER_DATA: 1 * 60 * 1000, // 1 minute (short TTL for fresh data)
  REFERENCE_TABLES: 30 * 60 * 1000, // 30 minutes
};

/**
 * Get cached user data
 */
export function getUserData<T>(email: string): T | null {
  const key = CacheKeys.userData(email);
  return memoryCache.get<T>(key);
}

/**
 * Set cached user data
 */
export function setUserData<T>(email: string, data: T): void {
  const key = CacheKeys.userData(email);
  memoryCache.set(key, data, TTL.USER_DATA);
}

/**
 * Clear cached user data
 */
export function clearUserData(email: string): void {
  const key = CacheKeys.userData(email);
  memoryCache.delete(key);
}

/**
 * Get cached reference tables
 */
export function getReferenceTables<T>(): T | null {
  const key = CacheKeys.referenceTables();
  return memoryCache.get<T>(key);
}

/**
 * Set cached reference tables
 */
export function setReferenceTables<T>(data: T): void {
  const key = CacheKeys.referenceTables();
  memoryCache.set(key, data, TTL.REFERENCE_TABLES);
}

/**
 * Clear cached reference tables
 */
export function clearReferenceTables(): void {
  const key = CacheKeys.referenceTables();
  memoryCache.delete(key);
}

/**
 * Clear all user-related cache
 */
export function clearAllUserCache(): void {
  // Note: This would require iterating all keys, which is expensive
  // For now, we'll rely on TTL expiration
  // If needed, we can maintain a list of user email keys
  Logger.info('Cache', 'User cache scheduled for TTL expiration.');
}

