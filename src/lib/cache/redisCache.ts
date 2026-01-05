/**
 * @fileoverview Redis cache wrapper with automatic fallback
 * @description Unified cache interface that uses Redis when available,
 *              falls back to in-memory cache when Redis is unavailable
 */

import { getRedisClient, isRedisEnabled } from './redis';
import { memoryCache } from './memoryCache';
import { Logger } from '@/lib/utils/logger';
import type Redis from 'ioredis';

const REDIS_CACHE_PREFIX = 'fabiole:cache:';

/**
 * Get a ready Redis client or null
 */
function getReadyRedis(): Redis | null {
    if (!isRedisEnabled()) {
        return null;
    }

    const redis = getRedisClient();
    if (!redis) {
        return null;
    }

    return redis;
}

/**
 * Scan Redis keys matching a pattern (non-blocking alternative to KEYS)
 * Uses SCAN iterator to avoid blocking Redis server
 * @param redis - Redis client instance
 * @param pattern - Pattern to match (e.g., "fabiole:cache:admin:*")
 * @returns Array of matching keys
 */
export async function scanKeys(redis: Redis, pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';
    const maxIterations = 1000; // Safety limit to prevent infinite loops
    let iterations = 0;

    try {
        do {
            const result = await redis.scan(
                cursor,
                'MATCH',
                pattern,
                'COUNT',
                100 // Scan 100 keys per iteration for better performance
            );
            cursor = result[0];
            keys.push(...result[1]);
            iterations++;

            // Safety check to prevent infinite loops
            if (iterations > maxIterations) {
                Logger.warn('RedisCache', `SCAN iteration limit reached for pattern: ${pattern}`);
                break;
            }
        } while (cursor !== '0');

        return keys;
    } catch (error) {
        Logger.error('RedisCache', `SCAN failed for pattern: ${pattern}`, error);
        // Return empty array on error - better than throwing
        return [];
    }
}

/**
 * Redis cache with automatic fallback to memory cache
 */
export const redisCache = {
    /**
     * Get value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        const redis = getReadyRedis();

        if (redis) {
            try {
                const data = await redis.get(`${REDIS_CACHE_PREFIX}${key}`);
                if (!data) return null;
                try {
                    return JSON.parse(data) as T;
                } catch (parseError) {
                    Logger.error('RedisCache', `Failed to parse cached data for key ${key}`, parseError);
                    // Delete corrupted cache entry
                    await redis.del(`${REDIS_CACHE_PREFIX}${key}`).catch(() => {});
                    return null;
                }
            } catch (error) {
                Logger.error('RedisCache', `Failed to get key ${key}, falling back to memory.`, error);
                // Fall through to memory cache fallback
            }
        }

        // Fallback to memory cache
        return memoryCache.get<T>(key);
    },

    /**
     * Set value in cache with TTL
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttlSeconds - Time to live in seconds
     */
    async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
        const redis = getReadyRedis();

        if (redis) {
            try {
                await redis.set(
                    `${REDIS_CACHE_PREFIX}${key}`,
                    JSON.stringify(value),
                    'EX',
                    ttlSeconds
                );
                return;
            } catch (error) {
                Logger.error('RedisCache', `Failed to set key ${key}, falling back to memory.`, error);
            }
        }

        // Fallback to memory cache
        memoryCache.set(key, value, ttlSeconds * 1000);
    },

    /**
     * Delete value from cache
     */
    async delete(key: string): Promise<void> {
        const redis = getReadyRedis();

        if (redis) {
            try {
                await redis.del(`${REDIS_CACHE_PREFIX}${key}`);
            } catch (error) {
                Logger.error('RedisCache', `Failed to delete key ${key} from Redis, will delete from memory cache.`, error);
                // Fall through to memory cache deletion
            }
        }

        // Always delete from memory cache (even if Redis deletion fails)
        memoryCache.delete(key);
    },

    /**
     * Delete all keys matching a pattern
     * Uses SCAN iterator (non-blocking) instead of KEYS command
     * @param pattern - Pattern to match (e.g., "admin:*")
     */
    async deletePattern(pattern: string): Promise<number> {
        const redis = getReadyRedis();
        let deleted = 0;

        if (redis) {
            try {
                // Use SCAN instead of KEYS to avoid blocking Redis
                const keys = await scanKeys(redis, `${REDIS_CACHE_PREFIX}${pattern}`);
                if (keys.length > 0) {
                    // Delete in batches to avoid too many arguments
                    const batchSize = 100;
                    for (let i = 0; i < keys.length; i += batchSize) {
                        const batch = keys.slice(i, i + batchSize);
                        try {
                            const batchDeleted = await redis.del(...batch);
                            deleted += batchDeleted;
                        } catch (batchError) {
                            Logger.error('RedisCache', `Failed to delete batch of keys for pattern ${pattern}`, batchError);
                            // Continue with next batch even if one fails
                        }
                    }
                }
            } catch (error) {
                Logger.error('RedisCache', `Failed to delete pattern ${pattern}.`, error);
                // Return partial count if available
            }
        }

        // Note: memoryCache doesn't support pattern deletion
        // Individual keys need to be deleted manually
        return deleted;
    },

    /**
     * Check if Redis is available
     */
    isRedisAvailable(): boolean {
        return getReadyRedis() !== null;
    },

    /**
     * Ping Redis to check connection latency
     * Returns string response (e.g., "PONG") or null if failed
     */
    async ping(): Promise<string | null> {
        const redis = getReadyRedis();
        if (redis) {
            try {
                return await redis.ping();
            } catch (error) {
                Logger.error('RedisCache', 'Ping failed.', error);
            }
        }
        return null;
    },
};

