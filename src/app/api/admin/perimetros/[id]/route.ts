
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

// Helper to sanitize decimal values - only update if field is present
function sanitizeValue(value: any): number | null | undefined {
    if (value === undefined) return undefined; // Don't update field
    if (value === null || value === '') return null; // Set to null
    if (typeof value === 'string' && value.trim() === '') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await checkAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    try {
        // Build update data only for fields that are explicitly provided
        const updateData: Record<string, any> = {};

        if (body.date !== undefined) updateData.date = new Date(body.date);
        if (body.msRight !== undefined) updateData.msRight = sanitizeValue(body.msRight);
        if (body.msRightFlex !== undefined) updateData.msRightFlex = sanitizeValue(body.msRightFlex);
        if (body.msLeft !== undefined) updateData.msLeft = sanitizeValue(body.msLeft);
        if (body.msLeftFlex !== undefined) updateData.msLeftFlex = sanitizeValue(body.msLeftFlex);
        if (body.chest !== undefined) updateData.chest = sanitizeValue(body.chest);
        if (body.waist !== undefined) updateData.waist = sanitizeValue(body.waist);
        if (body.abdomen !== undefined) updateData.abdomen = sanitizeValue(body.abdomen);
        if (body.hips !== undefined) updateData.hips = sanitizeValue(body.hips);
        if (body.thighR !== undefined) updateData.thighR = sanitizeValue(body.thighR);
        if (body.thighL !== undefined) updateData.thighL = sanitizeValue(body.thighL);

        const perimetro = await db.perimetroCorporal.update({
            where: { id: Number(id) },
            data: updateData
        });

        return NextResponse.json(perimetro);
    } catch (error: any) {
        console.error('Update perimetro error:', error);
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
        await db.perimetroCorporal.delete({
            where: { id: Number(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete perimetro error:', error);
        return NextResponse.json({ error: 'Internal error', code: error.code, details: error.message }, { status: 500 });
    }
}
