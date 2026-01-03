import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { sanitizeValueForUpdate, sanitizeStringForUpdate, getErrorMessage } from "@/lib/utils/sanitizers";
import { Logger } from "@/lib/utils/logger";
import { invalidateUserCaches } from "@/lib/api/utils/cacheHelpers";

export const PUT = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
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
        if (body.resultadoIMC !== undefined) updateData.resultadoIMC = sanitizeStringForUpdate(body.resultadoIMC);
        if (body.resultadoPercentMG !== undefined) updateData.resultadoPercentMG = sanitizeStringForUpdate(body.resultadoPercentMG);
        if (body.notas !== undefined) updateData.notas = sanitizeStringForUpdate(body.notas);

        // Validate that at least one field is being updated
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        const pesagem = await db.pesagem.update({
            where: { id: Number(id) },
            data: updateData,
            include: { user: { select: { id: true, email: true } } }
        });

        // Invalidate caches
        if (pesagem.user) {
            await invalidateUserCaches(pesagem.user.id, { pesagens: true });
        }

        return NextResponse.json(pesagem);
    } catch (error: unknown) {
        Logger.error('Admin', `Failed to update pesagem ${id}`, error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessage(error) }, { status: 500 });
    }
});

export const DELETE = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    try {
        // Get user info before deleting
        const pesagem = await db.pesagem.findUnique({
            where: { id: Number(id) },
            include: { user: { select: { id: true, email: true } } }
        });

        if (!pesagem) {
            return NextResponse.json({ error: 'Pesagem not found' }, { status: 404 });
        }

        await db.pesagem.delete({
            where: { id: Number(id) }
        });

        // Invalidate caches
        if (pesagem.user) {
            await invalidateUserCaches(pesagem.user.id, { pesagens: true });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        Logger.error('Admin', `Failed to delete pesagem ${id}`, error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessage(error) }, { status: 500 });
    }
});
