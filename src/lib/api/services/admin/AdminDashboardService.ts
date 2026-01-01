import { db } from '@/lib/db/client';
import { AdminStatsData, RecentPesagem } from '@/app/admin/types';
import { AdminStatsService } from './AdminStatsService';
import { AdminUserService } from './AdminUserService';
import { Logger } from '@/lib/utils/logger';

export class AdminDashboardService {
    /**
     * Get all data required for the admin dashboard in parallel
     */
    static async getDashboardData(): Promise<AdminStatsData> {
        Logger.info('AdminService', 'Orchestrating parallel synchronization of multi-module dashboard metrics.');
        const [stats, users, recentSignups, recentPesagens] = await Promise.all([
            AdminStatsService.getStats(),
            AdminUserService.getAllUsers(),
            AdminUserService.getRecentSignups(),
            AdminDashboardService.getRecentPesagens()
        ]);

        return { stats, users, recentSignups, recentPesagens };
    }

    /**
     * Get recent weigh-ins with user info
     */
    static async getRecentPesagens(limit: number = 5): Promise<RecentPesagem[]> {
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

        return recentPesagens.map(p => ({
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
    }
}
