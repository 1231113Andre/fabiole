
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

// Helper to convert empty strings to null and parse integers
function parseIntOrNull(value: any): number | null {
    if (value === undefined || value === null || value === '') return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
}

// Helper to convert empty strings to null for string fields
function parseStringOrNull(value: any): string | null {
    if (value === undefined || value === null || value === '') return null;
    return String(value);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await checkAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: user_uuid } = await params;
    const body = await req.json();

    // Validate required field: date
    if (!body.date) {
        return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 });
    }

    try {
        const avaliacao = await db.avaliacaoFisica.create({
            data: {
                user_uuid,
                date: new Date(body.date),
                pushUps: parseIntOrNull(body.pushUps),
                sitUps: parseIntOrNull(body.sitUps),
                mile: parseStringOrNull(body.mile),
                mileResult: parseStringOrNull(body.mileResult),
                notes: parseStringOrNull(body.notes),
            }
        });

        return NextResponse.json(avaliacao);
    } catch (error: any) {
        console.error('Create avaliacao error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
