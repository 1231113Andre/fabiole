/**
 * @fileoverview PerimetroCorporal (body measurements) repository
 * @description Handles body measurement CRUD operations with Redis caching
 */

import { PerimetroCorporal } from '@prisma/client';
import { BaseRepository, Result, PaginationParams, PaginatedResult } from './BaseRepository';
import { redisCache } from '@/lib/cache/redisCache';
import {
    getPerimetroCacheKey,
    invalidatePerimetroUserCache,
    REPOSITORY_CACHE_TTL
} from '@/lib/cache/repositoryCache';
import { invalidateAdminUserDetail } from '@/lib/cache/adminCache';
import { clearUserData } from '@/lib/cache/userCache';

/**
 * Perimetro creation DTO
 */
export interface CreatePerimetroDTO {
    userId: string;
    date: Date;
    msRight?: number;
    msRightFlex?: number;
    msLeft?: number;
    msLeftFlex?: number;
    chest?: number;
    waist?: number;
    abdomen?: number;
    hips?: number;
    thighR?: number;
    thighL?: number;
}

/**
 * Perimetro update DTO
 */
export type UpdatePerimetroDTO = Partial<Omit<CreatePerimetroDTO, 'userId'>>;

/**
 * Perimetro Repository
 */
export class PerimetroRepository extends BaseRepository {
    private static instance: PerimetroRepository;

    private constructor() {
        super();
    }

    static getInstance(): PerimetroRepository {
        if (!PerimetroRepository.instance) {
            PerimetroRepository.instance = new PerimetroRepository();
        }
        return PerimetroRepository.instance;
    }

    /**
     * Create new perimetro record
     */
    async create(data: CreatePerimetroDTO): Promise<Result<PerimetroCorporal>> {
        return this.execute(async () => {
            const result = await this.db.perimetroCorporal.create({
                data: {
                    user_uuid: data.userId,
                    date: data.date,
                    msRight: data.msRight,
                    msRightFlex: data.msRightFlex,
                    msLeft: data.msLeft,
                    msLeftFlex: data.msLeftFlex,
                    chest: data.chest,
                    waist: data.waist,
                    abdomen: data.abdomen,
                    hips: data.hips,
                    thighR: data.thighR,
                    thighL: data.thighL,
                },
            });

            // Invalidate cache for this user
            await invalidatePerimetroUserCache(data.userId);
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
    async createMany(records: CreatePerimetroDTO[]): Promise<Result<number>> {
        return this.execute(async () => {
            const result = await this.db.perimetroCorporal.createMany({
                data: records.map((r: CreatePerimetroDTO) => ({
                    user_uuid: r.userId,
                    date: r.date,
                    msRight: r.msRight,
                    msRightFlex: r.msRightFlex,
                    msLeft: r.msLeft,
                    msLeftFlex: r.msLeftFlex,
                    chest: r.chest,
                    waist: r.waist,
                    abdomen: r.abdomen,
                    hips: r.hips,
                    thighR: r.thighR,
                    thighL: r.thighL,
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
                    invalidatePerimetroUserCache(userId),
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
    async findById(id: number): Promise<PerimetroCorporal | null> {
        return this.db.perimetroCorporal.findUnique({ where: { id } });
    }

    /**
     * Find all for user (with Redis cache)
     */
    async findByUser(
        userId: string,
        params: PaginationParams = {}
    ): Promise<PaginatedResult<PerimetroCorporal>> {
        const cacheKey = getPerimetroCacheKey(userId, 'list', params);

        // Check Redis cache
        const cached = await redisCache.get<PaginatedResult<PerimetroCorporal>>(cacheKey);
        if (cached) {
            return cached;
        }

        const { skip, take } = this.buildPagination(params);

        const [items, total] = await Promise.all([
            this.db.perimetroCorporal.findMany({
                where: { user_uuid: userId },
                skip,
                take,
                orderBy: { date: 'desc' },
            }),
            this.db.perimetroCorporal.count({ where: { user_uuid: userId } }),
        ]);

        const result = this.buildPaginatedResult(items, total, params);

        // Cache with TTL
        await redisCache.set(cacheKey, result, REPOSITORY_CACHE_TTL.PERIMETRO_LIST);

        return result;
    }

    /**
     * Find latest for user (with Redis cache)
     */
    async findLatest(userId: string): Promise<PerimetroCorporal | null> {
        const cacheKey = getPerimetroCacheKey(userId, 'latest');

        // Check Redis cache
        const cached = await redisCache.get<PerimetroCorporal | null>(cacheKey);
        if (cached !== null) {
            return cached;
        }

        const result = await this.db.perimetroCorporal.findFirst({
            where: { user_uuid: userId },
            orderBy: { date: 'desc' },
        });

        // Cache with TTL (even null results are cached briefly to avoid DB hits)
        await redisCache.set(cacheKey, result, REPOSITORY_CACHE_TTL.PERIMETRO_LATEST);

        return result;
    }

    /**
     * Update perimetro
     */
    async update(id: number, data: UpdatePerimetroDTO): Promise<Result<PerimetroCorporal>> {
        return this.execute(async () => {
            // Get existing record to find userId for cache invalidation
            const existing = await this.db.perimetroCorporal.findUnique({
                where: { id },
                select: { user_uuid: true }
            });

            const result = await this.db.perimetroCorporal.update({
                where: { id },
                data,
            });

            // Invalidate cache for this user
            if (existing) {
                await invalidatePerimetroUserCache(existing.user_uuid);
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
     * Delete perimetro
     */
    async delete(id: number): Promise<Result<void>> {
        return this.execute(async () => {
            // Get existing record to find userId for cache invalidation
            const existing = await this.db.perimetroCorporal.findUnique({
                where: { id },
                select: { user_uuid: true }
            });

            await this.db.perimetroCorporal.delete({ where: { id } });

            // Invalidate cache for this user
            if (existing) {
                await invalidatePerimetroUserCache(existing.user_uuid);
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
            const result = await this.db.perimetroCorporal.deleteMany({
                where: { user_uuid: userId },
            });

            // Invalidate cache for this user
            await invalidatePerimetroUserCache(userId);
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
     * Get waist progress (for charts)
     */
    async getWaistProgress(
        userId: string,
        limit: number = 30
    ): Promise<{ date: Date; waist: number | null }[]> {
        const records = await this.db.perimetroCorporal.findMany({
            where: { user_uuid: userId, waist: { not: null } },
            select: { date: true, waist: true },
            orderBy: { date: 'asc' },
            take: limit,
        });

        return records.map((r: typeof records[number]) => ({
            date: r.date,
            waist: r.waist ? Number(r.waist) : null,
        }));
    }
}

// Export singleton
export const perimetroRepository = PerimetroRepository.getInstance();
