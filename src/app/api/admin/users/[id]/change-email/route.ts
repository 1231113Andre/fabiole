import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { Logger } from "@/lib/utils/logger";
import { getErrorMessageSafe, isValidUuid } from "@/lib/utils/sanitizers";
import { clearUserData, clearCachedAuthUser } from "@/lib/cache/userCache";
import { invalidateAdminUsers, invalidateAdminUserDetail } from "@/lib/cache/adminCache";

export const POST = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    if (!isValidUuid(id)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    const body = await req.json();
    const { newEmail } = body;

    if (!newEmail) {
        return NextResponse.json({ error: 'Novo email é obrigatório' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    try {
        // Check if user exists
        const user = await db.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
        }

        // Check if new email is already in use
        const existingUser = await db.user.findUnique({ where: { email: newEmail } });
        if (existingUser && existingUser.id !== id) {
            return NextResponse.json({ error: 'Este email já está em uso' }, { status: 400 });
        }

        // Update user email
        await db.user.update({
            where: { id },
            data: { email: newEmail }
        });

        // Clear caches for OLD and NEW email
        // Critical: Must remove old email key so login with old email fails (hits DB, finds nothing)
        await clearUserData(user.email);
        await clearCachedAuthUser(user.email);

        // Clear new email just in case garbage exists
        await clearUserData(newEmail);
        await clearCachedAuthUser(newEmail);

        // Invalidate admin caches
        await Promise.all([
            invalidateAdminUserDetail(id),
            invalidateAdminUsers()
        ]);

        Logger.success('Security', `Administrative Identity Maintenance: Email address for User ID [${user.id}] has been updated by Admin [${session.email}]. Change mapping: ${user.email} -> ${newEmail}.`);

        return NextResponse.json({ success: true, message: 'Email alterado com sucesso' });
    } catch (error: unknown) {
        Logger.error('Security', `Administrative Identity Update Failure: A critical exception occurred while Admin [${session.email}] attempted to update the email for User ID [${id}].`, error);
        return NextResponse.json({ error: 'Erro interno', message: getErrorMessageSafe(error, 'Erro interno') }, { status: 500 });
    }
});
