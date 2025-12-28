import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { cookies } from "next/headers";
import { clearUserData } from "@/lib/cache/userCache";
import { verifySession } from "@/lib/security/session";

async function checkAdmin() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');

    if (!sessionCookie) return null;

    const session = await verifySession(sessionCookie.value);
    if (!session?.email) return null;

    const user = await db.user.findUnique({
        where: { email: session.email },
        select: { role: true }
    });

    return user?.role === 'ADMINISTRATOR' ? session : null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await checkAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    try {
        const user = await db.user.findUnique({
            where: { id },
            include: {
                pesagens: { orderBy: { date: 'desc' } },
                perimetros: { orderBy: { date: 'desc' } },
                avaliacoes: { orderBy: { date: 'desc' } }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            phone: user.phone || '',
            birth: user.birth?.toISOString() || '',
            role: user.role,
            gender: user.gender || '',
            trainingCredit: Number(user.trainingCredit),
            trainingsScheduled: user.trainingsScheduled,
            debtValue: Number(user.debtValue),
            goals: user.goals || '',
            notes: user.notes || '',
            paid: user.paid || '-',
            avatarUrl: user.avatarUrl,
            pesagens: user.pesagens.map((p: typeof user.pesagens[number]) => ({
                id: p.id,
                date: p.date.toISOString(),
                peso: p.peso ? Number(p.peso) : null,
                percentualMG: p.percentualMG ? Number(p.percentualMG) : null,
                mm: p.mm ? Number(p.mm) : null,
                h2o: p.h2o ? Number(p.h2o) : null,
                imc: p.imc ? Number(p.imc) : null,
                gordVisceral: p.gordVisceral ? Number(p.gordVisceral) : null,
                idMetabolica: p.idMetabolica ? Number(p.idMetabolica) : null,
                massaOssea: p.massaOssea ? Number(p.massaOssea) : null,
                height: p.height ? Number(p.height) : null,
                resultadoIMC: p.resultadoIMC,
                resultadoPercentMG: p.resultadoPercentMG,
                notas: p.notas
            })),
            perimetros: user.perimetros.map((p: typeof user.perimetros[number]) => ({
                id: p.id,
                date: p.date.toISOString(),
                msRight: p.msRight ? Number(p.msRight) : null,
                msRightFlex: p.msRightFlex ? Number(p.msRightFlex) : null,
                msLeft: p.msLeft ? Number(p.msLeft) : null,
                msLeftFlex: p.msLeftFlex ? Number(p.msLeftFlex) : null,
                chest: p.chest ? Number(p.chest) : null,
                waist: p.waist ? Number(p.waist) : null,
                abdomen: p.abdomen ? Number(p.abdomen) : null,
                hips: p.hips ? Number(p.hips) : null,
                thighR: p.thighR ? Number(p.thighR) : null,
                thighL: p.thighL ? Number(p.thighL) : null
            })),
            avaliacoes: user.avaliacoes.map((a: typeof user.avaliacoes[number]) => ({
                id: a.id,
                date: a.date.toISOString(),
                pushUps: a.pushUps,
                sitUps: a.sitUps,
                mile: a.mile,
                mileResult: a.mileResult,
                notes: a.notes
            }))
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await checkAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    try {
        // Build update data only for fields that are explicitly provided
        // This prevents overwriting existing data with null/defaults
        const updateData: Record<string, any> = {};

        if (body.name !== undefined) updateData.name = body.name;
        if (body.surname !== undefined) updateData.surname = body.surname;
        if (body.email !== undefined) updateData.email = body.email;
        if (body.phone !== undefined) updateData.phone = body.phone || null;
        if (body.birth !== undefined) updateData.birth = body.birth ? new Date(body.birth) : null;
        if (body.gender !== undefined) updateData.gender = body.gender || null;
        if (body.trainingCredit !== undefined) updateData.trainingCredit = body.trainingCredit ?? 0;
        if (body.trainingsScheduled !== undefined) updateData.trainingsScheduled = body.trainingsScheduled ?? 0;
        if (body.debtValue !== undefined) updateData.debtValue = body.debtValue ?? 0;
        if (body.goals !== undefined) updateData.goals = body.goals || null;
        if (body.notes !== undefined) updateData.notes = body.notes || null;
        if (body.paid !== undefined) updateData.paid = body.paid;
        if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl || null;

        const user = await db.user.update({
            where: { id },
            data: updateData
        });

        // Clear cache and sync backup to Sheets
        clearUserData(user.email);

        return NextResponse.json({ success: true, user: { id: user.id, name: user.name } });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await checkAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    try {
        // Need to fetch user email first to clear cache, but if deleted... 
        // We can try to fetch first.
        const user = await db.user.findUnique({ where: { id }, select: { email: true } });

        await db.user.delete({ where: { id } });

        if (user) {
            clearUserData(user.email);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
