import { db } from '@/lib/db/client';
import { verifySession } from '@/lib/security/session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Check if email belongs to an admin (User with role = ADMINISTRATOR)
 */
export async function isAdminEmail(email: string): Promise<boolean> {
    const user = await db.user.findUnique({
        where: { email },
        select: { role: true }
    });
    return user?.role === 'ADMINISTRATOR';
}

/**
 * Check if current user is an administrator
 * @returns User info if admin, redirects to dashboard if not
 */
export async function requireAdmin() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');

    if (!sessionCookie) {
        redirect('/');
    }

    const session = await verifySession(sessionCookie.value);
    if (!session || !session.email) {
        redirect('/');
    }

    const isAdmin = await isAdminEmail(session.email);
    if (!isAdmin) {
        redirect('/dashboard');
    }

    return { email: session.email, name: session.name };
}


