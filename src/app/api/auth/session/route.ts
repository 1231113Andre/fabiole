import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { requestIdMiddleware } from '@/lib/api/middleware/RequestIdMiddleware';
import { compressionMiddleware } from '@/lib/api/middleware/CompressionMiddleware';
import { authMiddleware } from '@/lib/api/middleware/AuthMiddleware';
import { csrfMiddleware } from '@/lib/api/middleware/CsrfMiddleware';
import { AuthService } from '@/lib/api/services/AuthService';
import { verifySession, isSessionExpired } from '@/lib/security/session';
import { cookies } from 'next/headers';

// Force dynamic - session validation should always be fresh
export const dynamic = 'force-dynamic';

// GET handler - check session
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
        {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        }
      );
    }

    try {
      // Try to verify as JWT (new format)
      const payload = await verifySession(session.value);

      if (payload) {
        // Check if session is expired
        if (isSessionExpired(payload)) {
          return ApiResponse.custom(
            401,
            { authenticated: false, error: 'Session expired' },
            {
              'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            }
          );
        }

        return ApiResponse.custom(
          200,
          {
            authenticated: true,
            user: {
              email: payload.email,
              name: payload.name,
              surname: payload.surname,
              birth: payload.birth,
            },
          },
          {
            'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
          }
        );
      }

      // Fallback: try to parse as JSON (legacy format)
      try {
        const userData = JSON.parse(session.value);
        return ApiResponse.custom(
          200,
          {
            authenticated: true,
            user: userData,
          },
          {
            'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
          }
        );
      } catch (parseError) {
        return ApiResponse.custom(
          401,
          { authenticated: false, error: 'Invalid session format' },
          {
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          }
        );
      }
    } catch (error) {
      return ApiResponse.custom(
        401,
        { authenticated: false, error: 'Session validation failed' },
        {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        }
      );
    }
  });

// DELETE handler - logout
const deleteSessionHandler = new BaseRouteHandler()
  .use(requestIdMiddleware)
  .use(compressionMiddleware)
  .use(csrfMiddleware)
  .handle(async (context) => {
    const logoutCookie = AuthService.createLogoutCookie();

    const response = ApiResponse.success(
      { message: 'Logged out successfully' },
      200
    );

    // Delete session cookie
    response.cookies = [logoutCookie];

    return response;
  });

export const GET = getSessionHandler.toNextHandler();
export const DELETE = deleteSessionHandler.toNextHandler();

// Handle CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
      'Access-Control-Max-Age': '86400',
    },
  });
}
