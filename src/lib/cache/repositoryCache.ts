/**
 * @fileoverview Repository cache helpers
 * @description Standardized cache keys and operations for repositories
 */

import { redisCache } from './redisCache';
import { Logger } from '@/lib/utils/logger';

/**
 * Cache TTLs (in seconds)
 */
export const REPOSITORY_CACHE_TTL = {
    PESAGEM_LIST: 60,        // 60 seconds for paginated lists
    PESAGEM_LATEST: 30,      // 30 seconds for latest record
    PESAGEM_PROGRESS: 120,   // 2 minutes for progress charts (less frequently updated)
    PERIMETRO_LIST: 60,      // 60 seconds for paginated lists
    PERIMETRO_LATEST: 30,    // 30 seconds for latest record
    AVALIACAO_LIST: 60,      // 60 seconds for paginated lists
    AVALIACAO_LATEST: 30,    // 30 seconds for latest record
};

/**
 * Generate cache key for pesagem repository
 */
export function getPesagemCacheKey(
    userId: string,
    type: 'list' | 'latest' | 'progress',
    params?: { page?: number; pageSize?: number; limit?: number }
): string {
    const baseKey = `pesagem:user:${userId}`;
    
    switch (type) {
        case 'list':
            const page = params?.page || 1;
            const pageSize = params?.pageSize || 20;
            return `${baseKey}:list:page:${page}:size:${pageSize}`;
        case 'latest':
            return `${baseKey}:latest`;
        case 'progress':
            const limit = params?.limit || 30;
            return `${baseKey}:progress:limit:${limit}`;
        default:
            return baseKey;
    }
}

/**
 * Generate cache key for perimetro repository
 */
export function getPerimetroCacheKey(
    userId: string,
    type: 'list' | 'latest',
    params?: { page?: number; pageSize?: number }
): string {
    const baseKey = `perimetro:user:${userId}`;
    
    switch (type) {
        case 'list':
            const page = params?.page || 1;
            const pageSize = params?.pageSize || 20;
            return `${baseKey}:list:page:${page}:size:${pageSize}`;
        case 'latest':
            return `${baseKey}:latest`;
        default:
            return baseKey;
    }
}

/**
 * Generate cache key for avaliacao repository
 */
export function getAvaliacaoCacheKey(
    userId: string,
    type: 'list' | 'latest',
    params?: { page?: number; pageSize?: number }
): string {
    const baseKey = `avaliacao:user:${userId}`;
    
    switch (type) {
        case 'list':
            const page = params?.page || 1;
            const pageSize = params?.pageSize || 20;
            return `${baseKey}:list:page:${page}:size:${pageSize}`;
        case 'latest':
            return `${baseKey}:latest`;
        default:
            return baseKey;
    }
}

/**
 * Invalidate all cache keys for a user's pesagens
 */
export async function invalidatePesagemUserCache(userId: string): Promise<void> {
    try {
        // Delete pattern matching all pesagem keys for this user
        await redisCache.deletePattern(`pesagem:user:${userId}:*`);
        Logger.info('RepositoryCache', `Invalidated pesagem cache for user: ${userId}`);
    } catch (error) {
        Logger.error('RepositoryCache', `Failed to invalidate pesagem cache for user ${userId}`, error);
    }
}

/**
 * Invalidate all cache keys for a user's perimetros
 */
export async function invalidatePerimetroUserCache(userId: string): Promise<void> {
    try {
        await redisCache.deletePattern(`perimetro:user:${userId}:*`);
        Logger.info('RepositoryCache', `Invalidated perimetro cache for user: ${userId}`);
    } catch (error) {
        Logger.error('RepositoryCache', `Failed to invalidate perimetro cache for user ${userId}`, error);
    }
}

/**
 * Invalidate all cache keys for a user's avaliacoes
 */
export async function invalidateAvaliacaoUserCache(userId: string): Promise<void> {
    try {
        await redisCache.deletePattern(`avaliacao:user:${userId}:*`);
        Logger.info('RepositoryCache', `Invalidated avaliacao cache for user: ${userId}`);
    } catch (error) {
        Logger.error('RepositoryCache', `Failed to invalidate avaliacao cache for user ${userId}`, error);
    }
}

/**
 * Invalidate all measurement caches for a user
 */
export async function invalidateAllUserMeasurementCache(userId: string): Promise<void> {
    await Promise.all([
        invalidatePesagemUserCache(userId),
        invalidatePerimetroUserCache(userId),
        invalidateAvaliacaoUserCache(userId)
    ]);
}

