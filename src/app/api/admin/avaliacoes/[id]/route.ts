import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";

// Helper to sanitize integer values
function sanitizeInt(value: any): number | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
}

// Helper to sanitize string values
function sanitizeString(value: any): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    return String(value);
}

export const PUT = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();

    try {
        // Build update data only for fields that are explicitly provided
        const updateData: Record<string, any> = {};

        if (body.date !== undefined) updateData.date = new Date(body.date);
        if (body.pushUps !== undefined) updateData.pushUps = sanitizeInt(body.pushUps);
        if (body.sitUps !== undefined) updateData.sitUps = sanitizeInt(body.sitUps);
        if (body.mile !== undefined) updateData.mile = sanitizeString(body.mile);
        if (body.mileResult !== undefined) updateData.mileResult = sanitizeString(body.mileResult);
        if (body.notes !== undefined) updateData.notes = sanitizeString(body.notes);

        const avaliacao = await db.avaliacaoFisica.update({
            where: { id: Number(id) },
            data: updateData
        });

        return NextResponse.json(avaliacao);
    } catch (error: any) {
        console.error('Update avaliacao error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
});

export const DELETE = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    try {
        await db.avaliacaoFisica.delete({
            where: { id: Number(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete avaliacao error:', error);
        return NextResponse.json({ error: 'Internal error', code: error.code, details: error.message }, { status: 500 });
    }
});
