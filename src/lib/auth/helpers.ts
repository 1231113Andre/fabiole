import 'server-only';
/**
 * @fileoverview Authentication helper functions
 * @description Reusable utilities for authentication operations
 */

import { cookies } from 'next/headers';
import { verifySession, SessionPayload } from '@/lib/security/session';
import { comparePassword } from '@/lib/security/password';
import { db } from '@/lib/db/client';
import { NextResponse } from 'next/server';

/**
 * Normalize email (lowercase + trim)
 * Ensures consistent email lookups across the application
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Get and verify session from cookies
 * Returns session data if valid, or null with error response
 */
export async function getAuthenticatedSession(): Promise<
  | { session: SessionPayload; response: null }
  | { session: null; response: NextResponse }
> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session');

  if (!sessionCookie) {
    return {
      session: null,
      response: NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      ),
    };
  }

  const session = await verifySession(sessionCookie.value);
  if (!session || !session.email) {
    return {
      session: null,
      response: NextResponse.json(
        { success: false, error: 'Sessão inválida' },
        { status: 401 }
      ),
    };
  }

  return { session, response: null };
}

/**
 * Verify password using bcrypt comparison only.
 * Plain-text passwords in DB are no longer supported - users must reset password.
 */
export async function verifyPasswordWithFallback(
  plainPassword: string,
  hashedPassword: string,
  _userEmail?: string
): Promise<boolean> {
  return comparePassword(plainPassword, hashedPassword);
}

/**
 * Get user from database by email with normalization
 * Returns user if found, null otherwise
 */
export async function getUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return db.user.findUnique({
    where: { email: normalizedEmail },
  });
}

/**
 * Get authenticated user from session
 * Returns user if found, or null with error response
 */
export async function getAuthenticatedUser(): Promise<
  | { user: Awaited<ReturnType<typeof db.user.findUnique>>; response: null }
  | { user: null; response: NextResponse }
> {
  const sessionResult = await getAuthenticatedSession();
  if (sessionResult.response) {
    return { user: null, response: sessionResult.response };
  }

  const user = await getUserByEmail(sessionResult.session!.email);
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: 'Utilizador não encontrado' },
        { status: 404 }
      ),
    };
  }

  return { user, response: null };
}

