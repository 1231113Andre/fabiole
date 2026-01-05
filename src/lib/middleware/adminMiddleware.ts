/**
 * @fileoverview Admin middleware for page-level protection
 * @description Uses consolidated adminAuth for admin checks
 */

import { verifySession } from '@/lib/security/session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/cache/roleCache';

/**
 * Check if current user is an administrator
 * Uses cached role lookup for performance
 * @returns User info if admin, redirects to dashboard if not
 */
export async function requireAdmin() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');

    if (!sessionCookie) {
        redirect('/');
    }

    const session = await verifySession(sessionCookie.value);
    if (!session || !session.email || !session.uuid) {
        redirect('/');
    }

    // Use cached role check
    const isAdminUser = await isAdmin(session.uuid);
    if (!isAdminUser) {
        redirect('/dashboard');
    }

    return { email: session.email, name: session.name };
}

// Re-export from consolidated module for backwards compatibility
export { isAdminEmail, checkAdmin, checkAdminFast } from '@/lib/api/utils/adminAuth';
