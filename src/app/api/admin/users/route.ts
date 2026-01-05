import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { hashPassword } from "@/lib/security/password";
import { AccountEmailService } from "@/lib/email/services/AccountEmailService";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { Logger } from "@/lib/utils/logger";
import { invalidateAdminUsers, invalidateAdminStats } from "@/lib/cache/adminCache";
import { getErrorMessage } from "@/lib/utils/sanitizers";

export const POST = withAdminAuth(async (req, session) => {
    try {
        const body = await req.json();
        const {
            name, surname, email, phone, password, gender, birth, sendNotification,
            trainingCredit, trainingsScheduled, debtValue, goals, notes, role
        } = body;

        // Basic validation
        if (!name || !surname || !email || !password || !birth) {
            return NextResponse.json({ error: 'Faltam campos obrigatórios' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email },
            select: { id: true }
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
                phone: phone || null,
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
            },
            select: {
                id: true,
                name: true,
                surname: true,
                email: true
            }
        });

        // Send email notification if requested
        if (sendNotification) {
            try {
                // We execute this asynchronously without awaiting to not block the response
                AccountEmailService.sendManualAccountCreatedEmail({
                    email: newUser.email,
                    password: password, // Send the original password, not the hashed one
                    firstName: newUser.name,
                    role: role || 'USER'
                }).catch(err => Logger.error('Email', `Asynchronous Dispatch Failure: Could not deliver welcome notification to manually registered user ${newUser.email}.`, err));
            } catch (emailError) {
                Logger.error('Email', `Dispatch Initiation Failure: Error encountered while triggering the welcome notification workflow for ${newUser.email}.`, emailError);
            }
        }

        // Invalidate admin caches
        await Promise.all([
            invalidateAdminUsers(),
            invalidateAdminStats()
        ]);

        return NextResponse.json({
            success: true,
            user: newUser
        });

    } catch (error: unknown) {
        Logger.error('AdminService', 'Manual Provisioning Failure: A critical exception occurred during the administrative user creation sequence.', error);
        return NextResponse.json({ error: 'Erro interno ao criar utilizador', message: getErrorMessage(error) }, { status: 500 });
    }
});
