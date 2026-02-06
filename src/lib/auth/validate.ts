import 'server-only';
/**
 * @fileoverview Authentication validation helper for API routes and middleware
 * @description Provides utilities to check user authentication status
 * @author Fabio Le Platform
 */

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession, isSessionExpired, SessionPayload } from '@/lib/security/session';
import { getCachedSession, setCachedSession } from '@/lib/security/sessionCache';
import { Logger } from '@/lib/utils/logger';

export interface AuthUser {
  name: string;
  surname: string;
  email: string;
  birth: string;
}

export interface AuthResult {
  authenticated: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Validate authentication from request cookies
 * Checks for auth_session cookie and parses user data
 * 
 * @param request - Next.js request object (optional, for middleware)
 * @returns {Promise<AuthResult>} Authentication result with user data if authenticated
 */
export async function validateAuth(request?: NextRequest): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('auth_session');

    if (!session) {
      return {
        authenticated: false,
        error: 'No session found',
      };
    }

    try {
      // Check cache first (JWT verification is expensive)
      const cachedPayload = await getCachedSession<SessionPayload>(session.value);

      if (cachedPayload) {
        // Check if session is expired
        if (isSessionExpired(cachedPayload)) {
          return {
            authenticated: false,
            error: 'Session expired',
          };
        }

        // Validate user data structure
        if (!cachedPayload.email || !cachedPayload.name || !cachedPayload.surname) {
          return {
            authenticated: false,
            error: 'Invalid session data',
          };
        }

        return {
          authenticated: true,
          user: {
            email: cachedPayload.email,
            name: cachedPayload.name,
            surname: cachedPayload.surname,
            birth: cachedPayload.birth,
          },
        };
      }

      // Try to verify as JWT (new format) - not in cache
      const payload = await verifySession(session.value);

      if (payload) {
        // Cache the result for future requests
        await setCachedSession(session.value, payload);

        // Check if session is expired
        if (isSessionExpired(payload)) {
          return {
            authenticated: false,
            error: 'Session expired',
          };
        }

        // Validate user data structure
        if (!payload.email || !payload.name || !payload.surname) {
          return {
            authenticated: false,
            error: 'Invalid session data',
          };
        }

        return {
          authenticated: true,
          user: {
            email: payload.email,
            name: payload.name,
            surname: payload.surname,
            birth: payload.birth,
          },
        };
      }

      // JWT verification failed - session invalid (legacy JSON format no longer supported)
      return {
        authenticated: false,
        error: 'Invalid session format',
      };
    } catch (error) {
      return {
        authenticated: false,
        error: 'Invalid session format',
      };
    }
  } catch (error) {
    Logger.error('Security', 'Authentication Boundary Error: An unexpected exception occurred during the session validation lifecycle.', error);
    return {
      authenticated: false,
      error: 'Authentication check failed',
    };
  }
}




