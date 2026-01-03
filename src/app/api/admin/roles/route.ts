import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { Logger } from "@/lib/utils/logger";

export const GET = withAdminAuth(async (req, session) => {
    try {
        // Fetch distinct roles from the database
        const roles = await db.user.findMany({
            select: { role: true },
            distinct: ['role']
        });

        // Always ensure USER and ADMINISTRATOR are in the list if they aren't in the DB yet
        interface RoleItem {
            role: string;
        }
        const roleValues = new Set<string>(roles.map((r: RoleItem) => r.role));
        roleValues.add('USER');
        roleValues.add('ADMINISTRATOR');

        return NextResponse.json({
            roles: Array.from(roleValues)
        });
    } catch (error: unknown) {
        Logger.error('Admin', 'Failed to fetch roles', error);
        return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }
});

