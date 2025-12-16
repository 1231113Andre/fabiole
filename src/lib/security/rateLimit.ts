/**
 * @fileoverview Rate limiting utility
 * @description Simple in-memory rate limiting for API routes
 *              Optimized for performance with efficient data structures
 *              For production, consider using Redis or dedicated rate limiting service
 */

import type { NextRequest } from 'next/server';

/**
 * Rate limit store (in-memory, optimized Map)
 * In production, use Redis or similar for distributed systems
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
 * Optimized: only runs when store size exceeds threshold or on interval
 */
let cleanupScheduled = false;
function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  
  setTimeout(() => {
    cleanupScheduled = false;
    const now = Date.now();
    let cleaned = 0;
    
    // Use iterator for better performance with large maps
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
        cleaned++;
      }
    }
    
    // Force cleanup if store is too large
    if (rateLimitStore.size > MAX_STORE_SIZE) {
      // Delete oldest 50% of entries (based on reset time)
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
 * Get client identifier from request (optimized)
 * Uses IP address with pathname for per-endpoint limits
 * @param request - NextRequest object
 * @returns Client identifier
 */
function getClientId(request: NextRequest): string {
  // Fast path: use existing headers (optimized string operations)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0].trim() || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Include pathname for per-endpoint rate limiting
  const pathname = request.nextUrl.pathname;
  
  return `${ip}:${pathname}`;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Custom message when rate limited */
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
 * Default rate limit configurations (configurable via environment variables)
 */
export const RATE_LIMITS = {
  // Strict limits for authentication endpoints
  AUTH: {
    maxRequests: parseIntEnv('RATE_LIMIT_AUTH_MAX', 30),
    windowMs: parseIntEnv('RATE_LIMIT_AUTH_WINDOW_MINUTES', 5) * 60 * 1000,
    message: process.env.RATE_LIMIT_AUTH_MESSAGE || 'Too many authentication attempts. Please try again later.',
  },
  
  // Moderate limits for API endpoints
  API: {
    maxRequests: parseIntEnv('RATE_LIMIT_API_MAX', 100),
    windowMs: parseIntEnv('RATE_LIMIT_API_WINDOW_MINUTES', 15) * 60 * 1000,
    message: process.env.RATE_LIMIT_API_MESSAGE || 'Too many requests. Please try again later.',
  },
  
  // Lenient limits for general endpoints
  GENERAL: {
    maxRequests: parseIntEnv('RATE_LIMIT_GENERAL_MAX', 200),
    windowMs: parseIntEnv('RATE_LIMIT_GENERAL_WINDOW_MINUTES', 15) * 60 * 1000,
    message: process.env.RATE_LIMIT_GENERAL_MESSAGE || 'Too many requests. Please try again later.',
  },
} as const;

/**
 * Check if request should be rate limited (optimized)
 * @param request - NextRequest object
 * @param config - Rate limit configuration
 * @returns Object with `allowed` boolean and optional `retryAfter` seconds
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.API
): { allowed: boolean; retryAfter?: number; message?: string } {
  const clientId = getClientId(request);
  const now = Date.now();
  
  let entry = rateLimitStore.get(clientId);
  
  // Fast path: initialize or reset if expired
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1, // Start at 1 (current request)
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(clientId, entry);
    
    // Schedule cleanup if needed
    if (rateLimitStore.size > 1000 && !cleanupScheduled) {
      scheduleCleanup();
    }
    
    return { allowed: true };
  }
  
  // Increment count
  entry.count++;
  
  // Fast rejection if limit exceeded
  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      message: config.message || 'Rate limit exceeded',
    };
  }
  
  // Update entry
  rateLimitStore.set(clientId, entry);
  
  return { allowed: true };
}

/**
 * Create rate limit middleware for API routes
 * @param config - Rate limit configuration
 * @returns Middleware function
 */
export function createRateLimitMiddleware(config: RateLimitConfig = RATE_LIMITS.API) {
  return (request: NextRequest) => {
    const result = checkRateLimit(request, config);
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: result.message || 'Rate limit exceeded',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429, // Too Many Requests
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
    
    return null; // No rate limit exceeded
  };
}
