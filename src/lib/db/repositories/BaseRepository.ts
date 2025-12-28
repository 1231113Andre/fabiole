/**
 * @fileoverview Base repository class with common operations
 * @description Abstract base class for all repositories providing
 *              common CRUD patterns and error handling.
 */

import { PrismaClient } from '@prisma/client';
import { db } from '../client';

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
            console.error(`[${this.constructor.name}] Error:`, error);
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