// ============================================================================
// RATE LIMITING SPECIFIC - Atomic operations with Lua scripts
// ============================================================================

const RATE_LIMIT_PREFIX = 'fabiole:ratelimit:';

/**
 * Lua script for atomic rate limit check and increment
 * Returns: [allowed (0/1), count, resetTime, retryAfterSeconds]
 */
const RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local maxRequests = tonumber(ARGV[2])
local windowMs = tonumber(ARGV[3])

local data = redis.call('GET', key)
local entry

if data then
  entry = cjson.decode(data)
  -- Check if window expired
  if entry.resetTime < now then
    entry = {count = 1, resetTime = now + windowMs}
  else
    entry.count = entry.count + 1
  end
else
  entry = {count = 1, resetTime = now + windowMs}
end

-- Calculate TTL (time until window resets)
local ttl = math.ceil((entry.resetTime - now) / 1000)
if ttl < 1 then ttl = 1 end

redis.call('SET', key, cjson.encode(entry), 'EX', ttl)

local allowed = entry.count <= maxRequests and 1 or 0
local retryAfter = allowed == 1 and 0 or math.ceil((entry.resetTime - now) / 1000)

return {allowed, entry.count, entry.resetTime, retryAfter}
`;

export interface RateLimitResult {
    allowed: boolean;
    count: number;
    retryAfter?: number;
}

/**
 * Check rate limit using Redis (atomic operation)
 * Falls back to in-memory if Redis unavailable
 */
export async function checkRateLimitRedis(
    clientId: string,
    maxRequests: number,
    windowMs: number
): Promise<RateLimitResult> {
    const redis = getReadyRedis();
    const now = Date.now();

    if (redis) {
        try {
            const result = await redis.eval(
                RATE_LIMIT_SCRIPT,
                1,
                `${RATE_LIMIT_PREFIX}${clientId}`,
                now.toString(),
                maxRequests.toString(),
                windowMs.toString()
            ) as [number, number, number, number];

            return {
                allowed: result[0] === 1,
                count: result[1],
                retryAfter: result[3] > 0 ? result[3] : undefined,
            };
        } catch (error) {
            Logger.error('RedisCache', 'Rate limit Redis error, falling back to memory.', error);
        }
    }

    // Fallback: return allowed (fail-open for rate limiting)
    // In production without Redis, in-memory rate limiting in rateLimit.ts will handle this
    return { allowed: true, count: 0 };
}

// ============================================================================
// SESSION CACHE SPECIFIC
// ============================================================================

const SESSION_PREFIX = 'fabiole:session:';
const SESSION_TTL_SECONDS = 30; // 30 seconds cache

/**
 * Get cached session from Redis
 */
export async function getCachedSessionRedis<T>(tokenHash: string): Promise<T | null> {
    const redis = getReadyRedis();

    if (redis) {
        try {
            const data = await redis.get(`${SESSION_PREFIX}${tokenHash}`);
            if (data) {
                return JSON.parse(data) as T;
            }
        } catch (error) {
            Logger.error('RedisCache', 'Session cache get error.', error);
        }
    }

    return null;
}

/**
 * Set cached session in Redis
 */
export async function setCachedSessionRedis<T>(tokenHash: string, payload: T): Promise<void> {
    const redis = getReadyRedis();

    if (redis) {
        try {
            await redis.set(
                `${SESSION_PREFIX}${tokenHash}`,
                JSON.stringify(payload),
                'EX',
                SESSION_TTL_SECONDS
            );
        } catch (error) {
            Logger.error('RedisCache', 'Session cache set error.', error);
        }
    }
}

/**
 * Clear cached session from Redis
 */
export async function clearCachedSessionRedis(tokenHash: string): Promise<void> {
    const redis = getReadyRedis();

    if (redis) {
        try {
            await redis.del(`${SESSION_PREFIX}${tokenHash}`);
        } catch (error) {
            Logger.error('RedisCache', 'Session cache delete error.', error);
        }
    }
}

/**
 * Invalidate all sessions for a user (force logout from all devices)
 * @param userEmail - User email to invalidate
 */
export async function invalidateUserSessions(userEmail: string): Promise<number> {
    const redis = getReadyRedis();

    if (redis) {
        try {
            // Note: This requires sessions to include user identifier in key or value
            // For now, we can't efficiently invalidate by user without scanning
            // This is a limitation - would need to store user->sessions mapping
            Logger.warn('RedisCache', `Session invalidation for ${userEmail} requested but not fully implemented.`);
            return 0;
        } catch (error) {
            Logger.error('RedisCache', 'Failed to invalidate user sessions.', error);
        }
    }

    return 0;
}
