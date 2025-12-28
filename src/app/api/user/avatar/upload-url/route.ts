import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/security/session";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2";
import { db } from "@/lib/db/client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || !session.uuid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        let targetUserId = searchParams.get("userId") || session.uuid;

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
        console.error("Error generating presigned URL:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
