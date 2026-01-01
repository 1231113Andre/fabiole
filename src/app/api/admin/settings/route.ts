import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { SettingsService } from "@/lib/api/services/SettingsService";
import { Logger } from "@/lib/utils/logger";

export const GET = withAdminAuth(async () => {
    try {
        const config = await SettingsService.getSettings();
        const env = SettingsService.getSafeEnvVars();
        const status = await SettingsService.getServiceStatus();

        return NextResponse.json({ config, env, status });
    } catch (error) {
        Logger.error('System', "Master configuration retrieval failed: Could not compile system settings for administrative panel.", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
});

export const POST = withAdminAuth(async (req) => {
    try {
        const body = await req.json();

        // Update defined keys
        if (body.rateLimitMax !== undefined)
            await SettingsService.updateSetting('rateLimitMax', body.rateLimitMax);

        if (body.rateLimitWindow !== undefined)
            await SettingsService.updateSetting('rateLimitWindow', body.rateLimitWindow);

        if (body.rateLimitMessage !== undefined)
            await SettingsService.updateSetting('rateLimitMessage', body.rateLimitMessage);

        return NextResponse.json({ success: true });
    } catch (error) {
        Logger.error('System', "Configuration update failed: Critical error encountered while committing system setting changes to database.", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
});
