import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { sanitizeValue, sanitizeStringValue, getErrorMessage, isValidUuid } from "@/lib/utils/sanitizers";
import { Logger } from "@/lib/utils/logger";
import { pesagemRepository } from "@/lib/db/repositories/PesagemRepository";
import type { CreatePesagemDTO } from "@/lib/db/repositories/PesagemRepository";

export const POST = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id: user_uuid } = await params;
    if (!isValidUuid(user_uuid)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    const body = await req.json();

    // Validate required field: date
    if (!body.date) {
        return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 });
    }

    try {
        // Use repository - automatically invalidates cache and returns fresh data
        const createData: CreatePesagemDTO = {
            userId: user_uuid,
            date: new Date(body.date),
            peso: sanitizeValue(body.peso) ?? undefined,
            height: sanitizeValue(body.height) ?? undefined,
            percentualMG: sanitizeValue(body.percentualMG) ?? undefined,
            mm: sanitizeValue(body.mm) ?? undefined,
            h2o: sanitizeValue(body.h2o) ?? undefined,
            imc: sanitizeValue(body.imc) ?? undefined,
            gordVisceral: sanitizeValue(body.gordVisceral) ?? undefined,
            idMetabolica: sanitizeValue(body.idMetabolica) ?? undefined,
            massaOssea: sanitizeValue(body.massaOssea) ?? undefined,
            smi: sanitizeValue(body.smi) ?? undefined,
            resultadoIMC: sanitizeStringValue(body.resultadoIMC) ?? undefined,
            resultadoPercentMG: sanitizeStringValue(body.resultadoPercentMG) ?? undefined,
            notas: sanitizeStringValue(body.notas) ?? undefined,
        };

        const result = await pesagemRepository.create(createData);

        if (!result.success) {
            Logger.error('Admin', `Failed to create pesagem for user ${user_uuid}`, result.error);
            return NextResponse.json({ error: 'Internal error', message: getErrorMessage(result.error) }, { status: 500 });
        }

        // Return fresh data (not from cache - repository already invalidated cache)
        return NextResponse.json(result.data);
    } catch (error: unknown) {
        Logger.error('Admin', `Failed to create pesagem for user ${user_uuid}`, error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessage(error) }, { status: 500 });
    }
});
