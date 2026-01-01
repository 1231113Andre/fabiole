/**
 * @fileoverview Admin data caching
 * @description Caches admin dashboard data with short TTL for freshness
 */

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
 * Cache TTLs (in milliseconds)
 * Short TTLs to balance freshness vs performance
 */
const ADMIN_TTL = {
    STATS: 30 * 1000,           // 30 seconds - aggregate counts change less often
    USERS_LIST: 30 * 1000,      // 30 seconds - user list
    RECENT_DATA: 15 * 1000,     // 15 seconds - recent activity should be fresh
    USER_DETAIL: 10 * 1000,     // 10 seconds - individual user detail (needs freshness for edits)
    DASHBOARD: 15 * 1000,       // 15 seconds - combined dashboard data
};

// ============================================================================
// GETTERS
// ============================================================================

export function getAdminStats<T>(): T | null {
    return memoryCache.get<T>(AdminCacheKeys.stats());
}

export function getAdminUsers<T>(): T | null {
    return memoryCache.get<T>(AdminCacheKeys.users());
}

export function getRecentSignups<T>(): T | null {
    return memoryCache.get<T>(AdminCacheKeys.recentSignups());
}

export function getRecentPesagens<T>(): T | null {
    return memoryCache.get<T>(AdminCacheKeys.recentPesagens());
}

export function getAdminUserDetail<T>(userId: string): T | null {
    return memoryCache.get<T>(AdminCacheKeys.userDetail(userId));
}

export function getAdminDashboardData<T>(): T | null {
    return memoryCache.get<T>(AdminCacheKeys.dashboardData());
}

// ============================================================================
// SETTERS
// ============================================================================

export function setAdminStats<T>(data: T): void {
    memoryCache.set(AdminCacheKeys.stats(), data, ADMIN_TTL.STATS);
}

export function setAdminUsers<T>(data: T): void {
    memoryCache.set(AdminCacheKeys.users(), data, ADMIN_TTL.USERS_LIST);
}

export function setRecentSignups<T>(data: T): void {
    memoryCache.set(AdminCacheKeys.recentSignups(), data, ADMIN_TTL.RECENT_DATA);
}

export function setRecentPesagens<T>(data: T): void {
    memoryCache.set(AdminCacheKeys.recentPesagens(), data, ADMIN_TTL.RECENT_DATA);
}

export function setAdminUserDetail<T>(userId: string, data: T): void {
    memoryCache.set(AdminCacheKeys.userDetail(userId), data, ADMIN_TTL.USER_DETAIL);
}

export function setAdminDashboardData<T>(data: T): void {
    memoryCache.set(AdminCacheKeys.dashboardData(), data, ADMIN_TTL.DASHBOARD);
}

// ============================================================================
// INVALIDATION
// ============================================================================

/**
 * Clear stats cache (when users/data changes)
 */
export function invalidateAdminStats(): void {
    memoryCache.delete(AdminCacheKeys.stats());
    memoryCache.delete(AdminCacheKeys.dashboardData());
    Logger.info('AdminCache', 'Stats cache invalidated');
}

/**
 * Clear users list cache
 */
export function invalidateAdminUsers(): void {
    memoryCache.delete(AdminCacheKeys.users());
    memoryCache.delete(AdminCacheKeys.recentSignups());
    memoryCache.delete(AdminCacheKeys.dashboardData());
    Logger.info('AdminCache', 'Users cache invalidated');
}

/**
 * Clear specific user detail cache
 */
export function invalidateAdminUserDetail(userId: string): void {
    memoryCache.delete(AdminCacheKeys.userDetail(userId));
    Logger.info('AdminCache', `User detail cache invalidated: ${userId}`);
}

/**
 * Clear pesagens cache
 */
export function invalidatePesagensCache(): void {
    memoryCache.delete(AdminCacheKeys.recentPesagens());
    memoryCache.delete(AdminCacheKeys.stats());
    memoryCache.delete(AdminCacheKeys.dashboardData());
    Logger.info('AdminCache', 'Pesagens cache invalidated');
}

/**
 * Clear perimetros cache
 */
export function invalidatePerimetrosCache(): void {
    memoryCache.delete(AdminCacheKeys.stats());
    memoryCache.delete(AdminCacheKeys.dashboardData());
    Logger.info('AdminCache', 'Perimetros cache invalidated');
}

/**
 * Clear avaliacoes cache
 */
export function invalidateAvaliacoesCache(): void {
    memoryCache.delete(AdminCacheKeys.stats());
    memoryCache.delete(AdminCacheKeys.dashboardData());
    Logger.info('AdminCache', 'Avaliacoes cache invalidated');
}

/**
 * Clear all admin caches (for major data changes)
 */
export function invalidateAllAdminCache(): void {
    memoryCache.delete(AdminCacheKeys.stats());
    memoryCache.delete(AdminCacheKeys.users());
    memoryCache.delete(AdminCacheKeys.recentSignups());
    memoryCache.delete(AdminCacheKeys.recentPesagens());
    memoryCache.delete(AdminCacheKeys.dashboardData());
    // Note: user details have their own TTL and will expire naturally
    Logger.info('AdminCache', 'All admin caches invalidated');
}

