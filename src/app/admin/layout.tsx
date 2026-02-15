"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Initialize from cookie on mount
    useEffect(() => {
        const collapsed = document.cookie
            .split("; ")
            .find((row) => row.startsWith("sidebar:collapsed="))
            ?.split("=")[1];
        if (collapsed === "true") {
            setIsCollapsed(true);
        }
    }, []);

    const toggleCollapse = useCallback(() => {
        setIsCollapsed((prev) => {
            const newState = !prev;
            document.cookie = `sidebar:collapsed=${newState}; path=/; max-age=31536000; SameSite=Lax`;
            return newState;
        });
    }, []);

    const handleCloseSidebar = useCallback(() => {
        setSidebarOpen(false);
    }, []);

    const handleToggleSidebar = useCallback(() => {
        setSidebarOpen((prev) => !prev);
    }, []);

    // Reuse dashboard data for user info (admin is also a user)
    const {
        isLoading,
        user,
        isAuthenticated,
    } = useDashboardData();

    const handleLogout = useCallback(() => {
        logoutMutation.mutate();
    }, [logoutMutation]);

    // Loading & Auth Check
    // (Middleware handles severe auth failures, but client check is nice)
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/");
        }
    }, [isLoading, isAuthenticated, router]);

    // Memoize activeTab calculation
    const activeTab = useMemo(() => getActiveTabFromPath(pathname), [pathname]);

    // Sidebar margin is no longer needed as we use sticky positioning in a flex container

    // Set CSS variable for sidebar width dynamically - Updated for compact design
    useEffect(() => {
        const sidebarWidth = isCollapsed ? "72px" : "260px";
        document.documentElement.style.setProperty("--sidebar-width", sidebarWidth);
    }, [isCollapsed]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900">
            {/* Admin Sidebar - uses Link prefetch for instant navigation */}
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={handleCloseSidebar}
                activeTab={activeTab}
                userName={user?.name}
                userSurname={user?.surname}
                avatarUrl={user?.avatarUrl}
                isCollapsed={isCollapsed}
                onToggle={toggleCollapse}
            />

            {/* Header - Reusing DashboardHeader but styled for Admin context if needed */}
            {/* Note: DashboardHeader is fixed with proper z-index and checks sidebar width variable */}
            <DashboardHeader
                onMenuClick={handleToggleSidebar}
                userName={user?.name}
                userSurname={user?.surname}
                userEmail={user?.email}
                avatarUrl={user?.avatarUrl}
                onLogout={handleLogout}
                isLoggingOut={logoutMutation.isPending}
                isCollapsed={isCollapsed}
            />

            {/* Main Content – left-aligned, responsive padding */}
            <main className={`flex-1 mt-14 min-h-[calc(100vh-3.5rem)] bg-gray-50 overflow-x-hidden px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6`}>
                <div className="max-w-screen-2xl w-full mr-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
