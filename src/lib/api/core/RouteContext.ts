import { NextRequest } from 'next/server';
import { RouteContext } from './types';
import { AuthUser } from '@/lib/auth/validate';

/**
 * Create initial route context from request
 */
export function createRouteContext(request: NextRequest): RouteContext {
  const requestId = generateRequestId();
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0].trim() || 
             request.headers.get('x-real-ip') || 
             'unknown';

  return {
    request,
    requestId,
    metadata: {
      startTime: Date.now(),
      ip,
      method: request.method,
      pathname: request.nextUrl.pathname,
      origin: request.headers.get('origin') || undefined,
    },
    responseHeaders: {},
  };
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Update context with user data
 */
export function setUser(context: RouteContext, user: AuthUser): RouteContext {
  return {
    ...context,
    user,
  };
}

/**
 * Update context with validated data
 */
export function setValidatedData(
  context: RouteContext,
  data: unknown
): RouteContext {
  return {
    ...context,
    validatedData: data,
  };
}

/**
 * Add response header to context
 */
export function addResponseHeader(
  context: RouteContext,
  name: string,
  value: string
): RouteContext {
  return {
    ...context,
    responseHeaders: {
      ...context.responseHeaders,
      [name]: value,
    },
  };
}











