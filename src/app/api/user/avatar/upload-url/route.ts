import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/security/session";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2";
import { db } from "@/lib/db/client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Logger } from "@/lib/utils/logger";
import { isValidUuid } from "@/lib/utils/sanitizers";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";

export async function GET(req: NextRequest) {
    try {
        const rateLimitResult = await checkRateLimit(req, RATE_LIMITS.API);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: rateLimitResult.message ?? "Too many requests", retryAfter: rateLimitResult.retryAfter },
                { status: 429, headers: rateLimitResult.retryAfter ? { "Retry-After": String(rateLimitResult.retryAfter) } : {} }
            );
        }

        const session = await getSession();
        if (!session || !session.uuid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        let targetUserId = searchParams.get("userId") || session.uuid;

        // Validate UUID format - prevents path traversal and invalid IDs
        if (!isValidUuid(targetUserId)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        // If targetUserId is different, check if current user is ADMIN
        if (targetUserId !== session.uuid) {
            const currentUser = await db.user.findUnique({
                where: { id: session.uuid },
                select: { role: true }
            });
            if (currentUser?.role !== 'ADMINISTRATOR') {
                return NextResponse.json({ error: "Forbidden: Only admins can upload for other users" }, { status: 403 });
            }
        }

        const fileName = `avatars/${targetUserId}.png`;
        const contentType = "image/png";

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: fileName,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        return NextResponse.json({
            uploadUrl,
            fileName,
            publicUrl: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`
        });
    } catch (error) {
        Logger.error('System', "Error generating presigned URL for avatar upload.", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
