/**
 * @fileoverview Consolidated admin authentication utility
 * @description Centralized admin check with role caching
 */

import { cookies } from "next/headers";
import { verifySession } from "@/lib/security/session";
import { getUserRole, isAdmin as isAdminCached } from "@/lib/cache/roleCache";
import { db } from "@/lib/db/client";

export interface AdminSession {
    email: string;
    userId: string;
    role: string;
}

/**
 * Check if the current request is from an authenticated administrator
 * Uses cached role lookup for performance
 * @returns AdminSession if admin, null otherwise
 */
export async function checkAdmin(): Promise<AdminSession | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');

    if (!sessionCookie) return null;

    const session = await verifySession(sessionCookie.value);
    if (!session?.email || !session?.uuid) return null;

    // Use cached role check
    const role = await getUserRole(session.uuid);
    if (role !== 'ADMINISTRATOR') return null;

    return {
        email: session.email,
        userId: session.uuid,
        role
    };
}

/**
 * Fast admin check - returns boolean only
 * Uses cached role lookup
 */
export async function checkAdminFast(): Promise<boolean> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');

    if (!sessionCookie) return false;

    const session = await verifySession(sessionCookie.value);
    if (!session?.uuid) return false;

    return await isAdminCached(session.uuid);
}

/**
 * Check if email belongs to an admin
 * Note: This still requires DB lookup as we don't have userId from email
 * Consider using checkAdmin() instead when session is available
 */
export async function isAdminEmail(email: string): Promise<boolean> {
    const user = await db.user.findUnique({
        where: { email },
        select: { id: true, role: true }
    });
    return user?.role === 'ADMINISTRATOR';
}
