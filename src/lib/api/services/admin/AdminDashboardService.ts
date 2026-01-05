import { db } from '@/lib/db/client';
import { AdminStatsData, RecentPesagem } from '@/app/admin/types';
import { AdminStatsService } from './AdminStatsService';
import { AdminUserService } from './AdminUserService';
import { Logger } from '@/lib/utils/logger';
import {
    getAdminDashboardData,
    setAdminDashboardData,
    getRecentPesagens,
    setRecentPesagens
} from '@/lib/cache/adminCache';

export class AdminDashboardService {
    /**
     * Get all data required for the admin dashboard in parallel
     * Uses short-lived cache for combined dashboard data
     */
    static async getDashboardData(): Promise<AdminStatsData> {
        // Check cache for complete dashboard data
        const cached = await getAdminDashboardData<AdminStatsData>();
        if (cached) {
            Logger.info('AdminDashboard', 'Cache hit: returning cached dashboard data');
            return cached;
        }

        Logger.info('AdminService', 'Orchestrating parallel synchronization of multi-module dashboard metrics.');
        const [stats, users, recentSignups, recentPesagens] = await Promise.all([
            AdminStatsService.getStats(),
            AdminUserService.getAllUsers(),
            AdminUserService.getRecentSignups(),
            AdminDashboardService.getRecentPesagens()
        ]);

        const result = { stats, users, recentSignups, recentPesagens };

        // Cache for next requests
        await setAdminDashboardData(result);

        return result;
    }

    /**
     * Get recent weigh-ins with user info
     * Uses short-lived cache for performance
     */
    static async getRecentPesagens(limit: number = 5): Promise<RecentPesagem[]> {
        // Check cache first
        const cached = await getRecentPesagens<RecentPesagem[]>();
        if (cached) {
            Logger.info('AdminDashboard', 'Cache hit: returning cached recent pesagens');
            return cached;
        }

        const recentPesagens = await db.pesagem.findMany({
            take: limit,
            where: { peso: { not: null } },
            orderBy: { date: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        avatarUrl: true,
                        role: true,
                        birth: true
                    }
                }
            }
        });

        const result = recentPesagens.map(p => ({
            id: p.id,
            userId: p.user_uuid,
            date: p.date.toISOString(),
            peso: p.peso ? Number(p.peso) : null,
            userName: p.user?.name ?? '',
            userSurname: p.user?.surname ?? '',
            avatarUrl: p.user?.avatarUrl ?? null,
            userRole: p.user?.role ?? '',
            userBirth: p.user?.birth?.toISOString() ?? null
        }));

        // Cache for next requests
        await setRecentPesagens(result);

        return result;
    }
}
