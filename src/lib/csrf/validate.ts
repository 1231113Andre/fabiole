/**
 * @fileoverview CSRF validation helper for API routes
 * @description Validates CSRF tokens using Double Submit Cookie pattern with origin validation
 *              Based on OWASP CSRF Prevention Cheat Sheet best practices
 */

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { compareTokens, isValidTokenFormat } from './csrf';

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

  // Extract host from request URL
  const requestHost = request.nextUrl.host;
  const requestProtocol = request.nextUrl.protocol;

  // Helper to normalize host (remove www. prefix for comparison)
  const normalizeHost = (h: string) => h.replace(/^www\./, '').toLowerCase();

  try {
    // Validate origin if present
    if (origin) {
      const originUrl = new URL(origin);
      const originHost = normalizeHost(originUrl.host);
      const reqHost = normalizeHost(requestHost);

      // Check protocol (allow http in dev, require https in prod)
      const protocolMatch = process.env.NODE_ENV === 'development'
        || originUrl.protocol === requestProtocol
        || (originUrl.protocol === 'https:' && requestProtocol === 'https:');

      // Host should match (with www normalization)
      if (!protocolMatch || originHost !== reqHost) {
        console.error('[CSRF] Origin validation failed:', {
          originHost,
          reqHost,
          originProtocol: originUrl.protocol,
          requestProtocol,
        });
        return false;
      }
    }

    // Validate referer if present (and no origin)
    if (!origin && referer) {
      const refererUrl = new URL(referer);
      const refererHost = normalizeHost(refererUrl.host);
      const reqHost = normalizeHost(requestHost);

      // Check protocol
      const protocolMatch = process.env.NODE_ENV === 'development'
        || refererUrl.protocol === requestProtocol
        || (refererUrl.protocol === 'https:' && requestProtocol === 'https:');

      // Host should match (with www normalization)
      if (!protocolMatch || refererHost !== reqHost) {
        console.error('[CSRF] Referer validation failed:', {
          refererHost,
          reqHost,
          refererProtocol: refererUrl.protocol,
          requestProtocol,
        });
        return false;
      }
    }
  } catch (error) {
    // Invalid URL format - reject
    console.error('[CSRF] URL parsing error:', error);
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
      return {
        valid: false,
        error: 'CSRF token missing in header',
      };
    }

    // Step 2: Validate token format
    if (!isValidTokenFormat(headerToken)) {
      return {
        valid: false,
        error: 'Invalid CSRF token format',
      };
    }

    // Step 3: Get token from cookie
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(CSRF_TOKEN_COOKIE_NAME);

    if (!cookieToken || !cookieToken.value) {
      return {
        valid: false,
        error: 'CSRF token missing in cookie',
      };
    }

    // Step 4: Validate cookie token format
    if (!isValidTokenFormat(cookieToken.value)) {
      return {
        valid: false,
        error: 'Invalid CSRF token format in cookie',
      };
    }

    // Step 5: Compare tokens using constant-time comparison (prevents timing attacks)
    if (!compareTokens(headerToken, cookieToken.value)) {
      return {
        valid: false,
        error: 'CSRF token mismatch',
      };
    }

    // Step 6: Additional origin validation (defense in depth)
    // This is optional but recommended as additional security layer
    // SameSite cookie protection + origin validation provides strong CSRF protection
    if (!validateOrigin(request)) {
      return {
        valid: false,
        error: 'Origin validation failed',
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('[CSRF] Validation error:', error);
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
