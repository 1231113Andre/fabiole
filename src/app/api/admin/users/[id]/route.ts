import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { clearUserData } from "@/lib/cache/userCache";
import { invalidateAdminUsers, invalidateAdminUserDetail } from "@/lib/cache/adminCache";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { Logger } from "@/lib/utils/logger";
import { toNumber } from "@/lib/utils/sanitizers";

export const GET = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
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
                peso: toNumber(p.peso),
                percentualMG: toNumber(p.percentualMG),
                mm: toNumber(p.mm),
                h2o: toNumber(p.h2o),
                imc: toNumber(p.imc),
                gordVisceral: toNumber(p.gordVisceral),
                idMetabolica: toNumber(p.idMetabolica),
                massaOssea: toNumber(p.massaOssea),
                height: toNumber(p.height),
                resultadoIMC: p.resultadoIMC,
                resultadoPercentMG: p.resultadoPercentMG,
                notas: p.notas
            })),
            perimetros: user.perimetros.map((p: typeof user.perimetros[number]) => ({
                id: p.id,
                date: p.date.toISOString(),
                msRight: toNumber(p.msRight),
                msRightFlex: toNumber(p.msRightFlex),
                msLeft: toNumber(p.msLeft),
                msLeftFlex: toNumber(p.msLeftFlex),
                chest: toNumber(p.chest),
                waist: toNumber(p.waist),
                abdomen: toNumber(p.abdomen),
                hips: toNumber(p.hips),
                thighR: toNumber(p.thighR),
                thighL: toNumber(p.thighL)
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
        Logger.error('AdminService', `Profile Retrieval Failure: A critical exception occurred while fetching the full data set for User ID [${id}].`, error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
});

export const PUT = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
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

        // Clear caches
        clearUserData(user.email);
        invalidateAdminUserDetail(id);
        invalidateAdminUsers();

        return NextResponse.json({ success: true, user: { id: user.id, name: user.name } });
    } catch (error) {
        Logger.error('AdminService', `Profile Update Failure: A critical exception occurred while committing changes to User ID [${id}].`, error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
});

export const DELETE = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    try {
        // Need to fetch user email first to clear cache, but if deleted... 
        // We can try to fetch first.
        const user = await db.user.findUnique({ where: { id }, select: { email: true } });

        await db.user.delete({ where: { id } });

        // Clear caches
        if (user) {
            clearUserData(user.email);
        }
        invalidateAdminUserDetail(id);
        invalidateAdminUsers();

        return NextResponse.json({ success: true });
    } catch (error) {
        Logger.error('AdminService', `Account Termination Failure: A critical exception occurred during the administrative deletion of User ID [${id}].`, error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
});
