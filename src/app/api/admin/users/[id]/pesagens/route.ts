import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { sanitizeValue, sanitizeStringValue, getErrorMessage } from "@/lib/utils/sanitizers";
import { invalidatePesagensCache, invalidateAdminUserDetail } from "@/lib/cache/adminCache";
import { clearUserData } from "@/lib/cache/userCache";

export const POST = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id: user_uuid } = await params;
    const body = await req.json();

    // Validate required field: date
    if (!body.date) {
        return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 });
    }

    try {
        const pesagem = await db.pesagem.create({
            data: {
                user_uuid,
                date: new Date(body.date),
                peso: sanitizeValue(body.peso),
                height: sanitizeValue(body.height),
                percentualMG: sanitizeValue(body.percentualMG),
                mm: sanitizeValue(body.mm),
                h2o: sanitizeValue(body.h2o),
                imc: sanitizeValue(body.imc),
                gordVisceral: sanitizeValue(body.gordVisceral),
                idMetabolica: sanitizeValue(body.idMetabolica),
                massaOssea: sanitizeValue(body.massaOssea),
                resultadoIMC: sanitizeStringValue(body.resultadoIMC),
                resultadoPercentMG: sanitizeStringValue(body.resultadoPercentMG),
                notas: sanitizeStringValue(body.notas),
            }
        });

        // Invalidate relevant caches
        invalidatePesagensCache();
        invalidateAdminUserDetail(user_uuid);
        
        // Also invalidate user's client cache (get email from user)
        const user = await db.user.findUnique({ where: { id: user_uuid }, select: { email: true } });
        if (user?.email) clearUserData(user.email);

        return NextResponse.json(pesagem);
    } catch (error: unknown) {
        console.error('Create pesagem error:', error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessage(error) }, { status: 500 });
    }
});
