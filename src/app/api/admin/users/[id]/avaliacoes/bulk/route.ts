import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { checkAdmin } from "@/lib/api/utils/adminAuth";
import { invalidateAvaliacoesCache, invalidateAdminUserDetail } from "@/lib/cache/adminCache";
import { clearUserData } from "@/lib/cache/userCache";

interface AvaliacaoRecord {
    date: string;
    pushUps?: unknown;
    sitUps?: unknown;
    mile?: string | null;
    mileResult?: string | null;
    notes?: string | null;
}

import { sanitizeInt, getErrorMessage } from "@/lib/utils/sanitizers";

/**
 * Bulk create avaliacoes - much faster than sequential inserts
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await checkAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: user_uuid } = await params;
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
        const records = body.map((record: AvaliacaoRecord) => ({
            user_uuid,
            date: new Date(record.date),
            pushUps: sanitizeInt(record.pushUps),
            sitUps: sanitizeInt(record.sitUps),
            mile: record.mile || null,
            mileResult: record.mileResult || null,
            notes: record.notes || null,
        }));

        const result = await db.avaliacaoFisica.createMany({
            data: records,
            skipDuplicates: false
        });

        // Invalidate caches
        invalidateAvaliacoesCache();
        invalidateAdminUserDetail(user_uuid);
        const user = await db.user.findUnique({ where: { id: user_uuid }, select: { email: true } });
        if (user?.email) clearUserData(user.email);

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `${result.count} avaliacoes created successfully`
        });
    } catch (error: unknown) {
        console.error('Bulk create avaliacoes error:', error);
        return NextResponse.json({ error: 'Internal error', details: getErrorMessage(error) }, { status: 500 });
    }
}

