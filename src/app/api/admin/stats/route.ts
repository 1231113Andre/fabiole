import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/security/session";

async function checkAdmin() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');

    if (!sessionCookie) return null;

    const session = await verifySession(sessionCookie.value);
    if (!session?.email) return null;

    const user = await db.user.findUnique({
        where: { email: session.email },
        select: { role: true }
    });

    return user?.role === 'ADMINISTRATOR' ? session : null;
}

export async function GET() {
    const admin = await checkAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

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
                birth: true,
                createdAt: true,
                avatarUrl: true,
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

        const formattedUsers = users.map(u => ({
            id: u.id,
            name: u.name,
            surname: u.surname,
            email: u.email,
            role: u.role,
            birth: u.birth?.toISOString() || '',
            createdAt: u.createdAt?.toISOString() || '',
            avatarUrl: u.avatarUrl,
            pesagensCount: u._count.pesagens,
            perimetrosCount: u._count.perimetros,
            avaliacoesCount: u._count.avaliacoes
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

        const formattedRecentSignups = recentSignups.map(u => ({
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
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
