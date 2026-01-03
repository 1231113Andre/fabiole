import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "../../../../lib/security/session";
import { r2Client, R2_BUCKET_NAME } from "../../../../lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Logger } from "@/lib/utils/logger";

// Note: I'll use native crypto.randomUUID()
export async function POST(req: NextRequest) {
    try {
        // 1. Auth check
        const token = req.cookies.get("auth_session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const session = await verifySession(token);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get file info from request
        const { contentType, fileName } = await req.json();

        if (!contentType || !contentType.startsWith("image/")) {
            return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
        }

        const fileExtension = fileName?.split(".").pop() || "jpg";
        const key = `avatars/${crypto.randomUUID()}.${fileExtension}`;

        // 3. Generate presigned URL
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        return NextResponse.json({
            uploadUrl,
            key,
        });
    } catch (error: unknown) {
        Logger.error('Upload', 'Failed to generate presigned URL for avatar upload', error);
        return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
    }
}
