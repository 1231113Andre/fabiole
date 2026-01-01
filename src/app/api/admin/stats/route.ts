import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { Logger } from "@/lib/utils/logger";

export const GET = withAdminAuth(async (req, session) => {
    try {
        // Get stats
        const [totalUsers, totalPesagens, totalPerimetros, totalAvaliacoes] = await Promise.all([
            db.user.count(),
            db.pesagem.count(),
            db.perimetroCorporal.count(),
            db.avaliacaoFisica.count()
        ]);

        // Get users with counts
        const users = await db.user.findMany({
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                role: true,
                gender: true,
                birth: true,
                createdAt: true,
                avatarUrl: true,
                trainingCredit: true,
                trainingsScheduled: true,
                debtValue: true,
                _count: {
                    select: {
                        pesagens: true,
                        perimetros: true,
                        avaliacoes: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Get recent signups
        const recentSignups = await db.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                createdAt: true,
                role: true,
                birth: true,
                avatarUrl: true
            }
        });

        // Get recent measurements (Pesagens) - only those with peso value
        const recentPesagens = await db.pesagem.findMany({
            take: 5,
            where: {
                peso: { not: null }
            },
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

        const formattedUsers = users.map((u: typeof users[number]) => ({
            id: u.id,
            name: u.name,
            surname: u.surname,
            email: u.email,
            role: u.role,
            gender: u.gender ?? null,
            birth: u.birth?.toISOString() || '',
            createdAt: u.createdAt?.toISOString() || '',
            avatarUrl: u.avatarUrl,
            pesagensCount: u._count.pesagens,
            perimetrosCount: u._count.perimetros,
            avaliacoesCount: u._count.avaliacoes,
            trainingCredit: u.trainingCredit ? Number(u.trainingCredit) : 0,
            trainingsScheduled: u.trainingsScheduled ?? 0,
            debtValue: u.debtValue ? Number(u.debtValue) : 0,
        }));

        const formattedRecentPesagens = recentPesagens.map((p: any) => ({
            id: p.id,
            userId: p.user_uuid,
            date: p.date.toISOString(),
            peso: p.peso,
            userName: p.user?.name,
            userSurname: p.user?.surname,
            avatarUrl: p.user?.avatarUrl,
            userRole: p.user?.role,
            userBirth: p.user?.birth?.toISOString() || null
        }));

        const formattedRecentSignups = recentSignups.map((u: typeof recentSignups[number]) => ({
            ...u,
            createdAt: u.createdAt.toISOString(),
            birth: u.birth ? u.birth.toISOString() : null
        }));

        return NextResponse.json({
            stats: {
                totalUsers,
                totalPesagens,
                totalPerimetros,
                totalAvaliacoes
            },
            users: formattedUsers,
            recentSignups: formattedRecentSignups,
            recentPesagens: formattedRecentPesagens
        });
    } catch (error) {
        Logger.error('AdminService', 'Analytics Synchronization Failure: A critical exception occurred while compiling master dashboard statistics and user metrics.', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
});
