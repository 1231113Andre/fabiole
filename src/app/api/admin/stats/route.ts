import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { Logger } from "@/lib/utils/logger";
import { getErrorMessageSafe } from "@/lib/utils/sanitizers";
import { getAdminDashboardData } from "@/lib/api/services/AdminService";

export const GET = withAdminAuth(async (req, session) => {
    try {
        // Use the centralized service which implements Redis caching
        const dashboardData = await getAdminDashboardData();
        return NextResponse.json(dashboardData);
    } catch (error: unknown) {
        Logger.error('AdminService', 'Analytics Synchronization Failure: A critical exception occurred while compiling master dashboard statistics and user metrics.', error);
        return NextResponse.json({ error: 'Internal error', message: getErrorMessageSafe(error) }, { status: 500 });
    }
});
