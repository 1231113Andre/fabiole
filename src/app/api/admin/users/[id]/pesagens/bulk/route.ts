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

function sanitizeValue(value: any): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    if (typeof value === 'string' && value.trim() === '') {
        return null;
    }
    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
        return parseFloat(value);
    }
    if (typeof value === 'number') {
        return value;
    }
    return null;
}

/**
 * Bulk create pesagens - much faster than sequential inserts
 * Uses Prisma's createMany for optimized batch insert
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

    // Validate all records have date
    const invalidRecords = body.filter((r: any) => !r.date);
    if (invalidRecords.length > 0) {
        return NextResponse.json({ 
            error: `${invalidRecords.length} records missing required 'date' field` 
        }, { status: 400 });
    }

    try {
        // Prepare all records for batch insert
        const records = body.map((record: any) => ({
            user_uuid,
            date: new Date(record.date),
            peso: sanitizeValue(record.peso),
            height: sanitizeValue(record.height),
            percentualMG: sanitizeValue(record.percentualMG),
            mm: sanitizeValue(record.mm),
            h2o: sanitizeValue(record.h2o),
            imc: sanitizeValue(record.imc),
            gordVisceral: sanitizeValue(record.gordVisceral),
            idMetabolica: sanitizeValue(record.idMetabolica),
            massaOssea: sanitizeValue(record.massaOssea),
            resultadoIMC: record.resultadoIMC || null,
            resultadoPercentMG: record.resultadoPercentMG || null,
            notas: record.notas || null,
        }));

        // Single batch insert - much faster than individual inserts
        const result = await db.pesagem.createMany({
            data: records,
            skipDuplicates: false
        });

        return NextResponse.json({ 
            success: true, 
            count: result.count,
            message: `${result.count} pesagens created successfully`
        });
    } catch (error: any) {
        console.error('Bulk create pesagens error:', error);
        return NextResponse.json({ error: 'Internal error', details: error.message }, { status: 500 });
    }
}

