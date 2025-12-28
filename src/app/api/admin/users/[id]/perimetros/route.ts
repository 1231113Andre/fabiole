
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

// Helper to convert empty strings to null and parse decimals
function parseDecimalOrNull(value: any): number | null {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value === 'string' && value.trim() === '') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
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
        const perimetro = await db.perimetroCorporal.create({
            data: {
                user_uuid,
                date: new Date(body.date),
                msRight: parseDecimalOrNull(body.msRight),
                msRightFlex: parseDecimalOrNull(body.msRightFlex),
                msLeft: parseDecimalOrNull(body.msLeft),
                msLeftFlex: parseDecimalOrNull(body.msLeftFlex),
                chest: parseDecimalOrNull(body.chest),
                waist: parseDecimalOrNull(body.waist),
                abdomen: parseDecimalOrNull(body.abdomen),
                hips: parseDecimalOrNull(body.hips),
                thighR: parseDecimalOrNull(body.thighR),
                thighL: parseDecimalOrNull(body.thighL),
            }
        });

        return NextResponse.json(perimetro);
    } catch (error: any) {
        console.error('Create perimetro error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
