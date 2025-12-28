import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/security/session";
import { db } from "@/lib/db/client";

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || !session.uuid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { avatarUrl, userId } = await req.json();
        if (!avatarUrl) {
            return NextResponse.json({ error: "Missing avatarUrl" }, { status: 400 });
        }

        const targetUserId = userId || session.uuid;

        // If targetUserId is different, check if current user is ADMIN
        if (targetUserId !== session.uuid) {
            const currentUser = await db.user.findUnique({
                where: { id: session.uuid },
                select: { role: true }
            });
            if (currentUser?.role !== 'ADMINISTRATOR') {
                return NextResponse.json({ error: "Forbidden: Only admins can update other users" }, { status: 403 });
            }
        }

        // Add a timestamp to the URL to bust cache if it's an R2 URL
        // Example: https://pub-xxx.r2.dev/avatars/uuid.png -> https://pub-xxx.r2.dev/avatars/uuid.png?t=123456789
        const cacheBustedUrl = avatarUrl.includes('?')
            ? `${avatarUrl.split('?')[0]}?t=${Date.now()}`
            : `${avatarUrl}?t=${Date.now()}`;

        await db.user.update({
            where: { id: targetUserId },
            data: { avatarUrl: cacheBustedUrl }
        });

        return NextResponse.json({ success: true, avatarUrl: cacheBustedUrl });
    } catch (error) {
        console.error("Error updating avatar URL:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
