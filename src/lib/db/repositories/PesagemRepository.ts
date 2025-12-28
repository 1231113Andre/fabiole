/**
 * @fileoverview Pesagem (weight tracking) repository
 * @description Handles weight measurement CRUD operations
 */

import { Pesagem, Prisma } from '@prisma/client';
import { BaseRepository, Result, PaginationParams, PaginatedResult } from './BaseRepository';

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
    resultadoIMC?: string;
    resultadoPercentMG?: string;
    notas?: string;
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
            return this.db.pesagem.create({
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
                    resultadoIMC: data.resultadoIMC,
                    resultadoPercentMG: data.resultadoPercentMG,
                    notas: data.notas,
                },
            });
        });
    }

    /**
     * Create multiple pesagem records (bulk insert)
     */
    async createMany(records: CreatePesagemDTO[]): Promise<Result<number>> {
        return this.execute(async () => {
            const result = await this.db.pesagem.createMany({
                data: records.map(r => ({
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
                    resultadoIMC: r.resultadoIMC,
                    resultadoPercentMG: r.resultadoPercentMG,
                    notas: r.notas,
                })),
                skipDuplicates: true,
            });
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
     * Find all pesagens for a user
     */
    async findByUser(
        userId: string,
        params: PaginationParams = {}
    ): Promise<PaginatedResult<Pesagem>> {
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

        return this.buildPaginatedResult(items, total, params);
    }

    /**
     * Find latest pesagem for user
     */
    async findLatest(userId: string): Promise<Pesagem | null> {
        return this.db.pesagem.findFirst({
            where: { user_uuid: userId },
            orderBy: { date: 'desc' },
        });
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
            return this.db.pesagem.update({
                where: { id },
                data,
            });
        });
    }

    /**
     * Delete pesagem
     */
    async delete(id: number): Promise<Result<void>> {
        return this.execute(async () => {
            await this.db.pesagem.delete({ where: { id } });
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
            return result.count;
        });
    }

    /**
     * Get weight progress (for charts)
     */
    async getWeightProgress(
        userId: string,
        limit: number = 30
    ): Promise<{ date: Date; peso: number | null }[]> {
        const records = await this.db.pesagem.findMany({
            where: { user_uuid: userId, peso: { not: null } },
            select: { date: true, peso: true },
            orderBy: { date: 'asc' },
            take: limit,
        });

        return records.map(r => ({
            date: r.date,
            peso: r.peso ? Number(r.peso) : null,
        }));
    }
}

// Export singleton
export const pesagemRepository = PesagemRepository.getInstance();
