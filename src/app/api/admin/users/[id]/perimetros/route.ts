import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { checkAdmin } from "@/lib/api/utils/adminAuth";
import { sanitizeValue } from "@/lib/utils/sanitizers";
import { invalidatePerimetrosCache, invalidateAdminUserDetail } from "@/lib/cache/adminCache";
import { clearUserData } from "@/lib/cache/userCache";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await checkAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: user_uuid } = await params;
    const body = await req.json();

    // Validate required field: date
    if (!body.date) {
        return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 });
    }

    try {
        const perimetro = await db.perimetroCorporal.create({
            data: {
                user_uuid,
                date: new Date(body.date),
                msRight: sanitizeValue(body.msRight),
                msRightFlex: sanitizeValue(body.msRightFlex),
                msLeft: sanitizeValue(body.msLeft),
                msLeftFlex: sanitizeValue(body.msLeftFlex),
                chest: sanitizeValue(body.chest),
                waist: sanitizeValue(body.waist),
                abdomen: sanitizeValue(body.abdomen),
                hips: sanitizeValue(body.hips),
                thighR: sanitizeValue(body.thighR),
                thighL: sanitizeValue(body.thighL),
            }
        });

        // Invalidate caches
        invalidatePerimetrosCache();
        invalidateAdminUserDetail(user_uuid);
        const user = await db.user.findUnique({ where: { id: user_uuid }, select: { email: true } });
        if (user?.email) clearUserData(user.email);

        return NextResponse.json(perimetro);
    } catch (error: unknown) {
        console.error('Create perimetro error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
