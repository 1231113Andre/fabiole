/**
 * @fileoverview Google Sheets API cache module
 * @author Personal Trainer Platform Team
 * @description Provides caching layer for Google Sheets API calls to improve performance
 * @since 1.0.0
 */

import { google } from 'googleapis';
import { UserSheetData } from './types';
import { InfoDataRow } from '@/types/user';

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * In-memory cache for API responses
 */
class APICache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 60 * 1000; // 1 minute default TTL

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Get cache age as percentage of TTL (0 = fresh, 1 = expired)
   */
  getAgePercent(key: string): number {
    const entry = this.cache.get(key);
    if (!entry) return 1; // No cache = treat as expired

    const now = Date.now();
    const age = now - entry.timestamp;
    return Math.min(age / entry.ttl, 1);
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
    });
  }

  /**
   * Clear cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Singleton cache instance
export const apiCache = new APICache();

/**
 * Cache keys
 */
export const CacheKeys = {
  userSheetData: (email: string) => `user_sheet:${email}`,
  infoDataUsers: () => 'info_data:users',
  userExists: (email: string) => `user_exists:${email}`,
  infoDataInitialized: () => 'info_data:initialized',
  referenceTables: () => 'reference_tables:data',
} as const;

/**
 * Clear user-related cache
 */
export function clearUserCache(email: string): void {
  apiCache.delete(CacheKeys.userSheetData(email));
  apiCache.delete(CacheKeys.userExists(email));
}

/**
 * Clear all infoData cache
 */
export function clearInfoDataCache(): void {
  apiCache.delete(CacheKeys.infoDataUsers());
}

