import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/security/session";
import { hashPassword } from "@/lib/security/password";
import { EmailService } from "@/lib/email/EmailService";

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

export async function POST(req: NextRequest) {
    const admin = await checkAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const {
            name, surname, email, password, gender, birth, sendNotification,
            trainingCredit, trainingsScheduled, debtValue, goals, notes, role
        } = body;

        // Basic validation
        if (!name || !surname || !email || !password || !birth) {
            return NextResponse.json({ error: 'Faltam campos obrigatórios' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Este email já está registado' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const newUser = await db.user.create({
            data: {
                name,
                surname,
                email,
                password: hashedPassword,
                gender: gender || 'Masculino',
                birth: new Date(birth),
                role: role || 'USER',
                // Optional fields
                trainingCredit: trainingCredit || 0,
                trainingsScheduled: trainingsScheduled ? parseInt(trainingsScheduled) : 0,
                debtValue: debtValue || 0,
                goals: goals || null,
                notes: notes || null
            }
        });

        // Send email notification if requested
        if (sendNotification) {
            try {
                await EmailService.sendManualAccountCreatedEmail({
                    email: newUser.email,
                    password: password, // Send the original password, not the hashed one
                    firstName: newUser.name,
                    role: newUser.role
                });
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
                // We don't fail the request if email fails, but we log it
            }
        }

        return NextResponse.json({
            success: true,
            user: {
                id: newUser.id,
                name: newUser.name,
                surname: newUser.surname,
                email: newUser.email
            }
        });

    } catch (error: any) {
        console.error('Manual user creation error:', error);
        return NextResponse.json({ error: 'Erro interno ao criar utilizador' }, { status: 500 });
    }
}
