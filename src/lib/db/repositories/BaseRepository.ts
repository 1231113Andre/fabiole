/**
 * @fileoverview Base repository class with common operations
 * @description Abstract base class for all repositories providing
 *              common CRUD patterns and error handling.
 */

import { PrismaClient } from '@prisma/client';
import { db } from '../client';
import { Logger } from '@/lib/utils/logger';

/**
 * Generic result type for repository operations
 */
export type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

/**
 * Pagination parameters
 */
export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * Base Repository
 * Provides common database operations and error handling
 */
export abstract class BaseRepository {
    protected readonly db: PrismaClient;

    constructor() {
        this.db = db;
    }

    /**
     * Wrap operation in try-catch and return Result type
     */
    protected async execute<T>(
        operation: () => Promise<T>
    ): Promise<Result<T>> {
        try {
            const data = await operation();
            return { success: true, data };
        } catch (error) {
            Logger.error('Database', `Operation failed in [${this.constructor.name}].`, error);
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }

    /**
     * Execute operations within a database transaction
     * All operations must succeed or all will be rolled back
     * @param operations - Array of operations to execute in transaction
     * @returns Result with array of operation results
     */
    protected async executeInTransaction<T extends readonly unknown[]>(
        operations: ((tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]) => Promise<T[number]>)[]
    ): Promise<Result<T>> {
        try {
            const results = await this.db.$transaction(
                async (tx) => {
                    const results = await Promise.all(
                        operations.map(op => op(tx))
                    );
                    return results as unknown as T;
                },
                {
                    maxWait: 10000, // Maximum time to wait for a transaction slot
                    timeout: 20000, // Maximum time the transaction can run
                }
            );
            return { success: true, data: results };
        } catch (error) {
            Logger.error('Database', `Transaction failed in [${this.constructor.name}].`, error);
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }

    /**
     * Execute a single operation within a database transaction
     * Useful for operations that need atomicity
     * @param operation - Operation to execute in transaction
     * @returns Result with operation result
     */
    protected async executeTransaction<T>(
        operation: (tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]) => Promise<T>
    ): Promise<Result<T>> {
        try {
            const result = await this.db.$transaction(
                operation,
                {
                    maxWait: 10000,
                    timeout: 20000,
                }
            );
            return { success: true, data: result };
        } catch (error) {
            Logger.error('Database', `Transaction failed in [${this.constructor.name}].`, error);
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }

    /**
     * Build pagination parameters
     */
    protected buildPagination(params: PaginationParams): { skip: number; take: number } {
        const page = Math.max(1, params.page ?? 1);
        const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));

        return {
            skip: (page - 1) * pageSize,
            take: pageSize,
        };
    }

    /**
     * Build paginated result
     */
    protected buildPaginatedResult<T>(
        items: T[],
        total: number,
        params: PaginationParams
    ): PaginatedResult<T> {
        const page = Math.max(1, params.page ?? 1);
        const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));

        return {
            items,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
}
