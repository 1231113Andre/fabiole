import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { invalidatePesagensCache, invalidateAdminUserDetail } from "@/lib/cache/adminCache";
import { clearUserData } from "@/lib/cache/userCache";
import { sanitizeValue, sanitizeStringValue, getErrorMessage } from "@/lib/utils/sanitizers";

interface PesagemRecord {
    date: string;
    peso?: unknown;
    height?: unknown;
    percentualMG?: unknown;
    mm?: unknown;
    h2o?: unknown;
    imc?: unknown;
    gordVisceral?: unknown;
    idMetabolica?: unknown;
    massaOssea?: unknown;
    resultadoIMC?: string | null;
    resultadoPercentMG?: string | null;
    notas?: string | null;
}

/**
 * Bulk create pesagens - much faster than sequential inserts
 * Uses Prisma's createMany for optimized batch insert
 */
export const POST = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id: user_uuid } = await params;
    const body = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
        return NextResponse.json({ error: 'Body must be a non-empty array' }, { status: 400 });
    }

    // Validate all records have date
    const invalidRecords = body.filter((r: PesagemRecord) => !r.date);
    if (invalidRecords.length > 0) {
        return NextResponse.json({
            error: `${invalidRecords.length} records missing required 'date' field`
        }, { status: 400 });
    }

    try {
        // Prepare all records for batch insert
        const records = body.map((record: PesagemRecord) => ({
            user_uuid,
            date: new Date(record.date),
            peso: sanitizeValue(record.peso),
            height: sanitizeValue(record.height),
            percentualMG: sanitizeValue(record.percentualMG),
            mm: sanitizeValue(record.mm),
            h2o: sanitizeValue(record.h2o),
            imc: sanitizeValue(record.imc),
            gordVisceral: sanitizeValue(record.gordVisceral),
            idMetabolica: sanitizeValue(record.idMetabolica),
            massaOssea: sanitizeValue(record.massaOssea),
            resultadoIMC: sanitizeStringValue(record.resultadoIMC),
            resultadoPercentMG: sanitizeStringValue(record.resultadoPercentMG),
            notas: sanitizeStringValue(record.notas),
        }));

        // Single batch insert - much faster than individual inserts
        const result = await db.pesagem.createMany({
            data: records,
            skipDuplicates: false
        });

        // Invalidate caches
        invalidatePesagensCache();
        invalidateAdminUserDetail(user_uuid);
        const user = await db.user.findUnique({ where: { id: user_uuid }, select: { email: true } });
        if (user?.email) clearUserData(user.email);

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `${result.count} pesagens created successfully`
        });
    } catch (error: unknown) {
        console.error('Bulk create pesagens error:', error);
        return NextResponse.json({ error: 'Internal error', details: getErrorMessage(error) }, { status: 500 });
    }
});
