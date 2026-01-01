/**
 * @fileoverview Generic in-memory cache with TTL and LRU eviction
 * @description Provides a memory-efficient cache with automatic cleanup
 * 
 * IMPORTANT: Uses Symbol.for() to ensure single instance across HMR
 */

import { Logger } from '@/lib/utils/logger';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  lastAccessed: number;
}

/**
 * In-memory cache with TTL and LRU eviction
 */
class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxSize: number = 10000) {
    this.maxSize = maxSize;
    this.startCleanup();
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    // Update last accessed time (for LRU)
    entry.lastAccessed = Date.now();
    return entry.value as T;
  }

  /**
   * Set value in cache with TTL
   */
  set<T>(key: string, value: T, ttlMs: number): void {
    // Evict if cache is full (LRU)
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      this.evictLRU();
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      lastAccessed: Date.now(),
    });
  }

  /**
   * Delete value from cache
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    if (this.store.size === 0) return;

    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.store.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
    }
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, entry] of this.store.entries()) {
        if (entry.expiresAt < now) {
          this.store.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        Logger.info('Cache', `Automated Garbage Collection: Successfully purged ${cleaned} expired entries from memory.`);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Stop cleanup interval
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Use Symbol.for() to ensure single instance across HMR/hot reload
const CACHE_KEY = Symbol.for('app.memory.cache');

const globalStore = globalThis as unknown as {
  [CACHE_KEY]?: MemoryCache;
};

function getMemoryCache(): MemoryCache {
  if (!globalStore[CACHE_KEY]) {
    globalStore[CACHE_KEY] = new MemoryCache(10000);
    Logger.success('Cache', 'Core MemoryCache subsystem initialized with 10,000 slots capacity.');
  }
  return globalStore[CACHE_KEY];
}

export const memoryCache = getMemoryCache();
