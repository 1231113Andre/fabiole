
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/security/session";

export async function GET() {
    // Basic auth check
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');

    if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch distinct roles from the database
        const roles = await db.user.findMany({
            select: { role: true },
            distinct: ['role']
        });

        // Always ensure USER and ADMINISTRATOR are in the list if they aren't in the DB yet
        const roleValues = new Set(roles.map(r => r.role));
        roleValues.add('USER');
        roleValues.add('ADMINISTRATOR');

        return NextResponse.json({
            roles: Array.from(roleValues)
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
        return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }
}
