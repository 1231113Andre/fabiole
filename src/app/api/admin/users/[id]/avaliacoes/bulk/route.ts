import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { sanitizeInt, sanitizeStringValue, getErrorMessage, isValidUuid } from "@/lib/utils/sanitizers";
import { Logger } from "@/lib/utils/logger";
import { avaliacaoRepository } from "@/lib/db/repositories/AvaliacaoRepository";
import type { CreateAvaliacaoDTO } from "@/lib/db/repositories/AvaliacaoRepository";

interface AvaliacaoRecord {
    date: string;
    pushUps?: unknown;
    sitUps?: unknown;
    mile?: string | null;
    mileResult?: string | null;
    notes?: string | null;
}

/**
 * Bulk create avaliacoes - much faster than sequential inserts
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

    const invalidRecords = body.filter((r: AvaliacaoRecord) => !r.date);
    if (invalidRecords.length > 0) {
        return NextResponse.json({
            error: `${invalidRecords.length} records missing required 'date' field`
        }, { status: 400 });
    }

    try {
        // Prepare all records for batch insert using repository DTO format
        const records: CreateAvaliacaoDTO[] = body.map((record: AvaliacaoRecord) => ({
            userId: user_uuid,
            date: new Date(record.date),
            pushUps: sanitizeInt(record.pushUps) ?? undefined,
            sitUps: sanitizeInt(record.sitUps) ?? undefined,
            mile: sanitizeStringValue(record.mile) ?? undefined,
            mileResult: sanitizeStringValue(record.mileResult) ?? undefined,
            notes: sanitizeStringValue(record.notes) ?? undefined,
        }));

        // Use repository - automatically invalidates cache for all affected users
        const result = await avaliacaoRepository.createMany(records);

        if (!result.success) {
            Logger.error('Admin', `Failed to bulk create avaliacoes for user ${user_uuid}`, result.error);
            return NextResponse.json({ error: 'Internal error', details: getErrorMessage(result.error) }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            count: result.data,
            message: `${result.data} avaliacoes created successfully`
        });
    } catch (error: unknown) {
        Logger.error('Admin', `Failed to bulk create avaliacoes for user ${user_uuid}`, error);
        return NextResponse.json({ error: 'Internal error', details: getErrorMessage(error) }, { status: 500 });
    }
});
