/**
 * @fileoverview CORS utilities for API routes
 * @description Shared CORS preflight handler for API routes
 */

import { NextResponse } from 'next/server';

/**
 * CORS options for preflight requests
 */
export interface CorsOptions {
  methods?: string[];
  allowedHeaders?: string[];
  maxAge?: number;
}

/**
 * Default CORS options
 */
const DEFAULT_CORS_OPTIONS: Required<CorsOptions> = {
  methods: ['POST', 'GET', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  maxAge: 86400, // 24 hours
};

/**
 * Create CORS preflight OPTIONS handler
 * @param options - Optional CORS configuration
 * @returns OPTIONS handler function
 */
export function createOptionsHandler(options: CorsOptions = {}) {
  const corsOptions = { ...DEFAULT_CORS_OPTIONS, ...options };

  return async function OPTIONS() {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': corsOptions.methods.join(', '),
        'Access-Control-Allow-Headers': corsOptions.allowedHeaders.join(', '),
        'Access-Control-Max-Age': String(corsOptions.maxAge),
      },
    });
  };
}

