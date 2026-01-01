import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { checkAdmin } from "@/lib/api/utils/adminAuth";
import { sanitizeInt, sanitizeStringValue } from "@/lib/utils/sanitizers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await checkAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: user_uuid } = await params;
    const body = await req.json();

    // Validate required field: date
    if (!body.date) {
        return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 });
    }

    try {
        const avaliacao = await db.avaliacaoFisica.create({
            data: {
                user_uuid,
                date: new Date(body.date),
                pushUps: sanitizeInt(body.pushUps),
                sitUps: sanitizeInt(body.sitUps),
                mile: sanitizeStringValue(body.mile),
                mileResult: sanitizeStringValue(body.mileResult),
                notes: sanitizeStringValue(body.notes),
            }
        });

        return NextResponse.json(avaliacao);
    } catch (error: any) {
        console.error('Create avaliacao error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
