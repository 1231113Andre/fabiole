import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { sanitizeValue, getErrorMessageSafe, isValidUuid } from "@/lib/utils/sanitizers";
import { Logger } from "@/lib/utils/logger";
import { perimetroRepository } from "@/lib/db/repositories/PerimetroRepository";
import type { CreatePerimetroDTO } from "@/lib/db/repositories/PerimetroRepository";

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
        const createData: CreatePerimetroDTO = {
            userId: user_uuid,
            date: new Date(body.date),
            msRight: sanitizeValue(body.msRight) ?? undefined,
            msRightFlex: sanitizeValue(body.msRightFlex) ?? undefined,
            msLeft: sanitizeValue(body.msLeft) ?? undefined,
            msLeftFlex: sanitizeValue(body.msLeftFlex) ?? undefined,
            chest: sanitizeValue(body.chest) ?? undefined,
            waist: sanitizeValue(body.waist) ?? undefined,
            abdomen: sanitizeValue(body.abdomen) ?? undefined,
            hips: sanitizeValue(body.hips) ?? undefined,
            thighR: sanitizeValue(body.thighR) ?? undefined,
            thighL: sanitizeValue(body.thighL) ?? undefined,
        };

        const result = await perimetroRepository.create(createData);

        if (!result.success) {
            Logger.error('Admin', `Failed to create perimetro for user ${user_uuid}`, result.error);
            return NextResponse.json({ error: 'Internal error', message: getErrorMessageSafe(result.error) }, { status: 500 });
        }

        // Return fresh data (not from cache - repository already invalidated cache)
        return NextResponse.json(result.data);
    } catch (error: unknown) {
        Logger.error('Admin', `Failed to create perimetro for user ${user_uuid}`, error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessageSafe(error) }, { status: 500 });
    }
});
