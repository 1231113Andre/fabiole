import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { sanitizeValue, getErrorMessage, isValidUuid } from "@/lib/utils/sanitizers";
import { Logger } from "@/lib/utils/logger";
import { perimetroRepository } from "@/lib/db/repositories/PerimetroRepository";
import type { CreatePerimetroDTO } from "@/lib/db/repositories/PerimetroRepository";

interface PerimetroRecord {
    date: string;
    msRight?: unknown;
    msRightFlex?: unknown;
    msLeft?: unknown;
    msLeftFlex?: unknown;
    chest?: unknown;
    waist?: unknown;
    abdomen?: unknown;
    hips?: unknown;
    thighR?: unknown;
    thighL?: unknown;
}

/**
 * Bulk create perimetros - much faster than sequential inserts
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

    const invalidRecords = body.filter((r: PerimetroRecord) => !r.date);
    if (invalidRecords.length > 0) {
        return NextResponse.json({
            error: `${invalidRecords.length} records missing required 'date' field`
        }, { status: 400 });
    }

    try {
        // Prepare all records for batch insert using repository DTO format
        const records: CreatePerimetroDTO[] = body.map((record: PerimetroRecord) => ({
            userId: user_uuid,
            date: new Date(record.date),
            msRight: sanitizeValue(record.msRight) ?? undefined,
            msRightFlex: sanitizeValue(record.msRightFlex) ?? undefined,
            msLeft: sanitizeValue(record.msLeft) ?? undefined,
            msLeftFlex: sanitizeValue(record.msLeftFlex) ?? undefined,
            chest: sanitizeValue(record.chest) ?? undefined,
            waist: sanitizeValue(record.waist) ?? undefined,
            abdomen: sanitizeValue(record.abdomen) ?? undefined,
            hips: sanitizeValue(record.hips) ?? undefined,
            thighR: sanitizeValue(record.thighR) ?? undefined,
            thighL: sanitizeValue(record.thighL) ?? undefined,
        }));

        // Use repository - automatically invalidates cache for all affected users
        const result = await perimetroRepository.createMany(records);

        if (!result.success) {
            Logger.error('Admin', `Failed to bulk create perimetros for user ${user_uuid}`, result.error);
            return NextResponse.json({ error: 'Internal error', details: getErrorMessage(result.error) }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            count: result.data,
            message: `${result.data} perimetros created successfully`
        });
    } catch (error: unknown) {
        Logger.error('Admin', `Failed to bulk create perimetros for user ${user_uuid}`, error);
        return NextResponse.json({ error: 'Internal error', details: getErrorMessage(error) }, { status: 500 });
    }
});
