import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateCsrfTokenSync } from '@/lib/csrf/csrf';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);

  // Add the pathname to headers so ServerNavbar can access it
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  // Create response with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set CSRF token cookie if not present
  const existingToken = request.cookies.get(CSRF_COOKIE_NAME);
  if (!existingToken) {
    const csrfToken = generateCsrfTokenSync();
    response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: false, // Must be readable by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: CSRF_COOKIE_MAX_AGE,
      path: '/',
    });
  }

  return response;
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
