import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { hashPassword, validatePasswordStrength } from "@/lib/security/password";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { Logger } from "@/lib/utils/logger";
import { getErrorMessage } from "@/lib/utils/sanitizers";

export const POST = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();
    const { newPassword } = body;

    if (!newPassword) {
        return NextResponse.json({ error: 'Nova password é obrigatória' }, { status: 400 });
    }

    // Validate password strength using shared helper
    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    try {
        // Check if user exists
        const user = await db.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
        }

        // Hash and update password
        const hashedPassword = await hashPassword(newPassword);
        await db.user.update({
            where: { id },
            data: { password: hashedPassword }
        });

        Logger.success('Security', `Administrative Credential Update: Password for User [${user.email}] has been changed by Admin [${session.email}].`);

        return NextResponse.json({ success: true, message: 'Password alterada com sucesso' });
    } catch (error: unknown) {
        Logger.error('Security', `Administrative Credential Update Failure: Error changing password for User ID [${id}].`, error);
        return NextResponse.json({ error: 'Erro interno', message: getErrorMessage(error) }, { status: 500 });
    }
});
