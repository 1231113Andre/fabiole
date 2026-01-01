import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { sanitizeValueForUpdate, getErrorMessage } from "@/lib/utils/sanitizers";
import { invalidatePerimetrosCache, invalidateAdminUserDetail } from "@/lib/cache/adminCache";
import { clearUserData } from "@/lib/cache/userCache";

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

        const perimetro = await db.perimetroCorporal.update({
            where: { id: Number(id) },
            data: updateData,
            include: { user: { select: { id: true, email: true } } }
        });

        // Invalidate caches
        invalidatePerimetrosCache();
        if (perimetro.user) {
            invalidateAdminUserDetail(perimetro.user.id);
            if (perimetro.user.email) clearUserData(perimetro.user.email);
        }

        return NextResponse.json(perimetro);
    } catch (error: unknown) {
        console.error('Update perimetro error:', error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessage(error) }, { status: 500 });
    }
});

export const DELETE = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    try {
        // Get user info before deleting
        const perimetro = await db.perimetroCorporal.findUnique({
            where: { id: Number(id) },
            include: { user: { select: { id: true, email: true } } }
        });

        await db.perimetroCorporal.delete({
            where: { id: Number(id) }
        });

        // Invalidate caches
        invalidatePerimetrosCache();
        if (perimetro?.user) {
            invalidateAdminUserDetail(perimetro.user.id);
            if (perimetro.user.email) clearUserData(perimetro.user.email);
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Delete perimetro error:', error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessage(error) }, { status: 500 });
    }
});
