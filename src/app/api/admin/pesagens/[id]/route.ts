import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { sanitizeValueForUpdate, sanitizeStringForUpdate, getErrorMessage, isValidNumericId } from "@/lib/utils/sanitizers";
import { Logger } from "@/lib/utils/logger";
import { pesagemRepository } from "@/lib/db/repositories/PesagemRepository";
import type { UpdatePesagemDTO } from "@/lib/db/repositories/PesagemRepository";

export const PUT = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const numId = isValidNumericId(id);
    if (numId === null) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    const body = await req.json();

    try {
        const updateData: Record<string, unknown> = {};

        if (body.date !== undefined) updateData.date = new Date(body.date);
        if (body.peso !== undefined) updateData.peso = sanitizeValueForUpdate(body.peso);
        if (body.height !== undefined) updateData.height = sanitizeValueForUpdate(body.height);
        if (body.percentualMG !== undefined) updateData.percentualMG = sanitizeValueForUpdate(body.percentualMG);
        if (body.mm !== undefined) updateData.mm = sanitizeValueForUpdate(body.mm);
        if (body.h2o !== undefined) updateData.h2o = sanitizeValueForUpdate(body.h2o);
        if (body.imc !== undefined) updateData.imc = sanitizeValueForUpdate(body.imc);
        if (body.gordVisceral !== undefined) updateData.gordVisceral = sanitizeValueForUpdate(body.gordVisceral);
        if (body.idMetabolica !== undefined) updateData.idMetabolica = sanitizeValueForUpdate(body.idMetabolica);
        if (body.massaOssea !== undefined) updateData.massaOssea = sanitizeValueForUpdate(body.massaOssea);
        if (body.smi !== undefined) updateData.smi = sanitizeValueForUpdate(body.smi);
        if (body.resultadoIMC !== undefined) updateData.resultadoIMC = sanitizeStringForUpdate(body.resultadoIMC);
        if (body.resultadoPercentMG !== undefined) updateData.resultadoPercentMG = sanitizeStringForUpdate(body.resultadoPercentMG);
        if (body.notas !== undefined) updateData.notas = sanitizeStringForUpdate(body.notas);

        // Validate that at least one field is being updated
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        // Use repository - automatically invalidates cache and returns fresh data
        const result = await pesagemRepository.update(numId, updateData as UpdatePesagemDTO);

        if (!result.success) {
            Logger.error('Admin', `Failed to update pesagem ${id}`, result.error);
            return NextResponse.json({ error: 'Internal error', message: getErrorMessage(result.error) }, { status: 500 });
        }

        // Return fresh data (not from cache - repository already invalidated cache)
        return NextResponse.json(result.data);
    } catch (error: unknown) {
        Logger.error('Admin', `Failed to update pesagem ${id}`, error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessage(error) }, { status: 500 });
    }
});

export const DELETE = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const numId = isValidNumericId(id);
    if (numId === null) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    try {
        // Use repository - automatically invalidates cache
        const result = await pesagemRepository.delete(numId);

        if (!result.success) {
            // Check if it's a "not found" error
            if (result.error.message?.includes('Record to delete does not exist') || 
                result.error.message?.includes('not found')) {
                return NextResponse.json({ error: 'Pesagem not found' }, { status: 404 });
            }
            Logger.error('Admin', `Failed to delete pesagem ${id}`, result.error);
            return NextResponse.json({ error: 'Internal error', message: getErrorMessage(result.error) }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        Logger.error('Admin', `Failed to delete pesagem ${id}`, error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessage(error) }, { status: 500 });
    }
});
