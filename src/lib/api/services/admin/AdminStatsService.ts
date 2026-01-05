import { db } from '@/lib/db/client';
import { AdminStats } from '@/app/admin/types';
import { getAdminStats, setAdminStats } from '@/lib/cache/adminCache';
import { Logger } from '@/lib/utils/logger';

export class AdminStatsService {
    /**
     * Get aggregate statistics for the admin dashboard
     * Uses short-lived cache for performance while maintaining freshness
     */
    static async getStats(): Promise<AdminStats> {
        // Check cache first
        const cached = await getAdminStats<AdminStats>();
        if (cached) {
            Logger.info('AdminStats', 'Cache hit: returning cached statistics');
            return cached;
        }

        Logger.info('AdminStats', 'Cache miss: fetching fresh statistics from database');

        const [totalUsers, totalPesagens, totalPerimetros, totalAvaliacoes, debtAgg] = await Promise.all([
            db.user.count(),
            db.pesagem.count(),
            db.perimetroCorporal.count(),
            db.avaliacaoFisica.count(),
            // Sum only positive debt
            db.user.aggregate({
                _sum: { debtValue: true },
                where: { debtValue: { gt: 0 } }
            })
        ]);

        const stats: AdminStats = {
            totalUsers,
            totalPesagens,
            totalPerimetros,
            totalAvaliacoes,
            totalDebt: debtAgg._sum.debtValue?.toNumber() || 0
        };

        // Cache for next requests
        await setAdminStats(stats);

        return stats;
    }
}
