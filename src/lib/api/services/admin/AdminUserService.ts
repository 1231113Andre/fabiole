import { db } from '@/lib/db/client';
import { AdminUser, RecentUser } from '@/app/admin/types';
import { Logger } from '@/lib/utils/logger';
import {
    getAdminUsers,
    setAdminUsers,
    getRecentSignups,
    setRecentSignups,
    getAdminUserDetail,
    setAdminUserDetail
} from '@/lib/cache/adminCache';

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

export class AdminUserService {
    /**
     * Get all users with measurement counts and financial status
     * Uses short-lived cache for performance
     */
    static async getAllUsers(): Promise<AdminUser[]> {
        // Check cache first
        const cached = getAdminUsers<AdminUser[]>();
        if (cached) {
            Logger.info('AdminUsers', 'Cache hit: returning cached user list');
            return cached;
        }

        Logger.info('AdminService', 'Initiating fetching of the complete master user directory.');
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

        const result = users.map(u => ({
            id: u.id,
            name: u.name,
            surname: u.surname,
            email: u.email,
            role: u.role,
            gender: u.gender ?? null,
            birth: u.birth?.toISOString() ?? '',
            createdAt: u.createdAt?.toISOString() ?? '',
            avatarUrl: u.avatarUrl,
            pesagensCount: u._count.pesagens,
            perimetrosCount: u._count.perimetros,
            avaliacoesCount: u._count.avaliacoes,
            trainingCredit: u.trainingCredit ? Number(u.trainingCredit) : 0,
            trainingsScheduled: u.trainingsScheduled ?? 0,
            debtValue: u.debtValue ? Number(u.debtValue) : 0
        }));

        // Cache for next requests
        setAdminUsers(result);

        return result;
    }

    /**
     * Get recent signups
     * Uses short-lived cache for performance
     */
    static async getRecentSignups(limit: number = 5): Promise<RecentUser[]> {
        // Check cache first
        const cached = getRecentSignups<RecentUser[]>();
        if (cached) {
            Logger.info('AdminUsers', 'Cache hit: returning cached recent signups');
            return cached;
        }

        const recentSignups = await db.user.findMany({
            take: limit,
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

        const result = recentSignups.map(u => ({
            id: u.id,
            name: u.name,
            surname: u.surname,
            email: u.email,
            createdAt: u.createdAt.toISOString(),
            role: u.role,
            birth: u.birth?.toISOString() ?? null,
            avatarUrl: u.avatarUrl
        }));

        // Cache for next requests
        setRecentSignups(result);

        return result;
    }

    /**
     * Get detailed user information by ID
     * Uses short-lived cache (10s) for balance between freshness and performance
     */
    static async getUserById(userId: string): Promise<AdminUserDetail | null> {
        // Check cache first
        const cached = getAdminUserDetail<AdminUserDetail>(userId);
        if (cached) {
            Logger.info('AdminUsers', `Cache hit: returning cached user detail for ${userId}`);
            return cached;
        }

        Logger.info('AdminService', `Extracting comprehensive profile details for User ID: ${userId}.`);
        const user = await db.user.findUnique({
            where: { id: userId },
            include: {
                pesagens: { orderBy: { date: 'desc' } },
                perimetros: { orderBy: { date: 'desc' } },
                avaliacoes: { orderBy: { date: 'desc' } }
            }
        });

        if (!user) return null;

        const result: AdminUserDetail = {
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
            pesagens: user.pesagens.map(p => ({
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
            perimetros: user.perimetros.map(p => ({
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
            avaliacoes: user.avaliacoes.map(a => ({
                id: a.id,
                date: a.date.toISOString(),
                pushUps: a.pushUps,
                sitUps: a.sitUps,
                mile: a.mile,
                mileResult: a.mileResult,
                notes: a.notes
            }))
        };

        // Cache for next requests
        setAdminUserDetail(userId, result);

        return result;
    }
}
