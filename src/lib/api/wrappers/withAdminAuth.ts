import { NextRequest, NextResponse } from "next/server";
import { checkAdmin, AdminSession } from "@/lib/api/utils/adminAuth";
import { Logger } from "@/lib/utils/logger";

/**
 * Type for the handler function receiving the request, admin session, and context
 */
export type AdminRouteHandler<T = any> = (
    req: NextRequest,
    session: AdminSession,
    context: T
) => Promise<NextResponse>;

/**
 * Higher-order function to secure API routes for Admins only.
 * 
 * Usage:
 * export const GET = withAdminAuth(async (req, session, { params }) => {
 *   const { id } = await params;
 * });
 */
export function withAdminAuth<T = any>(handler: AdminRouteHandler<T>) {
    return async (req: NextRequest, context: T) => {
        try {
            const adminSession = await checkAdmin();

            if (!adminSession) {
                return NextResponse.json(
                    { error: "Unauthorized Access" },
                    { status: 403 }
                );
            }

            return await handler(req, adminSession, context);
        } catch (error) {
            Logger.error('Security', "Administrative Authorization Failure: Critical exception encountered within the admin session verification wrapper.", error);
            return NextResponse.json(
                { error: "Internal Server Error" },
                { status: 500 }
            );
        }
    };
}
