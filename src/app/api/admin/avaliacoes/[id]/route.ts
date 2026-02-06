import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { sanitizeIntForUpdate, sanitizeStringForUpdate, getErrorMessage, isValidNumericId } from "@/lib/utils/sanitizers";
import { Logger } from "@/lib/utils/logger";
import { avaliacaoRepository } from "@/lib/db/repositories/AvaliacaoRepository";
import type { UpdateAvaliacaoDTO } from "@/lib/db/repositories/AvaliacaoRepository";

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
        if (body.pushUps !== undefined) updateData.pushUps = sanitizeIntForUpdate(body.pushUps);
        if (body.sitUps !== undefined) updateData.sitUps = sanitizeIntForUpdate(body.sitUps);
        if (body.mile !== undefined) updateData.mile = sanitizeStringForUpdate(body.mile);
        if (body.mileResult !== undefined) updateData.mileResult = sanitizeStringForUpdate(body.mileResult);
        if (body.notes !== undefined) updateData.notes = sanitizeStringForUpdate(body.notes);

        // Validate that at least one field is being updated
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        // Use repository - automatically invalidates cache and returns fresh data
        const result = await avaliacaoRepository.update(numId, updateData as UpdateAvaliacaoDTO);

        if (!result.success) {
            Logger.error('Admin', `Failed to update avaliacao ${id}`, result.error);
            return NextResponse.json({ error: 'Internal error', message: getErrorMessage(result.error) }, { status: 500 });
        }

        // Return fresh data (not from cache - repository already invalidated cache)
        return NextResponse.json(result.data);
    } catch (error: unknown) {
        Logger.error('Admin', `Failed to update avaliacao ${id}`, error);
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
        const result = await avaliacaoRepository.delete(numId);

        if (!result.success) {
            // Check if it's a "not found" error
            if (result.error.message?.includes('Record to delete does not exist') || 
                result.error.message?.includes('not found')) {
                return NextResponse.json({ error: 'Avaliacao not found' }, { status: 404 });
            }
            Logger.error('Admin', `Failed to delete avaliacao ${id}`, result.error);
            return NextResponse.json({ error: 'Internal error', message: getErrorMessage(result.error) }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        Logger.error('Admin', `Failed to delete avaliacao ${id}`, error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessage(error) }, { status: 500 });
    }
});
