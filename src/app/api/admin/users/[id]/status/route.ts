import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { db } from "@/lib/db/client";
import { Logger } from "@/lib/utils/logger";
import { invalidateAdminUserDetail, invalidateAdminUsers } from "@/lib/cache/adminCache";
import { clearUserData } from "@/lib/cache/userCache";
import { clearCachedAuthUser } from "@/lib/cache/userCache";
import { AccountEmailService } from "@/lib/email/services/AccountEmailService";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";
import { isValidUuid } from "@/lib/utils/sanitizers";

const VALID_STATUSES = ['ACTIVE', 'SUSPENDED', 'BANNED'] as const;
type AccountStatus = typeof VALID_STATUSES[number];

export const PUT = withAdminAuth(async (req, session, { params }: { params: Promise<{ id: string }> }) => {
    const { id: userId } = await params;
    if (!isValidUuid(userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    const body = await req.json();
    const { status, sendNotification, reason } = body;

    // Rate Limit Check
    const rateLimit = await checkRateLimit(req, RATE_LIMITS.API);
    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: rateLimit.message || 'Demasiados pedidos. Tente novamente mais tarde.' },
            { status: 429 }
        );
    }

    // Validate status
    if (!status || !VALID_STATUSES.includes(status)) {
        return NextResponse.json(
            { error: 'Status inválido. Valores permitidos: ACTIVE, SUSPENDED, BANNED' },
            { status: 400 }
        );
    }

    try {
        // Get admin email from session (AdminSession has direct email property)
        const adminEmail = session.email || 'unknown';

        // Update user status
        const updatedUser = await db.user.update({
            where: { id: userId },
            data: {
                status: status as AccountStatus,
                statusChangedBy: adminEmail,
                statusChangedAt: new Date(),
                statusReason: reason || null // Update reason, clear if null/empty
            },
            select: {
                id: true,
                name: true,
                email: true,
                status: true,
                statusChangedBy: true,
                statusChangedAt: true,
                statusReason: true
            }
        });

        Logger.info('Admin', `Account status changed to ${status} for user ${userId} by ${adminEmail}.`);

        // Send notification email if requested
        if (sendNotification) {
            try {
                await AccountEmailService.sendAccountStatusChangeEmail({
                    email: updatedUser.email,
                    firstName: updatedUser.name || 'Utilizador',
                    newStatus: status as 'ACTIVE' | 'SUSPENDED' | 'BANNED',
                    adminEmail,
                    changedAt: updatedUser.statusChangedAt || new Date(),
                    reason: reason || undefined
                });
                Logger.info('Email', `Account status change notification sent to ${updatedUser.email}.`);
            } catch (emailError) {
                // Log but don't fail the request if email fails
                Logger.error('Email', `Failed to send status change notification to ${updatedUser.email}`, emailError);
            }
        }

        // Invalidate caches
        await Promise.all([
            invalidateAdminUserDetail(userId),
            invalidateAdminUsers(),
            clearUserData(updatedUser.email),
            clearCachedAuthUser(updatedUser.email) // Important: clear auth cache so login check gets fresh status
        ]);

        return NextResponse.json({
            success: true,
            status: updatedUser.status,
            statusChangedBy: updatedUser.statusChangedBy,
            statusChangedAt: updatedUser.statusChangedAt?.toISOString()
        });
    } catch (error) {
        Logger.error('Admin', `Failed to update account status for user ${userId}`, error);
        return NextResponse.json(
            { error: 'Falha ao atualizar status da conta' },
            { status: 500 }
        );
    }
});
