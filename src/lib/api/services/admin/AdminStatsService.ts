import { db } from '@/lib/db/client';
import { AdminStats } from '@/app/admin/types';

export class AdminStatsService {
    /**
     * Get aggregate statistics for the admin dashboard
     */
    static async getStats(): Promise<AdminStats> {
        const [totalUsers, totalPesagens, totalPerimetros, totalAvaliacoes] = await Promise.all([
            db.user.count(),
            db.pesagem.count(),
            db.perimetroCorporal.count(),
            db.avaliacaoFisica.count()
        ]);

        return {
            totalUsers,
            totalPesagens,
            totalPerimetros,
            totalAvaliacoes
        };
    }
}
