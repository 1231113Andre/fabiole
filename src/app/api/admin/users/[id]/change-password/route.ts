import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/security/session";
import { hashPassword } from "@/lib/security/password";

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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await checkAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { newPassword } = body;

    if (!newPassword) {
        return NextResponse.json({ error: 'Nova password é obrigatória' }, { status: 400 });
    }

    // Validate password strength
    if (newPassword.length < 8) {
        return NextResponse.json({ error: 'Password deve ter pelo menos 8 caracteres' }, { status: 400 });
    }
    if (!/[A-Z]/.test(newPassword)) {
        return NextResponse.json({ error: 'Password deve conter pelo menos uma letra maiúscula' }, { status: 400 });
    }
    if (!/[a-z]/.test(newPassword)) {
        return NextResponse.json({ error: 'Password deve conter pelo menos uma letra minúscula' }, { status: 400 });
    }
    if (!/[0-9]/.test(newPassword)) {
        return NextResponse.json({ error: 'Password deve conter pelo menos um número' }, { status: 400 });
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

        console.log(`✅ [Admin] Password changed for user: ${user.email} by admin: ${admin.email}`);

        return NextResponse.json({ success: true, message: 'Password alterada com sucesso' });
    } catch (error) {
        console.error('Admin change password error:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
