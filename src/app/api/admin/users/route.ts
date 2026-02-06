import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { hashPassword, validatePasswordStrength } from "@/lib/security/password";
import { AccountEmailService } from "@/lib/email/services/AccountEmailService";
import { VerificationCodeService } from "@/lib/email";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { Logger } from "@/lib/utils/logger";
import { invalidateAdminUsers, invalidateAdminStats } from "@/lib/cache/adminCache";
import { getErrorMessageSafe } from "@/lib/utils/sanitizers";

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

        const normalizedEmail = email.toLowerCase().trim();

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json({ error: passwordValidation.error || 'Password does not meet security requirements' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email: normalizedEmail },
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
                email: normalizedEmail,
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

        // Send email notification if requested (password reset code + welcome email, no plain-text password)
        if (sendNotification) {
            try {
                // Send password reset code - user will set password via "Recuperar Password" flow
                VerificationCodeService.sendVerificationCode(
                    newUser.email,
                    newUser.name,
                    'password-reset'
                ).then(result => {
                    if (!result.success) {
                        Logger.error('Email', `Could not send password reset code to ${newUser.email}.`, result.error);
                    }
                }).catch(err => Logger.error('Email', `Failed to send password reset code to ${newUser.email}.`, err));

                // Send welcome email (no password - instructs user to use the code received)
                AccountEmailService.sendManualAccountCreatedEmail({
                    email: newUser.email,
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
        return NextResponse.json({ error: 'Erro interno ao criar utilizador', message: getErrorMessageSafe(error, 'Erro interno') }, { status: 500 });
    }
});
