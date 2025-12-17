import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateCsrfTokenSync, isValidTokenFormat } from './lib/csrf/csrf';
import { applySecurityHeaders } from './lib/security/headers';
import { handleCorsPreflight, applyCorsHeaders } from './lib/security/cors';
import { checkRateLimit, RATE_LIMITS } from './lib/security/rateLimit';
import { verifySession, isSessionExpired } from './lib/security/session';

const CSRF_TOKEN_COOKIE_NAME = 'csrf-token';
const CSRF_TOKEN_MAX_AGE = 60 * 60 * 24; // 24 hours - token valid for session
const AUTH_SESSION_COOKIE_NAME = 'auth_session';

// Pre-compiled route patterns for faster matching (performance optimization)
const PROTECTED_ROUTES = ['/dashboard', '/api/user', '/api/health'];
const PUBLIC_AUTH_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/auth/session', '/login', '/registar'];

/**
 * Check if route requires authentication (optimized with early returns)
 * @param pathname - Request pathname
 * @returns {boolean} True if route requires authentication
 */
function requiresAuth(pathname: string): boolean {
  // Fast path: early return for common non-protected routes
  if (pathname === '/' || pathname.startsWith('/_next/') || pathname.startsWith('/api/auth/')) {
    return false;
  }

  // Check against protected routes
  for (const route of PROTECTED_ROUTES) {
    if (pathname.startsWith(route)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a route is a public auth route (optimized)
 * @param pathname - Request pathname
 * @returns {boolean} True if route is a public auth route
 */
function isPublicAuthRoute(pathname: string): boolean {
  for (const route of PUBLIC_AUTH_ROUTES) {
    if (pathname.startsWith(route)) {
      return true;
    }
  }
  return false;
}

/**
 * Validate authentication from request cookies (Edge Runtime compatible, optimized)
 * @param request - Next.js request object
 * @returns {boolean} True if user is authenticated
 * 
 * Note: This is a synchronous check for middleware performance.
 * For full JWT verification, use the async verifySession in API routes.
 * This function does a quick format check - full verification happens in API routes.
 */
function validateAuthEdge(request: NextRequest): boolean {
  // Fast path: check cookie existence first
  const sessionCookie = request.cookies.get(AUTH_SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return false;
  }

  // Quick format check: JWT tokens have 3 parts separated by dots
  // This is a fast synchronous check for middleware performance
  const tokenParts = sessionCookie.value.split('.');
  if (tokenParts.length !== 3) {
    return false;
  }

  // Basic format validation passed
  // Full JWT verification with expiration check happens in API routes
  // Middleware just checks if token exists and has correct format
  return true;
}

/**
 * Middleware to:
 * 1. Generate and maintain CSRF token cookie (session-based, not per-request)
 * 2. Protect routes that require authentication
 * 3. Redirect unauthenticated users from protected routes
 * 4. Apply security headers and CORS
 * 5. Rate limiting for API routes
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Early returns for common cases
 * - Cached security headers
 * - Optimized route matching
 * - Session-based CSRF tokens (not per-request)
 * - Efficient rate limiting with cleanup
 * 
 * CSRF Token Strategy:
 * - Generate token once per session (24 hours validity)
 * - Reuse same token for all requests in session (performance)
 * - Token stored in cookie (httpOnly=false so JS can read it)
 * - Client sends same token in X-CSRF-Token header
 * - Double Submit Cookie pattern (OWASP recommended)
 * 
 * Note: Uses Edge Runtime compatible functions (no next/headers)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // PERFORMANCE: Early return for static assets (before any processing)
  // This is handled by Next.js matcher, but added as safety check
  if (pathname.startsWith('/_next/static/') || pathname.startsWith('/_next/image/')) {
    return NextResponse.next();
  }

  // PERFORMANCE: Handle CORS preflight requests early (OPTIONS)
  if (method === 'OPTIONS' && pathname.startsWith('/api/')) {
    const preflightResponse = handleCorsPreflight(request, false);
    if (preflightResponse) {
      return applySecurityHeaders(preflightResponse);
    }
  }

  // PERFORMANCE: Rate limiting only for API routes (early check)
  if (pathname.startsWith('/api/')) {
    // Stricter rate limits for auth endpoints
    const isAuthEndpoint = pathname.startsWith('/api/auth/');
    const rateLimitConfig = isAuthEndpoint ? RATE_LIMITS.AUTH : RATE_LIMITS.API;

    const rateLimitResult = checkRateLimit(request, rateLimitConfig);
    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        {
          error: rateLimitResult.message || 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 900),
            'X-RateLimit-Limit': String(rateLimitConfig.maxRequests),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
      return applySecurityHeaders(applyCorsHeaders(response, request, false));
    }
  }

  // Create response early (needed for CSRF token cookie)
  const response = NextResponse.next();

  // Add pathname to headers for server components (SSR)
  response.headers.set('x-pathname', pathname);

  // Disable caching in development mode
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // PERFORMANCE: CSRF Token Management (Session-based, optimized)
  // Strategy: Generate token once, reuse for entire session (24 hours)
  // Token validation uses Double Submit Cookie pattern

  let csrfToken = request.cookies.get(CSRF_TOKEN_COOKIE_NAME)?.value;

  // Only generate new token if needed (optimized check)
  if (!csrfToken || !isValidTokenFormat(csrfToken)) {
    csrfToken = generateCsrfTokenSync();
  }

  // Set/refresh CSRF token cookie (only if changed or missing)
  // - SameSite: 'Strict' - strongest CSRF protection (only same-site requests)
  // - httpOnly: false - must be accessible to JavaScript for header
  // - Secure: true in production (HTTPS only)
  // - Path: '/' - available for all routes
  response.cookies.set(CSRF_TOKEN_COOKIE_NAME, csrfToken, {
    maxAge: CSRF_TOKEN_MAX_AGE,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    httpOnly: false,
  });

  // PERFORMANCE: Authentication check only for protected routes
  if (requiresAuth(pathname) && !isPublicAuthRoute(pathname)) {
    const isAuthenticated = validateAuthEdge(request);

    if (!isAuthenticated) {
      // For API routes, return 401 Unauthorized
      if (pathname.startsWith('/api/')) {
        const apiResponse = NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
        return applySecurityHeaders(applyCorsHeaders(apiResponse, request, false));
      }

      // For page routes, redirect to home
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(homeUrl);
    }
  }

  // PERFORMANCE: Apply security headers (cached) and CORS (cached per origin)
  // Only apply CORS to API routes (performance optimization)
  let finalResponse = applySecurityHeaders(response);
  if (pathname.startsWith('/api/')) {
    finalResponse = applyCorsHeaders(finalResponse, request, false);
  }

  return finalResponse;
}

/**
 * Configure which routes should run middleware
 * Run on all routes except static files and API routes that don't need CSRF
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
