import type { Metadata } from "next";
import { verifyAdminAccess } from "@/lib/api/services/AdminService";
import { SettingsPageClient } from "@/app/admin/dashboard/settings/SettingsPageClient";

export const metadata: Metadata = {
    title: "Admin Dashboard | Definições",
    description: "Configurações do sistema"
};

// Force dynamic rendering - always fresh data
export const dynamic = 'force-dynamic';

import { SettingsService } from "@/lib/api/services/SettingsService";

export default async function SettingsPage() {
    await verifyAdminAccess();

    // Fetch initial data on server for instant SSR
    const config = await SettingsService.getSettings();
    const env = SettingsService.getSafeEnvVars();
    const status = await SettingsService.getServiceStatus();

    return <SettingsPageClient initialData={{ config, env, status }} />;
}
