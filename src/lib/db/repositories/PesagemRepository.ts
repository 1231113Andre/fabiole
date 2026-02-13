/**
 * @fileoverview Pesagem (weight tracking) repository
 * @description Handles weight measurement CRUD operations with Redis caching
 */

import { Pesagem, Prisma } from '@prisma/client';
import { BaseRepository, Result, PaginationParams, PaginatedResult } from './BaseRepository';
import { redisCache } from '@/lib/cache/redisCache';
import {
    getPesagemCacheKey,
    invalidatePesagemUserCache,
    REPOSITORY_CACHE_TTL
} from '@/lib/cache/repositoryCache';
import { invalidateAdminUserDetail } from '@/lib/cache/adminCache';
import { clearUserData } from '@/lib/cache/userCache';

/**
 * Pesagem creation DTO
 */
export interface CreatePesagemDTO {
    userId: string;
    date: Date;
    peso?: number;
    percentualMG?: number;
    mm?: number;
    h2o?: number;
    imc?: number;
    gordVisceral?: number;
    idMetabolica?: number;
    massaOssea?: number;
    height?: number;
    smi?: number;
    resultadoIMC?: string;
    resultadoPercentMG?: string;
    notas?: string;
    massaMuscularSuperior?: number;
    massaMuscularInferior?: number;
    msRight?: number;
    msLeft?: number;
    miRight?: number;
    miLeft?: number;
}

/**
 * Pesagem update DTO
 */
export type UpdatePesagemDTO = Partial<Omit<CreatePesagemDTO, 'userId'>>;

/**
 * Pesagem Repository
 */
export class PesagemRepository extends BaseRepository {
    private static instance: PesagemRepository;

    private constructor() {
        super();
    }

    static getInstance(): PesagemRepository {
        if (!PesagemRepository.instance) {
            PesagemRepository.instance = new PesagemRepository();
        }
        return PesagemRepository.instance;
    }

    /**
     * Create new pesagem record
     */
    async create(data: CreatePesagemDTO): Promise<Result<Pesagem>> {
        return this.execute(async () => {
            const result = await this.db.pesagem.create({
                data: {
                    user_uuid: data.userId,
                    date: data.date,
                    peso: data.peso,
                    percentualMG: data.percentualMG,
                    mm: data.mm,
                    h2o: data.h2o,
                    imc: data.imc,
                    gordVisceral: data.gordVisceral,
                    idMetabolica: data.idMetabolica,
                    massaOssea: data.massaOssea,
                    height: data.height,
                    smi: data.smi,
                    resultadoIMC: data.resultadoIMC,
                    resultadoPercentMG: data.resultadoPercentMG,
                    notas: data.notas,
                    massaMuscularSuperior: data.massaMuscularSuperior,
                    massaMuscularInferior: data.massaMuscularInferior,
                    msRight: data.msRight,
                    msLeft: data.msLeft,
                    miRight: data.miRight,
                    miLeft: data.miLeft,
                },
            });

            // Invalidate cache for this user
            await invalidatePesagemUserCache(data.userId);
            await invalidateAdminUserDetail(data.userId);

            // Also invalidate User Dashboard cache (requires email)
            const user = await this.db.user.findUnique({
                where: { id: data.userId },
                select: { email: true }
            });
            if (user?.email) {
                await clearUserData(user.email);
            }

            return result;
        });
    }

    /**
     * Create multiple pesagem records (bulk insert)
     */
    async createMany(records: CreatePesagemDTO[]): Promise<Result<number>> {
        return this.execute(async () => {
            const result = await this.db.pesagem.createMany({
                data: records.map((r: CreatePesagemDTO) => ({
                    user_uuid: r.userId,
                    date: r.date,
                    peso: r.peso,
                    percentualMG: r.percentualMG,
                    mm: r.mm,
                    h2o: r.h2o,
                    imc: r.imc,
                    gordVisceral: r.gordVisceral,
                    idMetabolica: r.idMetabolica,
                    massaOssea: r.massaOssea,
                    height: r.height,
                    smi: r.smi,
                    resultadoIMC: r.resultadoIMC,
                    resultadoPercentMG: r.resultadoPercentMG,
                    notas: r.notas,
                })),
                skipDuplicates: true,
            });

            // Invalidate cache for all affected users
            const uniqueUserIds = [...new Set(records.map(r => r.userId))];

            // Fetch emails for these users to invalidate User Dashboard cache
            const users = await this.db.user.findMany({
                where: { id: { in: uniqueUserIds } },
                select: { id: true, email: true }
            });

            await Promise.all(uniqueUserIds.map(async (userId) => {
                const user = users.find(u => u.id === userId);
                const promises: Promise<void>[] = [
                    invalidatePesagemUserCache(userId),
                    invalidateAdminUserDetail(userId)
                ];

                if (user?.email) {
                    promises.push(clearUserData(user.email));
                }

                await Promise.all(promises);
            }));

            return result.count;
        });
    }

    /**
     * Find pesagem by ID
     */
    async findById(id: number): Promise<Pesagem | null> {
        return this.db.pesagem.findUnique({ where: { id } });
    }

