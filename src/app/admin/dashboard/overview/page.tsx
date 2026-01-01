import type { Metadata } from "next";
import { getAdminDashboardData } from "@/lib/api/services/AdminService";
import { AdminHeader } from "../../components/AdminHeader";
import { StatsCards } from "../../components/StatsCards";
import { RecentActivityWidgets } from "../../components/RecentActivityWidgets";

export const metadata: Metadata = {
    title: "Admin Dashboard | Visão Geral",
    description: "Visão geral do painel de administração"
};

// Force dynamic rendering - always fresh data
export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
    // Server-side data fetching - no loading state needed
    const { stats, recentSignups, recentPesagens } = await getAdminDashboardData();

    return (
        <>
            <AdminHeader
                title="Visão Geral"
                icon="fa-grid-2"
            />
            <StatsCards stats={stats} />
            <RecentActivityWidgets
                recentUsers={recentSignups}
                recentPesagens={recentPesagens}
            />
        </>
    );
}
