import type { Metadata } from "next";
import { getAdminDashboardData, verifyAdminAccess } from "@/lib/api/services/AdminService";
import { UsersPageClient } from "./UsersPageClient";

export const metadata: Metadata = {
    title: "Admin Dashboard | Utilizadores",
    description: "Gestão de utilizadores e contas do sistema"
};

// Force dynamic rendering - always fresh data
export const dynamic = 'force-dynamic';

export default async function AdminUsersList() {
    // Verify admin access and fetch full dashboard data server-side
    await verifyAdminAccess();
    const dashboardData = await getAdminDashboardData();

    // Pass pre-fetched data to client component for React Query hydration
    return <UsersPageClient initialData={dashboardData} />;
}
