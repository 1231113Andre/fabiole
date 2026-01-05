import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { sanitizeInt, sanitizeStringValue, getErrorMessage } from "@/lib/utils/sanitizers";
import { Logger } from "@/lib/utils/logger";
import { avaliacaoRepository } from "@/lib/db/repositories/AvaliacaoRepository";
import type { CreateAvaliacaoDTO } from "@/lib/db/repositories/AvaliacaoRepository";

export const POST = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id: user_uuid } = await params;
    const body = await req.json();

    // Validate required field: date
    if (!body.date) {
        return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 });
    }

    try {
        // Use repository - automatically invalidates cache and returns fresh data
        const createData: CreateAvaliacaoDTO = {
            userId: user_uuid,
            date: new Date(body.date),
            pushUps: sanitizeInt(body.pushUps) ?? undefined,
            sitUps: sanitizeInt(body.sitUps) ?? undefined,
            mile: sanitizeStringValue(body.mile) ?? undefined,
            mileResult: sanitizeStringValue(body.mileResult) ?? undefined,
            notes: sanitizeStringValue(body.notes) ?? undefined,
        };

        const result = await avaliacaoRepository.create(createData);

        if (!result.success) {
            Logger.error('Admin', `Failed to create avaliacao for user ${user_uuid}`, result.error);
            return NextResponse.json({ error: 'Internal error', message: getErrorMessage(result.error) }, { status: 500 });
        }

        // Return fresh data (not from cache - repository already invalidated cache)
        return NextResponse.json(result.data);
    } catch (error: unknown) {
        Logger.error('Admin', `Failed to create avaliacao for user ${user_uuid}`, error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessage(error) }, { status: 500 });
    }
});
