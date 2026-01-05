/**
 * @fileoverview User role caching
 * @description Caches user roles to avoid DB queries on every admin request
 */

import { redisCache } from './redisCache';
import { memoryCache } from './memoryCache';
import { db } from '@/lib/db/client';
import { Logger } from '@/lib/utils/logger';

const ROLE_CACHE_TTL_SECONDS = 300; // 5 minutes
const ROLE_CACHE_TTL_MS = 300 * 1000;

/**
 * Get user role with caching
 * Checks Redis → Memory → DB
 */
export async function getUserRole(userId: string): Promise<string | null> {
    const key = `user:role:${userId}`;

    // Try Redis first
    const redisRole = await redisCache.get<string>(key);
    if (redisRole) {
        return redisRole;
    }

    // Try memory cache
    const memRole = memoryCache.get<string>(key);
    if (memRole) {
        return memRole;
    }

    // DB fallback
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (user?.role) {
        // Cache in both Redis and memory
        await redisCache.set(key, user.role, ROLE_CACHE_TTL_SECONDS);
        memoryCache.set(key, user.role, ROLE_CACHE_TTL_MS);
        Logger.info('RoleCache', `Cached role for user ${userId}: ${user.role}`);
    }

    return user?.role || null;
}

/**
 * Check if user is administrator (cached)
 */
export async function isAdmin(userId: string): Promise<boolean> {
    const role = await getUserRole(userId);
    return role === 'ADMINISTRATOR';
}

/**
 * Invalidate user role cache
 * Call this when role is updated
 */
export async function invalidateUserRole(userId: string): Promise<void> {
    const key = `user:role:${userId}`;
    await redisCache.delete(key);
    memoryCache.delete(key);
    Logger.info('RoleCache', `Invalidated role cache for user ${userId}`);
}
