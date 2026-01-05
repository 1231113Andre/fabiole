/**
 * @fileoverview AvaliacaoFisica (physical evaluation) repository
 * @description Handles physical evaluation CRUD operations with Redis caching
 */

import { AvaliacaoFisica } from '@prisma/client';
import { BaseRepository, Result, PaginationParams, PaginatedResult } from './BaseRepository';
import { redisCache } from '@/lib/cache/redisCache';
import {
    getAvaliacaoCacheKey,
    invalidateAvaliacaoUserCache,
    REPOSITORY_CACHE_TTL
} from '@/lib/cache/repositoryCache';
import { invalidateAdminUserDetail } from '@/lib/cache/adminCache';
import { clearUserData } from '@/lib/cache/userCache';


/**
 * Avaliacao creation DTO
 */
export interface CreateAvaliacaoDTO {
    userId: string;
    date: Date;
    pushUps?: number;
    sitUps?: number;
    mile?: string;
    mileResult?: string;
    pushUpsResult?: string;
    notes?: string;
}

/**
 * Avaliacao update DTO
 */
export type UpdateAvaliacaoDTO = Partial<Omit<CreateAvaliacaoDTO, 'userId'>>;

/**
 * Avaliacao Repository
 */
export class AvaliacaoRepository extends BaseRepository {
    private static instance: AvaliacaoRepository;

    private constructor() {
        super();
    }

    static getInstance(): AvaliacaoRepository {
        if (!AvaliacaoRepository.instance) {
            AvaliacaoRepository.instance = new AvaliacaoRepository();
        }
        return AvaliacaoRepository.instance;
    }

    /**
     * Create new avaliacao record
     */
    async create(data: CreateAvaliacaoDTO): Promise<Result<AvaliacaoFisica>> {
        return this.execute(async () => {
            const result = await this.db.avaliacaoFisica.create({
                data: {
                    user_uuid: data.userId,
                    date: data.date,
                    pushUps: data.pushUps,
                    sitUps: data.sitUps,
                    mile: data.mile,
                    mileResult: data.mileResult,
                    pushUpsResult: data.pushUpsResult,
                    notes: data.notes,
                },
            });

            // Invalidate cache for this user
            await invalidateAvaliacaoUserCache(data.userId);
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
     * Create multiple records (bulk insert)
     */
    async createMany(records: CreateAvaliacaoDTO[]): Promise<Result<number>> {
        return this.execute(async () => {
            const result = await this.db.avaliacaoFisica.createMany({
                data: records.map((r: CreateAvaliacaoDTO) => ({
                    user_uuid: r.userId,
                    date: r.date,
                    pushUps: r.pushUps,
                    sitUps: r.sitUps,
                    mile: r.mile,
                    mileResult: r.mileResult,
                    pushUpsResult: r.pushUpsResult,
                    notes: r.notes,
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
                    invalidateAvaliacaoUserCache(userId),
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
     * Find by ID
     */
    async findById(id: number): Promise<AvaliacaoFisica | null> {
        return this.db.avaliacaoFisica.findUnique({ where: { id } });
    }

    /**
     * Find all for user (with Redis cache)
     */
    async findByUser(
        userId: string,
        params: PaginationParams = {}
    ): Promise<PaginatedResult<AvaliacaoFisica>> {
        const cacheKey = getAvaliacaoCacheKey(userId, 'list', params);

        // Check Redis cache
        const cached = await redisCache.get<PaginatedResult<AvaliacaoFisica>>(cacheKey);
        if (cached) {
            return cached;
        }

        const { skip, take } = this.buildPagination(params);

        const [items, total] = await Promise.all([
            this.db.avaliacaoFisica.findMany({
                where: { user_uuid: userId },
                skip,
                take,
                orderBy: { date: 'desc' },
            }),
            this.db.avaliacaoFisica.count({ where: { user_uuid: userId } }),
        ]);

        const result = this.buildPaginatedResult(items, total, params);

        // Cache with TTL
        await redisCache.set(cacheKey, result, REPOSITORY_CACHE_TTL.AVALIACAO_LIST);

        return result;
    }

    /**
     * Find latest for user (with Redis cache)
     */
    async findLatest(userId: string): Promise<AvaliacaoFisica | null> {
        const cacheKey = getAvaliacaoCacheKey(userId, 'latest');

        // Check Redis cache
        const cached = await redisCache.get<AvaliacaoFisica | null>(cacheKey);
        if (cached !== null) {
            return cached;
        }

        const result = await this.db.avaliacaoFisica.findFirst({
            where: { user_uuid: userId },
            orderBy: { date: 'desc' },
        });

        // Cache with TTL (even null results are cached briefly to avoid DB hits)
        await redisCache.set(cacheKey, result, REPOSITORY_CACHE_TTL.AVALIACAO_LATEST);

        return result;
    }

    /**
     * Update avaliacao
     */
    async update(id: number, data: UpdateAvaliacaoDTO): Promise<Result<AvaliacaoFisica>> {
        return this.execute(async () => {
            // Get existing record to find userId for cache invalidation
            const existing = await this.db.avaliacaoFisica.findUnique({
                where: { id },
                select: { user_uuid: true }
            });

            const result = await this.db.avaliacaoFisica.update({
                where: { id },
                data,
            });

            // Invalidate cache for this user
            if (existing) {
                await invalidateAvaliacaoUserCache(existing.user_uuid);
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
     * Delete avaliacao
     */
    async delete(id: number): Promise<Result<void>> {
        return this.execute(async () => {
            // Get existing record to find userId for cache invalidation
            const existing = await this.db.avaliacaoFisica.findUnique({
                where: { id },
                select: { user_uuid: true }
            });

            await this.db.avaliacaoFisica.delete({ where: { id } });

            // Invalidate cache for this user
            if (existing) {
                await invalidateAvaliacaoUserCache(existing.user_uuid);
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
     * Delete all for user
     */
    async deleteAllForUser(userId: string): Promise<Result<number>> {
        return this.execute(async () => {
            const result = await this.db.avaliacaoFisica.deleteMany({
                where: { user_uuid: userId },
            });

            // Invalidate cache for this user
            await invalidateAvaliacaoUserCache(userId);
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
     * Get performance progress (for charts)
     */
    async getPerformanceProgress(
        userId: string,
        limit: number = 30
    ): Promise<{ date: Date; pushUps: number | null; sitUps: number | null }[]> {
        const records = await this.db.avaliacaoFisica.findMany({
            where: { user_uuid: userId },
            select: { date: true, pushUps: true, sitUps: true },
            orderBy: { date: 'asc' },
            take: limit,
        });

        return records.map((r: typeof records[number]) => ({
            date: r.date,
            pushUps: r.pushUps,
            sitUps: r.sitUps,
        }));
    }
}

// Export singleton
export const avaliacaoRepository = AvaliacaoRepository.getInstance();
