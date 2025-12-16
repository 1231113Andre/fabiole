import { NextRequest } from 'next/server';
import { AuthUser } from '@/lib/auth/validate';

/**
 * Route context containing request metadata and processed data
 */
export interface RouteContext {
  /** Original Next.js request */
  request: NextRequest;
  
  /** Unique request ID for tracking */
  requestId: string;
  
  /** Authenticated user data (if authenticated) */
  user?: AuthUser;
  
  /** Validated and sanitized request data */
  validatedData?: unknown;
  
  /** Request metadata */
  metadata: {
    /** Request start time */
    startTime: number;
    /** Client IP address */
    ip: string;
    /** Request method */
    method: string;
    /** Request pathname */
    pathname: string;
    /** Request origin */
    origin?: string;
  };
  
  /** Response headers to be set */
  responseHeaders: Record<string, string>;
}

/**
 * Middleware function type
 * Returns RouteContext to continue, or ApiResponse to short-circuit
 */
export type Middleware = (
  context: RouteContext
) => Promise<RouteContext | ApiResponse>;

/**
 * Route handler function type
 */
export type RouteHandler = (
  context: RouteContext
) => Promise<ApiResponse>;

/**
 * Standardized API response
 */
export interface ApiResponse {
  /** Response status code */
  status: number;
  
  /** Response body */
  body: unknown;
  
  /** Response headers */
  headers: Record<string, string>;
  
  /** Response cookies to set */
  cookies?: Array<{
    name: string;
    value: string;
    options?: {
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
      maxAge?: number;
      path?: string;
    };
  }>;
}










