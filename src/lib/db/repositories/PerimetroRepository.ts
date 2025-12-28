/**
 * @fileoverview PerimetroCorporal (body measurements) repository
 * @description Handles body measurement CRUD operations
 */

import { PerimetroCorporal } from '@prisma/client';
import { BaseRepository, Result, PaginationParams, PaginatedResult } from './BaseRepository';

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
            return this.db.perimetroCorporal.create({
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
        });
    }

    /**
     * Create multiple records (bulk insert)
     */
    async createMany(records: CreatePerimetroDTO[]): Promise<Result<number>> {
        return this.execute(async () => {
            const result = await this.db.perimetroCorporal.createMany({
                data: records.map(r => ({
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
     * Find all for user
     */
    async findByUser(
        userId: string,
        params: PaginationParams = {}
    ): Promise<PaginatedResult<PerimetroCorporal>> {
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

        return this.buildPaginatedResult(items, total, params);
    }

    /**
     * Find latest for user
     */
    async findLatest(userId: string): Promise<PerimetroCorporal | null> {
        return this.db.perimetroCorporal.findFirst({
            where: { user_uuid: userId },
            orderBy: { date: 'desc' },
        });
    }

    /**
     * Update perimetro
     */
    async update(id: number, data: UpdatePerimetroDTO): Promise<Result<PerimetroCorporal>> {
        return this.execute(async () => {
            return this.db.perimetroCorporal.update({
                where: { id },
                data,
            });
        });
    }

    /**
     * Delete perimetro
     */
    async delete(id: number): Promise<Result<void>> {
        return this.execute(async () => {
            await this.db.perimetroCorporal.delete({ where: { id } });
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

        return records.map(r => ({
            date: r.date,
            waist: r.waist ? Number(r.waist) : null,
        }));
    }
}

// Export singleton
export const perimetroRepository = PerimetroRepository.getInstance();
