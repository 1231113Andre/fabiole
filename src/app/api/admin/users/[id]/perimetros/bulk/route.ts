import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { sanitizeValue, getErrorMessage } from "@/lib/utils/sanitizers";
import { Logger } from "@/lib/utils/logger";
import { invalidateUserCaches } from "@/lib/api/utils/cacheHelpers";

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
        const records = body.map((record: PerimetroRecord) => ({
            user_uuid,
            date: new Date(record.date),
            msRight: sanitizeValue(record.msRight),
            msRightFlex: sanitizeValue(record.msRightFlex),
            msLeft: sanitizeValue(record.msLeft),
            msLeftFlex: sanitizeValue(record.msLeftFlex),
            chest: sanitizeValue(record.chest),
            waist: sanitizeValue(record.waist),
            abdomen: sanitizeValue(record.abdomen),
            hips: sanitizeValue(record.hips),
            thighR: sanitizeValue(record.thighR),
            thighL: sanitizeValue(record.thighL),
        }));

        const result = await db.perimetroCorporal.createMany({
            data: records,
            skipDuplicates: false
        });

        // Invalidate caches
        await invalidateUserCaches(user_uuid, { perimetros: true });

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `${result.count} perimetros created successfully`
        });
    } catch (error: unknown) {
        Logger.error('Admin', `Failed to bulk create perimetros for user ${user_uuid}`, error);
        return NextResponse.json({ error: 'Internal error', details: getErrorMessage(error) }, { status: 500 });
    }
});
