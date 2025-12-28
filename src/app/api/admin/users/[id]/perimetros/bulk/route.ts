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
 * Bulk create perimetros - much faster than sequential inserts
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

    const invalidRecords = body.filter((r: any) => !r.date);
    if (invalidRecords.length > 0) {
        return NextResponse.json({ 
            error: `${invalidRecords.length} records missing required 'date' field` 
        }, { status: 400 });
    }

    try {
        const records = body.map((record: any) => ({
            user_uuid,
            date: new Date(record.date),
            msRight: sanitizeValue(record.msRight),
            msRightFlex: sanitizeValue(record.msRightFlex),
            msLeft: sanitizeValue(record.msLeft),
            msLeftFlex: sanitizeValue(record.msLeftFlex),
            chest: sanitizeValue(record.chest),
            waist: sanitizeValue(record.waist),
            abdomen: sanitizeValue(record.abdomen),
            hips: sanitizeValue(record.hips),
            thighR: sanitizeValue(record.thighR),
            thighL: sanitizeValue(record.thighL),
        }));

        const result = await db.perimetroCorporal.createMany({
            data: records,
            skipDuplicates: false
        });

        return NextResponse.json({ 
            success: true, 
            count: result.count,
            message: `${result.count} perimetros created successfully`
        });
    } catch (error: any) {
        console.error('Bulk create perimetros error:', error);
        return NextResponse.json({ error: 'Internal error', details: error.message }, { status: 500 });
    }
}

