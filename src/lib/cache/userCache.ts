/**
 * @fileoverview User data caching with Redis
 * @description Caches user sheet data with TTL, uses Redis with in-memory fallback
 */

import { memoryCache } from './memoryCache';
import { redisCache } from './redisCache';
import { Logger } from '@/lib/utils/logger';

/**
 * Cache keys
 * Exported for use in other modules that need to generate consistent cache keys
 */
export const CacheKeys = {
  userData: (email: string) => `user:data:${email.toLowerCase()}`,
  userDataWithLimits: (email: string, limitsKey: string) => `user:data:${email.toLowerCase()}:${limitsKey}`,
  authUser: (email: string) => `user:auth:${email.toLowerCase()}`,
  referenceTables: () => 'user:reference:tables',
};

/**
 * Cache TTLs
 */
const TTL = {
  USER_DATA_SECONDS: 60, // 1 minute (Redis)
  USER_DATA_MS: 60 * 1000, // 1 minute (memory fallback)
  REFERENCE_TABLES_SECONDS: 30 * 60, // 30 minutes (Redis)
  REFERENCE_TABLES_MS: 30 * 60 * 1000, // 30 minutes (memory fallback)
  AUTH_USER_SECONDS: 15 * 60, // 15 minutes (Redis) - reduced from 1h to limit exposure of password hash in cache
  AUTH_USER_MS: 15 * 60 * 1000, // 15 minutes (memory)
};

/**
 * Get cached user for authentication (includes password hash)
 */
export async function getCachedAuthUser<T>(email: string): Promise<T | null> {
  const key = CacheKeys.authUser(email);
  const redisData = await redisCache.get<T>(key);
  if (redisData) {
    Logger.info('UserCache', `Auth cache hit for: ${email}`);
    return redisData;
  }
  return null;
}

/**
 * Set cached user for authentication
 */
export async function setCachedAuthUser<T>(email: string, data: T): Promise<void> {
  const key = CacheKeys.authUser(email);
  await redisCache.set(key, data, TTL.AUTH_USER_SECONDS).catch(() => { });
}

/**
 * Clear cached user for authentication
 */
export async function clearCachedAuthUser(email: string): Promise<void> {
  const key = CacheKeys.authUser(email);
  await redisCache.delete(key).catch(() => { });
}

/**
 * Get cached user data
 * Tries Redis first, falls back to memory cache
 */
export async function getUserData<T>(email: string): Promise<T | null> {
  const key = CacheKeys.userData(email);

  // Try Redis first
  const redisData = await redisCache.get<T>(key);
  if (redisData) {
    Logger.info('UserCache', `Redis cache hit for user: ${email}.`);
    return redisData;
  }

  // Fallback to memory cache
  const memData = memoryCache.get<T>(key);
  if (memData) {
    Logger.info('UserCache', `Memory cache hit for user: ${email}.`);
    return memData;
  }

  return null;
}

/**
 * Set cached user data
 * Stores in both Redis and memory for optimal performance
 */
export async function setUserData<T>(email: string, data: T): Promise<void> {
  const key = CacheKeys.userData(email);

  // Store in Redis (with error handling)
  await redisCache.set(key, data, TTL.USER_DATA_SECONDS).catch((error) => {
    Logger.error('UserCache', 'Failed to cache user data in Redis.', error);
  });

  // Also store in memory for fast local access
  memoryCache.set(key, data, TTL.USER_DATA_MS);
}

/**
 * Clear cached user data
 * Clears both base cache and all limit-variant caches
 */
export async function clearUserData(email: string): Promise<void> {
  const baseKey = CacheKeys.userData(email);

  // Clear base cache from Redis
  await redisCache.delete(baseKey).catch((error) => {
    Logger.error('UserCache', 'Failed to clear user data from Redis.', error);
  });

  // Clear base cache from memory
  memoryCache.delete(baseKey);

  // Also clear all limit-variant caches using pattern deletion
  // This ensures all cached variants are cleared when user data changes
  try {
    await redisCache.deletePattern(`user:data:${email.toLowerCase()}:*`);
  } catch (error) {
    Logger.error('UserCache', 'Failed to clear limit-variant user data cache from Redis.', error);
  }
}

/**
 * Get cached reference tables
 */
export async function getReferenceTables<T>(): Promise<T | null> {
  const key = CacheKeys.referenceTables();

  const redisData = await redisCache.get<T>(key);
  if (redisData) return redisData;

  return memoryCache.get<T>(key);
}

/**
 * Set cached reference tables
 */
export async function setReferenceTables<T>(data: T): Promise<void> {
  const key = CacheKeys.referenceTables();

  await redisCache.set(key, data, TTL.REFERENCE_TABLES_SECONDS).catch((error) => {
    Logger.error('UserCache', 'Failed to cache reference tables in Redis.', error);
  });

  memoryCache.set(key, data, TTL.REFERENCE_TABLES_MS);
}

/**
 * Clear cached reference tables
 */
export async function clearReferenceTables(): Promise<void> {
  const key = CacheKeys.referenceTables();

  await redisCache.delete(key).catch(() => { });
  memoryCache.delete(key);
}

/**
 * Clear all user-related cache
 */
export async function clearAllUserCache(): Promise<void> {
  // For Redis, we'd need pattern deletion which is expensive
  // For now, rely on TTL expiration or specific key clearing
  Logger.info('UserCache', 'User cache scheduled for TTL expiration.');
}
