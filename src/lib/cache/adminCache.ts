/**
 * @fileoverview Admin data caching
 * @description Caches admin dashboard data using Redis with memory fallback
 */

import { redisCache } from './redisCache';
import { memoryCache } from './memoryCache';
import { Logger } from '@/lib/utils/logger';

/**
 * Cache keys for admin data
 */
const AdminCacheKeys = {
    stats: () => 'admin:stats',
    users: () => 'admin:users',
    recentSignups: () => 'admin:recent:signups',
    recentPesagens: () => 'admin:recent:pesagens',
    userDetail: (userId: string) => `admin:user:${userId}`,
    dashboardData: () => 'admin:dashboard:all',
};

/**
 * Cache TTLs (in seconds for Redis, milliseconds for memory)
 */
const ADMIN_TTL = {
    STATS: 30,              // 30 seconds
    USERS_LIST: 30,         // 30 seconds
    RECENT_DATA: 15,        // 15 seconds
    USER_DETAIL: 10,        // 10 seconds
    DASHBOARD: 15,          // 15 seconds
};

// ============================================================================
// GETTERS (async for Redis)
// ============================================================================

export async function getAdminStats<T>(): Promise<T | null> {
    return redisCache.get<T>(AdminCacheKeys.stats());
}

export async function getAdminUsers<T>(): Promise<T | null> {
    return redisCache.get<T>(AdminCacheKeys.users());
}

export async function getRecentSignups<T>(): Promise<T | null> {
    return redisCache.get<T>(AdminCacheKeys.recentSignups());
}

export async function getRecentPesagens<T>(): Promise<T | null> {
    return redisCache.get<T>(AdminCacheKeys.recentPesagens());
}

export async function getAdminUserDetail<T>(userId: string): Promise<T | null> {
    return redisCache.get<T>(AdminCacheKeys.userDetail(userId));
}

export async function getAdminDashboardData<T>(): Promise<T | null> {
    return redisCache.get<T>(AdminCacheKeys.dashboardData());
}

// ============================================================================
// SETTERS (async for Redis)
// ============================================================================

export async function setAdminStats<T>(data: T): Promise<void> {
    await redisCache.set(AdminCacheKeys.stats(), data, ADMIN_TTL.STATS);
}

export async function setAdminUsers<T>(data: T): Promise<void> {
    await redisCache.set(AdminCacheKeys.users(), data, ADMIN_TTL.USERS_LIST);
}

export async function setRecentSignups<T>(data: T): Promise<void> {
    await redisCache.set(AdminCacheKeys.recentSignups(), data, ADMIN_TTL.RECENT_DATA);
}

export async function setRecentPesagens<T>(data: T): Promise<void> {
    await redisCache.set(AdminCacheKeys.recentPesagens(), data, ADMIN_TTL.RECENT_DATA);
}

export async function setAdminUserDetail<T>(userId: string, data: T): Promise<void> {
    await redisCache.set(AdminCacheKeys.userDetail(userId), data, ADMIN_TTL.USER_DETAIL);
}

export async function setAdminDashboardData<T>(data: T): Promise<void> {
    await redisCache.set(AdminCacheKeys.dashboardData(), data, ADMIN_TTL.DASHBOARD);
}

// ============================================================================
// INVALIDATION
// ============================================================================

/**
 * Clear stats cache (when users/data changes)
 */
export async function invalidateAdminStats(): Promise<void> {
    await redisCache.delete(AdminCacheKeys.stats());
    await redisCache.delete(AdminCacheKeys.dashboardData());
    Logger.info('AdminCache', 'Stats cache invalidated.');
}

/**
 * Clear users list cache
 */
export async function invalidateAdminUsers(): Promise<void> {
    await redisCache.delete(AdminCacheKeys.users());
    await redisCache.delete(AdminCacheKeys.recentSignups());
    await redisCache.delete(AdminCacheKeys.dashboardData());
    Logger.info('AdminCache', 'Users cache invalidated.');
}

/**
 * Clear specific user detail cache
 */
export async function invalidateAdminUserDetail(userId: string): Promise<void> {
    await redisCache.delete(AdminCacheKeys.userDetail(userId));
    Logger.info('AdminCache', `User detail cache invalidated: ${userId}.`);
}

/**
 * Clear pesagens cache
 */
export async function invalidatePesagensCache(): Promise<void> {
    await redisCache.delete(AdminCacheKeys.recentPesagens());
    await redisCache.delete(AdminCacheKeys.stats());
    await redisCache.delete(AdminCacheKeys.dashboardData());
    Logger.info('AdminCache', 'Pesagens cache invalidated.');
}

/**
 * Clear perimetros cache
 */
export async function invalidatePerimetrosCache(): Promise<void> {
    await redisCache.delete(AdminCacheKeys.stats());
    await redisCache.delete(AdminCacheKeys.dashboardData());
    Logger.info('AdminCache', 'Perimetros cache invalidated.');
}

/**
 * Clear avaliacoes cache
 */
export async function invalidateAvaliacoesCache(): Promise<void> {
    await redisCache.delete(AdminCacheKeys.stats());
    await redisCache.delete(AdminCacheKeys.dashboardData());
    Logger.info('AdminCache', 'Avaliacoes cache invalidated.');
}

/**
 * Clear all admin caches (for major data changes)
 */
export async function invalidateAllAdminCache(): Promise<void> {
    await redisCache.deletePattern('admin:*');
    // Also clear memory cache
    memoryCache.clear();
    Logger.info('AdminCache', 'All admin caches invalidated.');
}
