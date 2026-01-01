import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";

// Helper function to convert empty strings to null and parse numbers
function sanitizeValue(value: any): number | null | undefined {
    if (value === null || value === undefined || value === '') {
        return undefined; // Use undefined for update to skip field
    }
    if (typeof value === 'string' && value.trim() === '') {
        return undefined;
    }
    // Parse as number
    const num = parseFloat(value);
    return !isNaN(num) ? num : undefined;
}

// Helper for string fields - ensures proper string type and filters invalid values
function sanitizeStringValue(value: any): string | null | undefined {
    if (value === null || value === undefined || value === '') {
        return undefined;
    }
    const strValue = String(value).trim();
    // Filter out spreadsheet errors
    if (strValue.startsWith('#') || strValue === '') {
        return undefined;
    }
    return strValue;
}

export const PUT = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
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
        // String fields - ensure proper type conversion
        if (body.resultadoIMC !== undefined) updateData.resultadoIMC = sanitizeStringValue(body.resultadoIMC);
        if (body.resultadoPercentMG !== undefined) updateData.resultadoPercentMG = sanitizeStringValue(body.resultadoPercentMG);
        if (body.notas !== undefined) updateData.notas = sanitizeStringValue(body.notas);

        const pesagem = await db.pesagem.update({
            where: { id: Number(id) },
            data: updateData
        });

        return NextResponse.json(pesagem);
    } catch (error: any) {
        console.error('Update pesagem error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
});

export const DELETE = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
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
});
