/**
 * @fileoverview Rate limiting utility
 * @description Rate limiting for API routes using Redis (production) with in-memory fallback
 *              Optimized for performance with atomic Redis operations
 */

import type { NextRequest } from 'next/server';
import { checkRateLimitRedis } from '@/lib/cache/redisCache';
import { Logger } from '@/lib/utils/logger';

/**
 * Rate limit store (in-memory fallback)
 * Used when Redis is unavailable
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup configuration
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_STORE_SIZE = 10000; // Maximum entries before forced cleanup

/**
 * Clean up expired entries (runs periodically)
 */
let cleanupScheduled = false;
function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;

  setTimeout(() => {
    cleanupScheduled = false;
    const now = Date.now();

    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }

    // Force cleanup if store is too large
    if (rateLimitStore.size > MAX_STORE_SIZE) {
      const entries = Array.from(rateLimitStore.entries())
        .sort((a, b) => a[1].resetTime - b[1].resetTime)
        .slice(0, Math.floor(rateLimitStore.size / 2));

      for (const [key] of entries) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const pathname = request.nextUrl.pathname;
  return `${ip}:${pathname}`;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

/**
 * Parse environment variable as number with fallback
 */
function parseIntEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  AUTH: {
    maxRequests: parseIntEnv('RATE_LIMIT_AUTH_MAX', 30),
    windowMs: parseIntEnv('RATE_LIMIT_AUTH_WINDOW_MINUTES', 5) * 60 * 1000,
    message: process.env.RATE_LIMIT_AUTH_MESSAGE || 'Too many authentication attempts. Please try again later.',
  },

  API: {
    maxRequests: parseIntEnv('RATE_LIMIT_API_MAX', 100),
    windowMs: parseIntEnv('RATE_LIMIT_API_WINDOW_MINUTES', 15) * 60 * 1000,
    message: process.env.RATE_LIMIT_API_MESSAGE || 'Too many requests. Please try again later.',
  },

  GENERAL: {
    maxRequests: parseIntEnv('RATE_LIMIT_GENERAL_MAX', 200),
    windowMs: parseIntEnv('RATE_LIMIT_GENERAL_WINDOW_MINUTES', 15) * 60 * 1000,
    message: process.env.RATE_LIMIT_GENERAL_MESSAGE || 'Too many requests. Please try again later.',
  },
} as const;

/**
 * In-memory rate limit check (fallback)
 */
function checkRateLimitMemory(
  clientId: string,
  config: RateLimitConfig
): { allowed: boolean; retryAfter?: number; message?: string } {
  const now = Date.now();

  let entry = rateLimitStore.get(clientId);

  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(clientId, entry);

    if (rateLimitStore.size > 1000 && !cleanupScheduled) {
      scheduleCleanup();
    }

    return { allowed: true };
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    const mins = Math.floor(retryAfter / 60);
    const secs = retryAfter % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    const dynamicMessage = `Demasiadas tentativas - por favor aguarde ${timeStr}.`;

    return {
      allowed: false,
      retryAfter,
      message: dynamicMessage,
    };
  }

  rateLimitStore.set(clientId, entry);
  return { allowed: true };
}

/**
 * Check if request should be rate limited
 * Uses Redis when available, falls back to in-memory
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.API
): Promise<{ allowed: boolean; retryAfter?: number; message?: string }> {
  const clientId = getClientId(request);

  try {
    // Try Redis first (atomic operation)
    const result = await checkRateLimitRedis(
      clientId,
      config.maxRequests,
      config.windowMs
    );

    if (!result.allowed) {
      const secondsTotal = result.retryAfter || 0;
      const mins = Math.floor(secondsTotal / 60);
      const secs = secondsTotal % 60;
      const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

      const dynamicMessage = `Demasiadas tentativas - por favor aguarde ${timeStr}.`;

      return {
        allowed: false,
        retryAfter: result.retryAfter,
        message: dynamicMessage,
      };
    }

    // If Redis returned allowed with count 0, it means fallback was used
    // In that case, also check in-memory to be safe
    if (result.count === 0) {
      return checkRateLimitMemory(clientId, config);
    }

    return { allowed: true };
  } catch (error) {
    Logger.error('RateLimit', 'Redis rate limit check failed, using in-memory fallback.', error);
    return checkRateLimitMemory(clientId, config);
  }
}

/**
 * Synchronous rate limit check (for backward compatibility)
 * Uses only in-memory store
 */
export function checkRateLimitSync(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.API
): { allowed: boolean; retryAfter?: number; message?: string } {
  const clientId = getClientId(request);
  return checkRateLimitMemory(clientId, config);
}

/**
 * Create rate limit middleware for API routes
 */
export function createRateLimitMiddleware(config: RateLimitConfig = RATE_LIMITS.API) {
  return async (request: NextRequest) => {
    const result = await checkRateLimit(request, config);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: result.message || 'Rate limit exceeded',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(result.retryAfter || 900),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + (result.retryAfter || 900)),
          },
        }
      );
    }

    return null;
  };
}