    /**
     * Find all pesagens for a user (with Redis cache)
     */
    async findByUser(
        userId: string,
        params: PaginationParams = {}
    ): Promise<PaginatedResult<Pesagem>> {
        const cacheKey = getPesagemCacheKey(userId, 'list', params);

        // Check Redis cache
        const cached = await redisCache.get<PaginatedResult<Pesagem>>(cacheKey);
        if (cached) {
            return cached;
        }

        const { skip, take } = this.buildPagination(params);

        const [items, total] = await Promise.all([
            this.db.pesagem.findMany({
                where: { user_uuid: userId },
                skip,
                take,
                orderBy: { date: 'desc' },
            }),
            this.db.pesagem.count({ where: { user_uuid: userId } }),
        ]);

        const result = this.buildPaginatedResult(items, total, params);

        // Cache with TTL
        await redisCache.set(cacheKey, result, REPOSITORY_CACHE_TTL.PESAGEM_LIST);

        return result;
    }

    /**
     * Find latest pesagem for user (with Redis cache)
     */
    async findLatest(userId: string): Promise<Pesagem | null> {
        const cacheKey = getPesagemCacheKey(userId, 'latest');

        // Check Redis cache
        const cached = await redisCache.get<Pesagem | null>(cacheKey);
        if (cached !== null) {
            return cached;
        }

        const result = await this.db.pesagem.findFirst({
            where: { user_uuid: userId },
            orderBy: { date: 'desc' },
        });

        // Cache with TTL (even null results are cached briefly to avoid DB hits)
        await redisCache.set(cacheKey, result, REPOSITORY_CACHE_TTL.PESAGEM_LATEST);

        return result;
    }

    /**
     * Find pesagens in date range
     */
    async findByDateRange(
        userId: string,
        startDate: Date,
        endDate: Date
    ): Promise<Pesagem[]> {
        return this.db.pesagem.findMany({
            where: {
                user_uuid: userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { date: 'desc' },
        });
    }

    /**
     * Update pesagem
     */
    async update(id: number, data: UpdatePesagemDTO): Promise<Result<Pesagem>> {
        return this.execute(async () => {
            // Get existing record to find userId for cache invalidation
            const existing = await this.db.pesagem.findUnique({
                where: { id },
                select: { user_uuid: true }
            });

            const result = await this.db.pesagem.update({
                where: { id },
                data,
            });

            // Invalidate cache for this user
            if (existing) {
                await invalidatePesagemUserCache(existing.user_uuid);
                await invalidateAdminUserDetail(existing.user_uuid);

                // Also invalidate User Dashboard cache (requires email)
                const user = await this.db.user.findUnique({
                    where: { id: existing.user_uuid },
                    select: { email: true }
                });
                if (user?.email) {
                    await clearUserData(user.email);
                }
            }

            return result;
        });
    }

    /**
     * Delete pesagem
     */
    async delete(id: number): Promise<Result<void>> {
        return this.execute(async () => {
            // Get existing record to find userId for cache invalidation
            const existing = await this.db.pesagem.findUnique({
                where: { id },
                select: { user_uuid: true }
            });

            await this.db.pesagem.delete({ where: { id } });

            // Invalidate cache for this user
            if (existing) {
                await invalidatePesagemUserCache(existing.user_uuid);
                await invalidateAdminUserDetail(existing.user_uuid);

                // Also invalidate User Dashboard cache (requires email)
                const user = await this.db.user.findUnique({
                    where: { id: existing.user_uuid },
                    select: { email: true }
                });
                if (user?.email) {
                    await clearUserData(user.email);
                }
            }
        });
    }

    /**
     * Delete all pesagens for a user
     */
    async deleteAllForUser(userId: string): Promise<Result<number>> {
        return this.execute(async () => {
            const result = await this.db.pesagem.deleteMany({
                where: { user_uuid: userId },
            });

            // Invalidate cache for this user
            await invalidatePesagemUserCache(userId);
            await invalidateAdminUserDetail(userId);

            // Also invalidate User Dashboard cache (requires email)
            const user = await this.db.user.findUnique({
                where: { id: userId },
                select: { email: true }
            });
            if (user?.email) {
                await clearUserData(user.email);
            }

            return result.count;
        });
    }

    /**
     * Get weight progress (for charts) (with Redis cache)
     */
    async getWeightProgress(
        userId: string,
        limit: number = 30
    ): Promise<{ date: Date; peso: number | null }[]> {
        const cacheKey = getPesagemCacheKey(userId, 'progress', { limit });

        // Check Redis cache
        const cached = await redisCache.get<{ date: Date; peso: number | null }[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const records = await this.db.pesagem.findMany({
            where: { user_uuid: userId, peso: { not: null } },
            select: { date: true, peso: true },
            orderBy: { date: 'asc' },
            take: limit,
        });

        const result = records.map((r: typeof records[number]) => ({
            date: r.date,
            peso: r.peso ? Number(r.peso) : null,
        }));

        // Cache with TTL
        await redisCache.set(cacheKey, result, REPOSITORY_CACHE_TTL.PESAGEM_PROGRESS);

        return result;
    }
}

// Export singleton
export const pesagemRepository = PesagemRepository.getInstance();
