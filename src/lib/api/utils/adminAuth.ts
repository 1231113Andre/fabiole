/**
 * @fileoverview Shared admin authentication utility
 * @description Centralized admin check to reduce code duplication
 */

import { cookies } from "next/headers";
import { db } from "@/lib/db/client";
import { verifySession } from "@/lib/security/session";

export interface AdminSession {
    email: string;
    userId?: string;
    role: string;
}

/**
 * Check if the current request is from an authenticated administrator
 * @returns AdminSession if admin, null otherwise
 */
export async function checkAdmin(): Promise<AdminSession | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');

    if (!sessionCookie) return null;

    const session = await verifySession(sessionCookie.value);
    if (!session?.email) return null;

    const user = await db.user.findUnique({
        where: { email: session.email },
        select: { id: true, role: true }
    });

    if (user?.role !== 'ADMINISTRATOR') return null;

    return {
        email: session.email,
        userId: user.id,
        role: user.role
    };
}

/**
 * Alternative: check admin with cached session (for high-frequency endpoints)
 * Uses SELECT with minimal fields for performance
 */
export async function checkAdminFast(): Promise<boolean> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');

    if (!sessionCookie) return false;

    const session = await verifySession(sessionCookie.value);
    if (!session?.email) return false;

    const user = await db.user.findUnique({
        where: { email: session.email },
        select: { role: true }
    });

    return user?.role === 'ADMINISTRATOR';
}

