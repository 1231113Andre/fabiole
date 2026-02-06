import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { sanitizeValue, sanitizeStringValue, getErrorMessage, isValidUuid } from "@/lib/utils/sanitizers";
import { Logger } from "@/lib/utils/logger";
import { pesagemRepository } from "@/lib/db/repositories/PesagemRepository";
import type { CreatePesagemDTO } from "@/lib/db/repositories/PesagemRepository";

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
    if (!isValidUuid(user_uuid)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
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
        // Prepare all records for batch insert using repository DTO format
        const records: CreatePesagemDTO[] = body.map((record: PesagemRecord) => ({
            userId: user_uuid,
            date: new Date(record.date),
            peso: sanitizeValue(record.peso) ?? undefined,
            height: sanitizeValue(record.height) ?? undefined,
            percentualMG: sanitizeValue(record.percentualMG) ?? undefined,
            mm: sanitizeValue(record.mm) ?? undefined,
            h2o: sanitizeValue(record.h2o) ?? undefined,
            imc: sanitizeValue(record.imc) ?? undefined,
            gordVisceral: sanitizeValue(record.gordVisceral) ?? undefined,
            idMetabolica: sanitizeValue(record.idMetabolica) ?? undefined,
            massaOssea: sanitizeValue(record.massaOssea) ?? undefined,
            resultadoIMC: sanitizeStringValue(record.resultadoIMC) ?? undefined,
            resultadoPercentMG: sanitizeStringValue(record.resultadoPercentMG) ?? undefined,
            notas: sanitizeStringValue(record.notas) ?? undefined,
        }));

        // Use repository - automatically invalidates cache for all affected users
        const result = await pesagemRepository.createMany(records);

        if (!result.success) {
            Logger.error('Admin', `Failed to bulk create pesagens for user ${user_uuid}`, result.error);
            return NextResponse.json({ error: 'Internal error', details: getErrorMessage(result.error) }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            count: result.data,
            message: `${result.data} pesagens created successfully`
        });
    } catch (error: unknown) {
        Logger.error('Admin', `Failed to bulk create pesagens for user ${user_uuid}`, error);
        return NextResponse.json({ error: 'Internal error', details: getErrorMessage(error) }, { status: 500 });
    }
});
