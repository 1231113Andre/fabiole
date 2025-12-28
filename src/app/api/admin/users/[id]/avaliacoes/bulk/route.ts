import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/security/session";

async function checkAdmin() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');

    if (!sessionCookie) return null;

    const session = await verifySession(sessionCookie.value);
    if (!session?.email) return null;

    const user = await db.user.findUnique({
        where: { email: session.email },
        select: { role: true }
    });

    return user?.role === 'ADMINISTRATOR' ? session : null;
}

interface AvaliacaoRecord {
    date: string;
    pushUps?: unknown;
    sitUps?: unknown;
    mile?: string | null;
    mileResult?: string | null;
    notes?: string | null;
}

function sanitizeInt(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? null : parsed;
}

/**
 * Bulk create avaliacoes - much faster than sequential inserts
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await checkAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: user_uuid } = await params;
    const body = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
        return NextResponse.json({ error: 'Body must be a non-empty array' }, { status: 400 });
    }

    const invalidRecords = body.filter((r: AvaliacaoRecord) => !r.date);
    if (invalidRecords.length > 0) {
        return NextResponse.json({ 
            error: `${invalidRecords.length} records missing required 'date' field` 
        }, { status: 400 });
    }

    try {
        const records = body.map((record: AvaliacaoRecord) => ({
            user_uuid,
            date: new Date(record.date),
            pushUps: sanitizeInt(record.pushUps),
            sitUps: sanitizeInt(record.sitUps),
            mile: record.mile || null,
            mileResult: record.mileResult || null,
            notes: record.notes || null,
        }));

        const result = await db.avaliacaoFisica.createMany({
            data: records,
            skipDuplicates: false
        });

        return NextResponse.json({ 
            success: true, 
            count: result.count,
            message: `${result.count} avaliacoes created successfully`
        });
    } catch (error: any) {
        console.error('Bulk create avaliacoes error:', error);
        return NextResponse.json({ error: 'Internal error', details: error.message }, { status: 500 });
    }
}

