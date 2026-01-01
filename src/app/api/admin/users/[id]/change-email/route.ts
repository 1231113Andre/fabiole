import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { checkAdmin } from "@/lib/api/utils/adminAuth";
import { Logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await checkAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
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

        Logger.success('Security', `Administrative Identity Maintenance: Email address for User ID [${user.id}] has been updated by Admin [${admin.email}]. Change mapping: ${user.email} -> ${newEmail}.`);

        return NextResponse.json({ success: true, message: 'Email alterado com sucesso' });
    } catch (error) {
        Logger.error('Security', `Administrative Identity Update Failure: A critical exception occurred while Admin [${admin.email}] attempted to update the email for User ID [${id}].`, error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
