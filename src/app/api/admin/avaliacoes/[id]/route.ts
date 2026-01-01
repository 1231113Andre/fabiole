import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { sanitizeIntForUpdate, sanitizeStringForUpdate, getErrorMessage } from "@/lib/utils/sanitizers";
import { invalidateAvaliacoesCache, invalidateAdminUserDetail } from "@/lib/cache/adminCache";
import { clearUserData } from "@/lib/cache/userCache";

export const PUT = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();

    try {
        const updateData: Record<string, unknown> = {};

        if (body.date !== undefined) updateData.date = new Date(body.date);
        if (body.pushUps !== undefined) updateData.pushUps = sanitizeIntForUpdate(body.pushUps);
        if (body.sitUps !== undefined) updateData.sitUps = sanitizeIntForUpdate(body.sitUps);
        if (body.mile !== undefined) updateData.mile = sanitizeStringForUpdate(body.mile);
        if (body.mileResult !== undefined) updateData.mileResult = sanitizeStringForUpdate(body.mileResult);
        if (body.notes !== undefined) updateData.notes = sanitizeStringForUpdate(body.notes);

        const avaliacao = await db.avaliacaoFisica.update({
            where: { id: Number(id) },
            data: updateData,
            include: { user: { select: { id: true, email: true } } }
        });

        // Invalidate caches
        invalidateAvaliacoesCache();
        if (avaliacao.user) {
            invalidateAdminUserDetail(avaliacao.user.id);
            if (avaliacao.user.email) clearUserData(avaliacao.user.email);
        }

        return NextResponse.json(avaliacao);
    } catch (error: unknown) {
        console.error('Update avaliacao error:', error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessage(error) }, { status: 500 });
    }
});

export const DELETE = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    try {
        // Get user info before deleting
        const avaliacao = await db.avaliacaoFisica.findUnique({
            where: { id: Number(id) },
            include: { user: { select: { id: true, email: true } } }
        });

        await db.avaliacaoFisica.delete({
            where: { id: Number(id) }
        });

        // Invalidate caches
        invalidateAvaliacoesCache();
        if (avaliacao?.user) {
            invalidateAdminUserDetail(avaliacao.user.id);
            if (avaliacao.user.email) clearUserData(avaliacao.user.email);
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Delete avaliacao error:', error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessage(error) }, { status: 500 });
    }
});
