import { db } from '@/lib/db/client';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/security/session';
import { redirect } from 'next/navigation';

// ============================================================================
// TYPES
// ============================================================================

export interface AdminUser {
    id: string;
    name: string;
    surname: string;
    email: string;
    role: string;
    birth: string;
    createdAt: string;
    avatarUrl: string | null;
    pesagensCount: number;
    perimetrosCount: number;
    avaliacoesCount: number;
}

export interface AdminStats {
    totalUsers: number;
    totalPesagens: number;
    totalPerimetros: number;
    totalAvaliacoes: number;
}

export interface RecentPesagem {
    id: number;
    userId: string;
    date: string;
    peso: number | null;
    userName: string;
    userSurname: string;
    avatarUrl: string | null;
    userRole: string;
    userBirth: string | null;
}

export interface RecentUser {
    id: string;
    name: string;
    surname: string;
    email: string;
    createdAt: string;
    role: string;
    birth: string | null;
    avatarUrl: string | null;
}

export interface AdminDashboardData {
    stats: AdminStats;
    users: AdminUser[];
    recentSignups: RecentUser[];
    recentPesagens: RecentPesagem[];
}

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
// DATA FETCHING
// ============================================================================

/**
 * Get all admin dashboard data in a single query
 * Used by SSR pages
 */
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
    // Verify admin access first
    await verifyAdminAccess();

    // Parallel queries for performance
    const [stats, users, recentSignups, recentPesagens] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getRecentSignups(),
        getRecentPesagens()
    ]);

    return { stats, users, recentSignups, recentPesagens };
}

/**
 * Get admin statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
    const [totalUsers, totalPesagens, totalPerimetros, totalAvaliacoes] = await Promise.all([
        db.user.count(),
        db.pesagem.count(),
        db.perimetroCorporal.count(),
        db.avaliacaoFisica.count()
    ]);

    return { totalUsers, totalPesagens, totalPerimetros, totalAvaliacoes };
}

/**
 * Get all users with measurement counts
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
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

    return users.map((u: typeof users[number]) => ({
        id: u.id,
        name: u.name,
        surname: u.surname,
        email: u.email,
        role: u.role,
        birth: u.birth?.toISOString() ?? '',
        createdAt: u.createdAt?.toISOString() ?? '',
        avatarUrl: u.avatarUrl,
        pesagensCount: u._count.pesagens,
        perimetrosCount: u._count.perimetros,
        avaliacoesCount: u._count.avaliacoes
    }));
}

/**
 * Get recent signups (last 5)
 */
export async function getRecentSignups(): Promise<RecentUser[]> {
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

    return recentSignups.map((u: typeof recentSignups[number]) => ({
        id: u.id,
        name: u.name,
        surname: u.surname,
        email: u.email,
        createdAt: u.createdAt.toISOString(),
        role: u.role,
        birth: u.birth?.toISOString() ?? null,
        avatarUrl: u.avatarUrl
    }));
}

/**
 * Get recent pesagens (last 5 with peso)
 */
