import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { sanitizeValueForUpdate, getErrorMessage } from "@/lib/utils/sanitizers";
import { Logger } from "@/lib/utils/logger";
import { perimetroRepository } from "@/lib/db/repositories/PerimetroRepository";
import type { UpdatePerimetroDTO } from "@/lib/db/repositories/PerimetroRepository";

export const PUT = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();

    try {
        const updateData: Record<string, unknown> = {};

        if (body.date !== undefined) updateData.date = new Date(body.date);
        if (body.msRight !== undefined) updateData.msRight = sanitizeValueForUpdate(body.msRight);
        if (body.msRightFlex !== undefined) updateData.msRightFlex = sanitizeValueForUpdate(body.msRightFlex);
        if (body.msLeft !== undefined) updateData.msLeft = sanitizeValueForUpdate(body.msLeft);
        if (body.msLeftFlex !== undefined) updateData.msLeftFlex = sanitizeValueForUpdate(body.msLeftFlex);
        if (body.chest !== undefined) updateData.chest = sanitizeValueForUpdate(body.chest);
        if (body.waist !== undefined) updateData.waist = sanitizeValueForUpdate(body.waist);
        if (body.abdomen !== undefined) updateData.abdomen = sanitizeValueForUpdate(body.abdomen);
        if (body.hips !== undefined) updateData.hips = sanitizeValueForUpdate(body.hips);
        if (body.thighR !== undefined) updateData.thighR = sanitizeValueForUpdate(body.thighR);
        if (body.thighL !== undefined) updateData.thighL = sanitizeValueForUpdate(body.thighL);

        // Validate that at least one field is being updated
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        // Use repository - automatically invalidates cache and returns fresh data
        const result = await perimetroRepository.update(Number(id), updateData as UpdatePerimetroDTO);

        if (!result.success) {
            Logger.error('Admin', `Failed to update perimetro ${id}`, result.error);
            return NextResponse.json({ error: 'Internal error', message: getErrorMessage(result.error) }, { status: 500 });
        }

        // Return fresh data (not from cache - repository already invalidated cache)
        return NextResponse.json(result.data);
    } catch (error: unknown) {
        Logger.error('Admin', `Failed to update perimetro ${id}`, error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessage(error) }, { status: 500 });
    }
});

export const DELETE = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    try {
        // Use repository - automatically invalidates cache
        const result = await perimetroRepository.delete(Number(id));

        if (!result.success) {
            // Check if it's a "not found" error
            if (result.error.message?.includes('Record to delete does not exist') || 
                result.error.message?.includes('not found')) {
                return NextResponse.json({ error: 'Perimetro not found' }, { status: 404 });
            }
            Logger.error('Admin', `Failed to delete perimetro ${id}`, result.error);
            return NextResponse.json({ error: 'Internal error', message: getErrorMessage(result.error) }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        Logger.error('Admin', `Failed to delete perimetro ${id}`, error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessage(error) }, { status: 500 });
    }
});
