
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

// Helper function to convert empty strings to null and parse numbers
function sanitizeValue(value: any): number | null | string {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    if (typeof value === 'string' && value.trim() === '') {
        return null;
    }
    // For numeric fields, try to parse
    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
        return parseFloat(value);
    }
    return value;
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
        const pesagem = await db.pesagem.create({
            data: {
                user_uuid,
                date: new Date(body.date),
                peso: sanitizeValue(body.peso),
                height: sanitizeValue(body.height),
                percentualMG: sanitizeValue(body.percentualMG),
                mm: sanitizeValue(body.mm),
                h2o: sanitizeValue(body.h2o),
                imc: sanitizeValue(body.imc),
                gordVisceral: sanitizeValue(body.gordVisceral),
                idMetabolica: sanitizeValue(body.idMetabolica),
                massaOssea: sanitizeValue(body.massaOssea),
                resultadoIMC: body.resultadoIMC || null,
                resultadoPercentMG: body.resultadoPercentMG || null,
                notas: body.notas || null,
            }
        });

        return NextResponse.json(pesagem);
    } catch (error: any) {
        console.error('Create pesagem error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