export async function getRecentPesagens(): Promise<RecentPesagem[]> {
    const recentPesagens = await db.pesagem.findMany({
        take: 5,
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

    return recentPesagens.map((p: typeof recentPesagens[number]) => ({
        id: p.id,
        userId: p.user_uuid,
        date: p.date.toISOString(),
        peso: p.peso ? Number(p.peso) : null, // Convert Prisma Decimal to number
        userName: p.user?.name ?? '',
        userSurname: p.user?.surname ?? '',
        avatarUrl: p.user?.avatarUrl ?? null,
        userRole: p.user?.role ?? '',
        userBirth: p.user?.birth?.toISOString() ?? null
    }));
}

// ============================================================================
// SINGLE USER DATA (for SSR edit page)
// ============================================================================

export interface AdminUserDetail {
    id: string;
    name: string;
    surname: string;
    email: string;
    createdAt: string;
    phone: string;
    birth: string;
    role: string;
    gender: string;
    trainingCredit: number;
    trainingsScheduled: number;
    debtValue: number;
    goals: string;
    notes: string;
    paid: string;
    avatarUrl: string | null;
    updatedAt: string;
    pesagens: Array<{
        id: number;
        date: string;
        peso: number | null;
        percentualMG: number | null;
        mm: number | null;
        h2o: number | null;
        imc: number | null;
        gordVisceral: number | null;
        idMetabolica: number | null;
        massaOssea: number | null;
        height: number | null;
        resultadoIMC: string | null;
        resultadoPercentMG: string | null;
        notas: string | null;
    }>;
    perimetros: Array<{
        id: number;
        date: string;
        msRight: number | null;
        msRightFlex: number | null;
        msLeft: number | null;
        msLeftFlex: number | null;
        chest: number | null;
        waist: number | null;
        abdomen: number | null;
        hips: number | null;
        thighR: number | null;
        thighL: number | null;
    }>;
    avaliacoes: Array<{
        id: number;
        date: string;
        pushUps: number | null;
        sitUps: number | null;
        mile: string | null;
        mileResult: string | null;
        notes: string | null;
    }>;
}

/**
 * Get single user with all measurements for SSR
 */
export async function getAdminUserById(userId: string): Promise<AdminUserDetail | null> {
    await verifyAdminAccess();

    const user = await db.user.findUnique({
        where: { id: userId },
        include: {
            pesagens: { orderBy: { date: 'desc' } },
            perimetros: { orderBy: { date: 'desc' } },
            avaliacoes: { orderBy: { date: 'desc' } }
        }
    });

    if (!user) return null;

    return {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        phone: user.phone ?? '',
        birth: user.birth?.toISOString() ?? '',
        role: user.role,
        gender: user.gender ?? '',
        trainingCredit: user.trainingCredit ? Number(user.trainingCredit) : 0,
        trainingsScheduled: user.trainingsScheduled ?? 0,
        debtValue: user.debtValue ? Number(user.debtValue) : 0,
        goals: user.goals ?? '',
        notes: user.notes ?? '',
        paid: user.paid ?? 'PENDENTE',
        avatarUrl: user.avatarUrl,
        updatedAt: user.updatedAt.toISOString(),
        pesagens: user.pesagens.map((p: typeof user.pesagens[number]) => ({
            id: p.id,
            date: p.date.toISOString(),
            peso: p.peso ? Number(p.peso) : null,
            percentualMG: p.percentualMG ? Number(p.percentualMG) : null,
            mm: p.mm ? Number(p.mm) : null,
            h2o: p.h2o ? Number(p.h2o) : null,
            imc: p.imc ? Number(p.imc) : null,
            gordVisceral: p.gordVisceral ? Number(p.gordVisceral) : null,
            idMetabolica: p.idMetabolica ? Number(p.idMetabolica) : null,
            massaOssea: p.massaOssea ? Number(p.massaOssea) : null,
            height: p.height ? Number(p.height) : null,
            resultadoIMC: p.resultadoIMC,
            resultadoPercentMG: p.resultadoPercentMG,
            notas: p.notas
        })),
        perimetros: user.perimetros.map((p: typeof user.perimetros[number]) => ({
            id: p.id,
            date: p.date.toISOString(),
            msRight: p.msRight ? Number(p.msRight) : null,
            msRightFlex: p.msRightFlex ? Number(p.msRightFlex) : null,
            msLeft: p.msLeft ? Number(p.msLeft) : null,
            msLeftFlex: p.msLeftFlex ? Number(p.msLeftFlex) : null,
            chest: p.chest ? Number(p.chest) : null,
            waist: p.waist ? Number(p.waist) : null,
            abdomen: p.abdomen ? Number(p.abdomen) : null,
            hips: p.hips ? Number(p.hips) : null,
            thighR: p.thighR ? Number(p.thighR) : null,
            thighL: p.thighL ? Number(p.thighL) : null
        })),
        avaliacoes: user.avaliacoes.map((a: typeof user.avaliacoes[number]) => ({
            id: a.id,
            date: a.date.toISOString(),
            pushUps: a.pushUps,
            sitUps: a.sitUps,
            mile: a.mile,
            mileResult: a.mileResult,
            notes: a.notes
        }))
    };
}
