
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
function sanitizeValue(value: any): number | null | string | undefined {
    if (value === null || value === undefined || value === '') {
        return undefined; // Use undefined for update to skip field
    }
    if (typeof value === 'string' && value.trim() === '') {
        return undefined;
    }
    // For numeric fields, try to parse
    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
        return parseFloat(value);
    }
    return value;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await checkAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    try {
        const updateData: any = {};

        if (body.date) updateData.date = new Date(body.date);
        if (body.peso !== undefined) updateData.peso = sanitizeValue(body.peso);
        if (body.height !== undefined) updateData.height = sanitizeValue(body.height);
        if (body.percentualMG !== undefined) updateData.percentualMG = sanitizeValue(body.percentualMG);
        if (body.mm !== undefined) updateData.mm = sanitizeValue(body.mm);
        if (body.h2o !== undefined) updateData.h2o = sanitizeValue(body.h2o);
        if (body.imc !== undefined) updateData.imc = sanitizeValue(body.imc);
        if (body.gordVisceral !== undefined) updateData.gordVisceral = sanitizeValue(body.gordVisceral);
        if (body.idMetabolica !== undefined) updateData.idMetabolica = sanitizeValue(body.idMetabolica);
        if (body.massaOssea !== undefined) updateData.massaOssea = sanitizeValue(body.massaOssea);
        if (body.resultadoIMC !== undefined) updateData.resultadoIMC = body.resultadoIMC || null;
        if (body.resultadoPercentMG !== undefined) updateData.resultadoPercentMG = body.resultadoPercentMG || null;
        if (body.notas !== undefined) updateData.notas = body.notas || null;

        const pesagem = await db.pesagem.update({
            where: { id: Number(id) },
            data: updateData
        });

        return NextResponse.json(pesagem);
    } catch (error: any) {
        console.error('Update pesagem error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await checkAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    try {
        await db.pesagem.delete({
            where: { id: Number(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete pesagem error:', error);
        return NextResponse.json({ error: 'Internal error', code: error.code, details: error.message }, { status: 500 });
    }
}
