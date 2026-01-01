import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { sanitizeValueForUpdate, sanitizeStringForUpdate, getErrorMessage } from "@/lib/utils/sanitizers";
import { invalidatePesagensCache, invalidateAdminUserDetail } from "@/lib/cache/adminCache";
import { clearUserData } from "@/lib/cache/userCache";

export const PUT = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();

    try {
        const updateData: Record<string, unknown> = {};

        if (body.date) updateData.date = new Date(body.date);
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

        const pesagem = await db.pesagem.update({
            where: { id: Number(id) },
            data: updateData,
            include: { user: { select: { id: true, email: true } } }
        });

        // Invalidate caches
        invalidatePesagensCache();
        if (pesagem.user) {
            invalidateAdminUserDetail(pesagem.user.id);
            if (pesagem.user.email) clearUserData(pesagem.user.email);
        }

        return NextResponse.json(pesagem);
    } catch (error: unknown) {
        console.error('Update pesagem error:', error);
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

        await db.pesagem.delete({
            where: { id: Number(id) }
        });

        // Invalidate caches
        invalidatePesagensCache();
        if (pesagem?.user) {
            invalidateAdminUserDetail(pesagem.user.id);
            if (pesagem.user.email) clearUserData(pesagem.user.email);
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Delete pesagem error:', error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessage(error) }, { status: 500 });
    }
});
