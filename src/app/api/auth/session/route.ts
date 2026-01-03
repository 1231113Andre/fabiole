import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { requestIdMiddleware } from '@/lib/api/middleware/RequestIdMiddleware';
import { compressionMiddleware } from '@/lib/api/middleware/CompressionMiddleware';
import { csrfMiddleware } from '@/lib/api/middleware/CsrfMiddleware';
import { verifySession, isSessionExpired, SessionPayload } from '@/lib/security/session';
import { getCachedSession, setCachedSession } from '@/lib/security/sessionCache';
import { cookies } from 'next/headers';
import { createOptionsHandler } from '@/lib/api/utils/cors';

// Force dynamic - session validation should always be fresh
export const dynamic = 'force-dynamic';

// GET handler - check session (optimized with cache)
const getSessionHandler = new BaseRouteHandler()
  .use(requestIdMiddleware)
  .use(compressionMiddleware)
  .handle(async (context) => {
    const cookieStore = await cookies();
    const session = cookieStore.get('auth_session');

    if (!session) {
      return ApiResponse.custom(
        401,
        { authenticated: false },
        { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
      );
    }

    try {
      // Check cache first for faster response
      const cached = getCachedSession<SessionPayload>(session.value);
      if (cached && !isSessionExpired(cached)) {
        return ApiResponse.custom(
          200,
          {
            authenticated: true,
            user: {
              email: cached.email,
              name: cached.name,
              surname: cached.surname,
              birth: cached.birth,
              avatarUrl: cached.avatarUrl,
            },
          },
          { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
        );
      }

      // Verify JWT
      const payload = await verifySession(session.value);

      if (!payload) {
        return ApiResponse.custom(
          401,
          { authenticated: false, error: 'Invalid session' },
          { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
        );
      }

      // Check expiration
      if (isSessionExpired(payload)) {
        return ApiResponse.custom(
          401,
          { authenticated: false, error: 'Session expired' },
          { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
        );
      }

      // Cache the verified session
      setCachedSession(session.value, payload);

      return ApiResponse.custom(
        200,
        {
          authenticated: true,
          user: {
            email: payload.email,
            name: payload.name,
            surname: payload.surname,
            birth: payload.birth,
            avatarUrl: payload.avatarUrl,
          },
        },
        { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
      );
    } catch (error) {
      return ApiResponse.custom(
        401,
        { authenticated: false, error: 'Session validation failed' },
        { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
      );
    }
  });

// DELETE handler - logout (no CSRF needed - session cookie verification is sufficient)
const deleteSessionHandler = new BaseRouteHandler()
  .use(requestIdMiddleware)
  .use(compressionMiddleware)
  .handle(async (context) => {
    const cookieStore = await cookies();

    // Get session token before deleting to clear cache
    const session = cookieStore.get('auth_session');
    if (session?.value) {
      // Clear the session from cache
      const { clearCachedSession } = await import('@/lib/security/sessionCache');
      clearCachedSession(session.value);
    }

    // Delete the session cookie
    cookieStore.delete('auth_session');
    cookieStore.delete('has_session');

    return ApiResponse.custom(
      200,
      {
        success: true,
        data: { message: 'Logged out successfully' }
      },
      { 'Clear-Site-Data': '"cache", "cookies", "storage"' }
    );
  });

export const GET = getSessionHandler.toNextHandler();
export const DELETE = deleteSessionHandler.toNextHandler();

// Handle CORS preflight requests
export const OPTIONS = createOptionsHandler({
  methods: ['GET', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
});
