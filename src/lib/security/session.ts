/**
 * @fileoverview Session signing and validation utilities
 * @description Secure session management using JWT (jose library)
 *              Signs session cookies to prevent tampering
 */

import { SignJWT, jwtVerify } from 'jose';

/**
 * Secret key for signing sessions
 * SECURITY: Must be set via SESSION_SECRET environment variable
 * Fails securely if not configured
 */
const getSecretKey = (): Uint8Array => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is required for secure sessions');
  }
  return new TextEncoder().encode(secret);
};

export interface SessionPayload {
  email: string;
  name: string;
  surname: string;
  birth: string;
  iat?: number;
  exp?: number;
}

/**
 * Create a signed session token
 * @param payload - Session data to sign
 * @param maxAge - Maximum age in seconds (default: 7 days)
 * @returns Signed JWT token
 */
export async function signSession(
  payload: Omit<SessionPayload, 'iat' | 'exp'>,
  maxAge: number = 60 * 60 * 24 * 7 // 7 days
): Promise<string> {
  const secret = getSecretKey();
  const now = Math.floor(Date.now() / 1000);

  const jwt = await new SignJWT({
    email: payload.email,
    name: payload.name,
    surname: payload.surname,
    birth: payload.birth,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + maxAge)
    .sign(secret);

  return jwt;
}

/**
 * Verify and decode a session token
 * @param token - JWT token to verify
 * @returns Decoded session payload if valid, null otherwise
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret);

    return {
      email: payload.email as string,
      name: payload.name as string,
      surname: payload.surname as string,
      birth: payload.birth as string,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch (error) {
    // Token is invalid, expired, or malformed
    return null;
  }
}

/**
 * Check if session is expired
 * @param payload - Session payload
 * @returns True if expired, false otherwise
 */
export function isSessionExpired(payload: SessionPayload): boolean {
  if (!payload.exp) {
    return true;
  }
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

