/**
 * @fileoverview AvaliacaoFisica (physical evaluation) repository
 * @description Handles physical evaluation CRUD operations
 */

import { AvaliacaoFisica } from '@prisma/client';
import { BaseRepository, Result, PaginationParams, PaginatedResult } from './BaseRepository';

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
            return this.db.avaliacaoFisica.create({
                data: {
                    user_uuid: data.userId,
                    date: data.date,
                    pushUps: data.pushUps,
                    sitUps: data.sitUps,
                    mile: data.mile,
                    mileResult: data.mileResult,
                    notes: data.notes,
                },
            });
        });
    }

    /**
     * Create multiple records (bulk insert)
     */
    async createMany(records: CreateAvaliacaoDTO[]): Promise<Result<number>> {
        return this.execute(async () => {
            const result = await this.db.avaliacaoFisica.createMany({
                data: records.map(r => ({
                    user_uuid: r.userId,
                    date: r.date,
                    pushUps: r.pushUps,
                    sitUps: r.sitUps,
                    mile: r.mile,
                    mileResult: r.mileResult,
                    notes: r.notes,
                })),
                skipDuplicates: true,
            });
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
     * Find all for user
     */
    async findByUser(
        userId: string,
        params: PaginationParams = {}
    ): Promise<PaginatedResult<AvaliacaoFisica>> {
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

        return this.buildPaginatedResult(items, total, params);
    }

    /**
     * Find latest for user
     */
    async findLatest(userId: string): Promise<AvaliacaoFisica | null> {
        return this.db.avaliacaoFisica.findFirst({
            where: { user_uuid: userId },
            orderBy: { date: 'desc' },
        });
    }

    /**
     * Update avaliacao
     */
    async update(id: number, data: UpdateAvaliacaoDTO): Promise<Result<AvaliacaoFisica>> {
        return this.execute(async () => {
            return this.db.avaliacaoFisica.update({
                where: { id },
                data,
            });
        });
    }

    /**
     * Delete avaliacao
     */
    async delete(id: number): Promise<Result<void>> {
        return this.execute(async () => {
            await this.db.avaliacaoFisica.delete({ where: { id } });
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

        return records.map(r => ({
            date: r.date,
            pushUps: r.pushUps,
            sitUps: r.sitUps,
        }));
    }
}

// Export singleton
export const avaliacaoRepository = AvaliacaoRepository.getInstance();
