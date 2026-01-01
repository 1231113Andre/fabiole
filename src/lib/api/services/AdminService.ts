import { db } from '@/lib/db/client';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/security/session';
import { redirect } from 'next/navigation';
import { AdminStatsService } from './admin/AdminStatsService';
import { AdminUserService, AdminUserDetail as AdminUserDetailType } from './admin/AdminUserService';
import { AdminDashboardService } from './admin/AdminDashboardService';
import {
    AdminStatsData as AdminStatsDataType,
    AdminStats as AdminStatsType,
    AdminUser as AdminUserType,
    RecentPesagem as RecentPesagemType,
    RecentUser as RecentUserType
} from '@/app/admin/types';

// Re-export types for backward compatibility
export type AdminUser = AdminUserType;
export type AdminStats = AdminStatsType;
export type RecentPesagem = RecentPesagemType;
export type RecentUser = RecentUserType;
export type AdminDashboardData = AdminStatsDataType;
export type AdminUserDetail = AdminUserDetailType;

// ============================================================================
// AUTH
// ============================================================================

/**
 * Verify admin access on the server
 * Throws redirect to dashboard if not admin
 */
export async function verifyAdminAccess(): Promise<{ email: string }> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');

    if (!sessionCookie) {
        redirect('/');
    }

    const session = await verifySession(sessionCookie.value);
    if (!session?.email) {
        redirect('/');
    }

    const user = await db.user.findUnique({
        where: { email: session.email },
        select: { role: true }
    });

    if (user?.role !== 'ADMINISTRATOR') {
        redirect('/dashboard');
    }

    return { email: session.email };
}

// ============================================================================
// FACADE METHODS (Backward Compatibility)
// ============================================================================

/**
 * Get all admin dashboard data in a single query
 */
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
    await verifyAdminAccess();
    return AdminDashboardService.getDashboardData();
}

/**
 * Get admin statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
    return AdminStatsService.getStats();
}

/**
 * Get all users with measurement counts
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
    return AdminUserService.getAllUsers();
}

/**
 * Get recent signups
 */
export async function getRecentSignups(): Promise<RecentUser[]> {
    return AdminUserService.getRecentSignups();
}

/**
 * Get recent pesagens
 */
export async function getRecentPesagens(): Promise<RecentPesagem[]> {
    return AdminDashboardService.getRecentPesagens();
}

/**
 * Get single user with all measurements for SSR
 */
export async function getAdminUserById(userId: string): Promise<AdminUserDetail | null> {
    await verifyAdminAccess();
    return AdminUserService.getUserById(userId);
}

