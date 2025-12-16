/**
 * @fileoverview CORS configuration for API routes
 * @description Configure Cross-Origin Resource Sharing (CORS) headers
 *              Strict CORS policy for API security
 *              PERFORMANCE: Origins are cached and parsed once
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Allowed origins for CORS (parsed and cached)
 * In production, replace with your actual domain
 */
let allowedOriginsCache: (string | RegExp)[] | null = null;

/**
 * CORS configuration from environment variables
 */
const CORS_CONFIG = {
  allowedOrigins: process.env.ALLOWED_ORIGINS,
  allowCredentials: process.env.CORS_ALLOW_CREDENTIALS === 'true',
  maxAge: parseInt(process.env.CORS_MAX_AGE || '86400', 10), // Default 24 hours
  allowedMethods: process.env.CORS_ALLOWED_METHODS || 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS || 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With',
  exposedHeaders: process.env.CORS_EXPOSED_HEADERS || 'X-CSRF-Token',
} as const;

function getAllowedOrigins(): (string | RegExp)[] {
  // Return cached if available
  if (allowedOriginsCache !== null) {
    return allowedOriginsCache;
  }

  const origins = CORS_CONFIG.allowedOrigins
    ? CORS_CONFIG.allowedOrigins.split(',').map(origin => origin.trim())
    : process.env.NODE_ENV === 'production'
      ? [] // No CORS in production unless explicitly configured
      : ['http://localhost:3000', 'http://localhost:3001']; // Development only

  // Pre-compile wildcard patterns to regex for faster matching
  allowedOriginsCache = origins.map(origin => {
    if (origin.startsWith('*.')) {
      const domain = origin.substring(2);
      return new RegExp(`^https?://([a-z0-9-]+\\.)?${domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(:\\d+)?$`, 'i');
    }
    return origin;
  });

  return allowedOriginsCache;
}

/**
 * Check if origin is allowed (optimized with caching)
 * @param origin - Request origin
 * @returns True if origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {
    // Same-origin request (no Origin header) - always allowed
    return true;
  }

  const allowedOrigins = getAllowedOrigins();
  
  // Early return if no origins configured
  if (allowedOrigins.length === 0) {
    return false;
  }

  // Fast path: exact match check first
  for (const allowedOrigin of allowedOrigins) {
    if (typeof allowedOrigin === 'string') {
      if (origin === allowedOrigin) {
        return true;
      }
    } else {
      // Regex match (for wildcard patterns)
      if (allowedOrigin.test(origin)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * CORS headers cache (computed once per origin)
 */
const corsHeadersCache = new Map<string, Record<string, string>>();

/**
 * Get CORS headers for response (cached per origin)
 * @param request - NextRequest object
 * @param allowCredentials - Whether to allow credentials (cookies, etc.) - overrides env config
 * @returns CORS headers object
 */
export function getCorsHeaders(
  request: NextRequest,
  allowCredentials?: boolean
): Record<string, string> {
  const origin = request.headers.get('origin');
  const isAllowed = isOriginAllowed(origin);
  
  // Use provided allowCredentials or fall back to config
  const useCredentials = allowCredentials !== undefined ? allowCredentials : CORS_CONFIG.allowCredentials;
  
  // Cache key based on origin and credentials
  const cacheKey = `${origin || 'null'}:${useCredentials}`;
  
  // Return cached headers if available
  const cached = corsHeadersCache.get(cacheKey);
  if (cached && cached['Access-Control-Allow-Origin'] === (isAllowed && origin ? origin : 'null')) {
    return cached;
  }

  const headers: Record<string, string> = {
    // Access-Control-Allow-Origin
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : 'null',
    
    // Access-Control-Allow-Methods (from config)
    'Access-Control-Allow-Methods': CORS_CONFIG.allowedMethods,
    
    // Access-Control-Allow-Headers (from config)
    'Access-Control-Allow-Headers': CORS_CONFIG.allowedHeaders,
    
    // Access-Control-Max-Age (from config, in seconds)
    'Access-Control-Max-Age': String(CORS_CONFIG.maxAge),
  };

  // Allow credentials only if explicitly requested and origin is allowed
  if (useCredentials && isAllowed) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  // Expose headers that client can read (from config)
  headers['Access-Control-Expose-Headers'] = CORS_CONFIG.exposedHeaders;

  // Cache headers (limit cache size to prevent memory leak)
  if (corsHeadersCache.size < 100) {
    corsHeadersCache.set(cacheKey, headers);
  }

  return headers;
}

/**
 * Handle CORS preflight request (OPTIONS) - optimized
 * @param request - NextRequest object
 * @param allowCredentials - Whether to allow credentials - overrides env config
 * @returns NextResponse for OPTIONS request or null
 */
export function handleCorsPreflight(
  request: NextRequest,
  allowCredentials?: boolean
): NextResponse | null {
  // Only handle OPTIONS requests
  if (request.method !== 'OPTIONS') {
    return null;
  }

  const origin = request.headers.get('origin');
  
  // Fast rejection if origin is not allowed
  if (origin && !isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  const headers = getCorsHeaders(request, allowCredentials);
  
  return new NextResponse(null, {
    status: 204, // No Content
    headers,
  });
}

/**
 * Apply CORS headers to response (optimized)
 * @param response - NextResponse object
 * @param request - NextRequest object
 * @param allowCredentials - Whether to allow credentials - overrides env config
 * @returns NextResponse with CORS headers applied
 */
export function applyCorsHeaders(
  response: NextResponse,
  request: NextRequest,
  allowCredentials?: boolean
): NextResponse {
  const headers = getCorsHeaders(request, allowCredentials);
  
  // Use direct iteration for better performance
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  
  return response;
}
