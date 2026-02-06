/**
 * @fileoverview CSRF validation helper for API routes
 * @description Validates CSRF tokens using Double Submit Cookie pattern with origin validation
 *              Based on OWASP CSRF Prevention Cheat Sheet best practices
 */

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { compareTokens, isValidTokenFormat } from './csrf';
import { Logger } from '../utils/logger';
import { emitSecurityEvent } from '@/lib/security/securityEvents';

const CSRF_TOKEN_COOKIE_NAME = 'csrf-token';
const CSRF_TOKEN_HEADER_NAME = 'X-CSRF-Token';

/**
 * Validate Origin and Referer headers
 * Additional security layer to ensure request comes from same origin
 * @param request - Next.js request object
 * @returns {boolean} True if origin is valid
 */
function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  // If no origin/referer and we have host, it's same-origin (acceptable)
  if (!origin && !referer && host) {
    return true;
  }

  // Helper to normalize host (remove www. prefix and port for comparison)
  const normalizeHost = (h: string) => h.replace(/^www\./, '').split(':')[0].toLowerCase();

  // Get the expected host from environment or request
  const expectedHost = normalizeHost(
    process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host
      : host || request.nextUrl.host
  );

  try {
    // Validate origin if present
    if (origin) {
      const originUrl = new URL(origin);
      const originHost = normalizeHost(originUrl.host);

      // Only check host match - Vercel's internal routing may change protocol
      if (originHost !== expectedHost) {
        Logger.error('Security', 'CSRF Violation: Origin header validation failed during security check.', {
          originHost,
          expectedHost,
          origin,
          host,
        });
        emitSecurityEvent({ type: 'CSRF_VIOLATION', context: { reason: 'origin_mismatch' } });
        return false;
      }
      return true;
    }

    // Validate referer if present (and no origin)
    if (referer) {
      const refererUrl = new URL(referer);
      const refererHost = normalizeHost(refererUrl.host);

      // Only check host match
      if (refererHost !== expectedHost) {
        Logger.error('Security', 'CSRF Violation: Referer header validation failed during security check.', {
          refererHost,
          expectedHost,
          referer,
          host,
        });
        emitSecurityEvent({ type: 'CSRF_VIOLATION', context: { reason: 'referer_mismatch' } });
        return false;
      }
      return true;
    }
  } catch (error) {
    // Invalid URL format - reject
    Logger.error('Security', 'CSRF Subsystem: Critical URL parsing error encountered during header validation.', error);
    return false;
  }

  return true;
}

/**
 * Validate CSRF token from request
 * Uses Double Submit Cookie pattern (OWASP recommended):
 * 1. Token in cookie (csrf-token) - set by middleware
 * 2. Token in header (X-CSRF-Token) - sent by client
 * 3. Tokens must match exactly
 * 4. Origin/Referer validation as additional security layer
 * 
 * @param request - Next.js request object
 * @returns {Promise<{ valid: boolean; error?: string }>} Validation result
 */
export async function validateCsrfToken(
  request: NextRequest
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Step 1: Get token from header
    const headerToken = request.headers.get(CSRF_TOKEN_HEADER_NAME);

    if (!headerToken) {
      emitSecurityEvent({ type: 'CSRF_VIOLATION', context: { reason: 'token_missing_header' } });
      return {
        valid: false,
        error: 'CSRF token missing in header',
      };
    }

    // Step 2: Validate token format
    if (!isValidTokenFormat(headerToken)) {
      emitSecurityEvent({ type: 'CSRF_VIOLATION', context: { reason: 'invalid_token_format' } });
      return {
        valid: false,
        error: 'Invalid CSRF token format',
      };
    }

    // Step 3: Get token from cookie
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(CSRF_TOKEN_COOKIE_NAME);

    if (!cookieToken || !cookieToken.value) {
      emitSecurityEvent({ type: 'CSRF_VIOLATION', context: { reason: 'token_missing_cookie' } });
      return {
        valid: false,
        error: 'CSRF token missing in cookie',
      };
    }

    // Step 4: Validate cookie token format
    if (!isValidTokenFormat(cookieToken.value)) {
      emitSecurityEvent({ type: 'CSRF_VIOLATION', context: { reason: 'invalid_cookie_token_format' } });
      return {
        valid: false,
        error: 'Invalid CSRF token format in cookie',
      };
    }

    // Step 5: Compare tokens using constant-time comparison (prevents timing attacks)
    if (!compareTokens(headerToken, cookieToken.value)) {
      emitSecurityEvent({ type: 'CSRF_VIOLATION', context: { reason: 'token_mismatch' } });
      return {
        valid: false,
        error: 'CSRF token mismatch',
      };
    }

    // Step 6: Additional origin validation (defense in depth)
    // This is optional but recommended as additional security layer
    // SameSite cookie protection + origin validation provides strong CSRF protection
    if (!validateOrigin(request)) {
      emitSecurityEvent({ type: 'CSRF_VIOLATION', context: { reason: 'origin_validation_failed' } });
      return {
        valid: false,
        error: 'Origin validation failed',
      };
    }

    return { valid: true };
  } catch (error) {
    Logger.error('Security', 'CSRF Validation Failure: Internal error encountered in the double-submit token verification pipeline.', error);
    emitSecurityEvent({ type: 'CSRF_VIOLATION', context: { reason: 'validation_error' } });
    return {
      valid: false,
      error: 'CSRF validation failed',
    };
  }
}

/**
 * Check if request method requires CSRF protection
 * State-changing methods require CSRF protection
 * @param method - HTTP method
 * @returns {boolean} True if method requires CSRF protection
 */
export function requiresCsrfProtection(method: string): boolean {
  const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  return protectedMethods.includes(method.toUpperCase());
}
