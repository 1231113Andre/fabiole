/**
 * @fileoverview Performance utilities for API responses
 * @description Helpers for optimizing API response performance
 */

import { NextResponse } from 'next/server';

/**
 * Apply performance headers to API response
 * @param response - NextResponse object
 * @param options - Performance options
 * @returns NextResponse with performance headers
 */
export function applyPerformanceHeaders(
  response: NextResponse,
  options: {
    /** Enable compression */
    compress?: boolean;
    /** Cache control for response */
    cacheControl?: string;
    /** Enable ETag for conditional requests */
    enableETag?: boolean;
  } = {}
): NextResponse {
  const {
    compress = true,
    cacheControl = 'no-cache, no-store, must-revalidate',
    enableETag = false,
  } = options;

  // Compression is handled by Next.js automatically when compress: true in config
  // But we can hint the client
  if (compress) {
    response.headers.set('Accept-Encoding', 'gzip, deflate, br');
  }

  // Cache control
  if (cacheControl) {
    response.headers.set('Cache-Control', cacheControl);
  }

  // ETag support (for conditional requests)
  if (enableETag) {
    // ETag would be generated based on response content
    // This is a placeholder - implement based on your needs
    response.headers.set('ETag', `"${Date.now()}"`);
  }

  return response;
}

/**
 * Optimized JSON response with performance headers
 * @param data - Data to send as JSON
 * @param status - HTTP status code
 * @param options - Response options
 * @returns NextResponse with optimized JSON
 */
export function jsonResponse(
  data: any,
  status: number = 200,
  options: {
    compress?: boolean;
    cacheControl?: string;
    headers?: Record<string, string>;
  } = {}
): NextResponse {
  const response = NextResponse.json(data, { status });
  
  // Apply custom headers
  if (options.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      response.headers.set(key, value);
    }
  }

  // Apply performance headers
  return applyPerformanceHeaders(response, {
    compress: options.compress,
    cacheControl: options.cacheControl,
  });
}

