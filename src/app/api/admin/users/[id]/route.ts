import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { clearCachedAuthUser, clearUserData } from "@/lib/cache/userCache";
import { invalidateAdminUsers, invalidateAdminUserDetail, invalidateAdminStats } from "@/lib/cache/adminCache";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { Logger } from "@/lib/utils/logger";
import { toNumber, getErrorMessageSafe, isValidUuid } from "@/lib/utils/sanitizers";
import { sanitizeString, sanitizeEmail } from "@/lib/api/utils/sanitize";
import { isSafeAvatarUrl } from "@/lib/utils/sanitizers";
import { AdminUserService } from "@/lib/api/services/admin/AdminUserService";

export const GET = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    if (!isValidUuid(id)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    try {
        // Use AdminUserService which has Redis cache (10s TTL)
        const user = await AdminUserService.getUserById(id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Map AdminUserDetail to API response format (with toNumber helper for consistency)
        return NextResponse.json({
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            phone: user.phone,
            birth: user.birth,
            role: user.role,
            gender: user.gender,
            trainingCredit: user.trainingCredit,
            trainingsScheduled: user.trainingsScheduled,
            debtValue: user.debtValue,
            goals: user.goals,
            notes: user.notes,
            paid: user.paid || '-', // Use '-' as default for API response
            status: user.status,
            statusChangedBy: user.statusChangedBy,
            statusChangedAt: user.statusChangedAt,
            statusReason: user.statusReason,
            avatarUrl: user.avatarUrl,
            pesagens: user.pesagens.map(p => ({
                id: p.id,
                date: p.date,
                peso: toNumber(p.peso),
                percentualMG: toNumber(p.percentualMG),
                mm: toNumber(p.mm),
                h2o: toNumber(p.h2o),
                imc: toNumber(p.imc),
                gordVisceral: toNumber(p.gordVisceral),
                idMetabolica: toNumber(p.idMetabolica),
                massaOssea: toNumber(p.massaOssea),
                height: toNumber(p.height),
                smi: toNumber(p.smi),
                resultadoIMC: p.resultadoIMC,
                resultadoPercentMG: p.resultadoPercentMG,
                notas: p.notas
            })),
            perimetros: user.perimetros.map(p => ({
                id: p.id,
                date: p.date,
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
            avaliacoes: user.avaliacoes.map(a => ({
                id: a.id,
                date: a.date,
                pushUps: a.pushUps,
                sitUps: a.sitUps,
                mile: a.mile,
                mileResult: a.mileResult,
                notes: a.notes
            }))
        });
    } catch (error: unknown) {
        Logger.error('AdminService', `Profile Retrieval Failure: A critical exception occurred while fetching the full data set for User ID [${id}].`, error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessageSafe(error) }, { status: 500 });
    }
});

export const PUT = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    if (!isValidUuid(id)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    const body = await req.json();

    try {
        // Build update data only for fields that are explicitly provided
        // This prevents overwriting existing data with null/defaults
        const updateData: Record<string, unknown> = {};

        if (body.name !== undefined) updateData.name = sanitizeString(body.name);
        if (body.surname !== undefined) updateData.surname = sanitizeString(body.surname);
        if (body.email !== undefined) updateData.email = sanitizeEmail(body.email);
        if (body.phone !== undefined) updateData.phone = body.phone ? sanitizeString(body.phone) : null;
        if (body.birth !== undefined) updateData.birth = body.birth ? new Date(body.birth) : null;
        if (body.gender !== undefined) updateData.gender = body.gender ? sanitizeString(body.gender) : null;
        if (body.trainingCredit !== undefined) updateData.trainingCredit = body.trainingCredit ?? 0;
        if (body.trainingsScheduled !== undefined) updateData.trainingsScheduled = body.trainingsScheduled ?? 0;
        if (body.debtValue !== undefined) updateData.debtValue = body.debtValue ?? 0;
        if (body.goals !== undefined) updateData.goals = body.goals ? sanitizeString(body.goals) : null;
        if (body.notes !== undefined) updateData.notes = body.notes ? sanitizeString(body.notes) : null;
        if (body.paid !== undefined) {
            updateData.paid = sanitizeString(body.paid);
            // When setting status to "PAGO" and debtValue is not being explicitly set to 0,
            // automatically set debtValue to 0 to reduce "Receita Pendente"
            if (body.paid === 'PAGO' && body.debtValue === undefined) {
                // Fetch current user to get current debtValue
                const currentUser = await db.user.findUnique({
                    where: { id },
                    select: { debtValue: true }
                });
                // If user has debt and we're not explicitly setting debtValue, set it to 0
                if (currentUser && currentUser.debtValue) {
                    const debtNum = toNumber(currentUser.debtValue);
                    if (debtNum !== null && debtNum > 0) {
                        updateData.debtValue = 0;
                    }
                }
            }
        }
        if (body.avatarUrl !== undefined) {
            const url = body.avatarUrl || null;
            if (url && !isSafeAvatarUrl(url)) {
                return NextResponse.json({ error: 'Invalid avatar URL' }, { status: 400 });
            }
            updateData.avatarUrl = url;
        }

        // Validate that at least one field is being updated
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        const user = await db.user.update({
            where: { id },
            data: updateData
        });

        // Clear caches in parallel for better performance
        await Promise.all([
            clearUserData(user.email),
            clearCachedAuthUser(user.email), // Also clear auth cache so next login fetches fresh profile data
            invalidateAdminUserDetail(id),
            invalidateAdminUsers(),
            invalidateAdminStats()
        ]);

        return NextResponse.json({ success: true, user: { id: user.id, name: user.name } });
    } catch (error: unknown) {
        Logger.error('AdminService', `Profile Update Failure: A critical exception occurred while committing changes to User ID [${id}].`, error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessageSafe(error) }, { status: 500 });
    }
});

export const DELETE = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    if (!isValidUuid(id)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    try {
        // Need to fetch user email first to clear cache, but if deleted... 
        // We can try to fetch first.
        const user = await db.user.findUnique({ where: { id }, select: { email: true } });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await db.user.delete({ where: { id } });

        // Clear caches in parallel for better performance
        const cachePromises: Promise<void>[] = [
            invalidateAdminUserDetail(id),
            invalidateAdminUsers(),
            invalidateAdminStats()
        ];
        if (user) {
            cachePromises.push(clearUserData(user.email));
        }
        await Promise.all(cachePromises);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        Logger.error('AdminService', `Account Termination Failure: A critical exception occurred during the administrative deletion of User ID [${id}].`, error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessageSafe(error) }, { status: 500 });
    }
});
