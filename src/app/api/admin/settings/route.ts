import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/wrappers/withAdminAuth";
import { SettingsService } from "@/lib/api/services/SettingsService";
import { Logger } from "@/lib/utils/logger";
import { getErrorMessageSafe } from "@/lib/utils/sanitizers";

export const GET = withAdminAuth(async () => {
    try {
        const config = await SettingsService.getSettings();
        const env = SettingsService.getSafeEnvVars();
        const status = await SettingsService.getServiceStatus();

        return NextResponse.json({ config, env, status });
    } catch (error: unknown) {
        Logger.error('System', "Master configuration retrieval failed: Could not compile system settings for administrative panel.", error);
        return NextResponse.json({ error: "Failed to fetch settings", message: getErrorMessageSafe(error) }, { status: 500 });
    }
});

export const POST = withAdminAuth(async (req) => {
    try {
        const body = await req.json();

        // List of allowed system setting keys
        const ALLOWED_KEYS = [
            'rateLimitMax', 'rateLimitWindow', 'rateLimitMessage',
            // Pricing keys
            'price_presencial_30min', 'price_presencial_45min', 'price_presencial_1hora',
            'price_online_30min', 'price_online_45min', 'price_online_1hora',
            'price_acompanhamento_mensal',
            'price_extra_dupla_30min', 'price_extra_dupla_45min', 'price_extra_dupla_1hora',
            'price_extra_trio_30min', 'price_extra_trio_45min', 'price_extra_trio_1hora',
            'price_ginastica_laboral',
        ];

        // Update all provided keys
        for (const key of ALLOWED_KEYS) {
            if (body[key] !== undefined) {
                await SettingsService.updateSetting(key, body[key]);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        Logger.error('System', "Configuration update failed: Critical error encountered while committing system setting changes to database.", error);
        return NextResponse.json({ error: "Failed to update settings", message: getErrorMessageSafe(error) }, { status: 500 });
    }
});
