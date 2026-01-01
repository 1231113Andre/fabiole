"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLogout } from "@/lib/react-query/hooks/useAuth";
import { AdminSidebar } from "./components/AdminSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useDashboardData } from "@/app/dashboard/hooks/useDashboardData";
import { LoadingSpinner } from "@/components/LoadingSpinner";

function getActiveTabFromPath(pathname: string): string {
    if (pathname === "/admin") return "overview";
    if (pathname.includes("/admin/dashboard/overview")) return "overview";
    if (pathname.includes("/admin/dashboard/users/new")) return "create-user";
    if (pathname.includes("/admin/dashboard/users")) return "users";
    if (pathname.includes("/admin/dashboard/settings")) return "settings";
    if (pathname.includes("/admin/bulk-import")) return "import";
    return "overview";
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const logoutMutation = useLogout();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Reuse dashboard data for user info (admin is also a user)
    const {
        isLoading,
        user,
        isAuthenticated,
    } = useDashboardData();

    const handleLogout = useCallback(() => {
        logoutMutation.mutate();
    }, [logoutMutation]);

    const handleTabChange = useCallback((tabId: string) => {
        // Simple navigation mapping
        if (tabId === "overview") router.push("/admin/dashboard/overview");
        if (tabId === "users") router.push("/admin/dashboard/users");
        if (tabId === "create-user") router.push("/admin/dashboard/users/new");
        if (tabId === "settings") router.push("/admin/dashboard/settings");
        if (tabId === "import") router.push("/admin/bulk-import");

        setSidebarOpen(false);
    }, [router]);

    // Loading & Auth Check
    // (Middleware handles severe auth failures, but client check is nice)
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <LoadingSpinner />
            </div>
        );
    }

    const activeTab = getActiveTabFromPath(pathname);

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900">
            {/* Admin Sidebar */}
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                userName={user?.name}
                userSurname={user?.surname}
            />

            {/* Header - Reusing DashboardHeader but styled for Admin context if needed */}
            {/* Note: DashboardHeader is fixed with proper z-index and checks sidebar width variable */}
            <DashboardHeader
                onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                userName={user?.name}
                userSurname={user?.surname}
                userEmail={user?.email}
                avatarUrl={user?.avatarUrl}
                onLogout={handleLogout}
                isLoggingOut={logoutMutation.isPending}
            />

            {/* Main Content */}
            <main className="flex-1 ml-0 lg:ml-[var(--sidebar-width,290px)] mt-[72px] p-6 min-h-[calc(100vh-72px)] bg-gray-50 transition-[margin-left] duration-300">
                <div className="max-w-screen-2xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
