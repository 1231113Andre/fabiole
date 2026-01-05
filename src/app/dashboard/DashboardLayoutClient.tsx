"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLogout } from "@/lib/react-query/hooks/useAuth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useDashboardData } from "./hooks/useDashboardData";
import { useRefreshData } from "@/lib/react-query/hooks/useUserData";
import { useNotification } from "@/components/NotificationContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";

import { MenuItem } from "@/components/sidebar/SidebarMenuItem";

// Menu items configuration with hrefs for Link prefetch
const MENU_ITEMS: MenuItem[] = [
    { id: "overview", label: "Overview", icon: "fa-chart-line", href: "/dashboard" },
    { id: "personal", label: "Informações Pessoais", icon: "fa-user", href: "/dashboard/personal-data", dividerLabel: "Meu Corpo" },
    { id: "pesagens", label: "Pesagens", icon: "fa-weight", href: "/dashboard/weighings" },
    { id: "perimetros", label: "Perímetros", icon: "fa-ruler-combined", href: "/dashboard/perimeters" },
    { id: "avaliacoes", label: "Avaliações", icon: "fa-dumbbell", href: "/dashboard/evaluations", dividerLabel: "Análises" },
    { id: "referencias", label: "Referências", icon: "fa-clipboard-list", href: "/dashboard/references" },
    { id: "settings", label: "Definições", icon: "fa-gear", href: "/dashboard/settings", dividerLabel: "Configurações" },
];

// Map pathname to activeTab id
function getActiveTabFromPath(pathname: string): string {
    if (pathname === "/dashboard") return "overview";
    if (pathname.includes("/personal-data")) return "personal";
    if (pathname.includes("/weighings")) return "pesagens";
    if (pathname.includes("/perimeters")) return "perimetros";
    if (pathname.includes("/evaluations")) return "avaliacoes";
    if (pathname.includes("/references")) return "referencias";
    if (pathname.includes("/settings")) return "settings";
    return "overview";
}

interface DashboardLayoutClientProps {
    children: React.ReactNode;
    defaultCollapsed?: boolean;
}

export default function DashboardLayoutClient({
    children,
    defaultCollapsed = false,
}: DashboardLayoutClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { notify } = useNotification();
    const logoutMutation = useLogout();

    // UI state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

    // Refresh hook with cooldown
    const {
        refresh,
        isRefreshing: isManualRefreshing,
        cooldownProgress
    } = useRefreshData();

    // Data from custom hook
    const {
        isLoading,
        isRefreshing: isDataRefreshing,
        user,
        isAuthenticated,
    } = useDashboardData();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/");
        }
    }, [isLoading, isAuthenticated, router]);

    // Handlers
    const toggleCollapse = useCallback(() => {
        setIsCollapsed((prev) => {
            const newState = !prev;
            document.cookie = `sidebar:collapsed=${newState}; path=/; max-age=31536000; SameSite=Lax`;
            return newState;
        });
    }, []);

    const handleRefresh = useCallback(async () => {
        const result = await refresh();

        if (result.success) {
            setLastRefreshTime(new Date());
            notify("Os seus dados foram atualizados com sucesso.", "success");
        } else if (result.reason === "cooldown") {
            const seconds = result.remainingSeconds || 30;
            notify(`Aguarde ${seconds} segundo${seconds !== 1 ? 's' : ''} antes de atualizar novamente.`, "info");
        } else {
            notify("Não foi possível atualizar os dados. Tente novamente.", "error");
        }
    }, [refresh, notify]);

    const handleLogout = useCallback(() => {
        logoutMutation.mutate();
    }, [logoutMutation]);

    const handleCloseSidebar = useCallback(() => {
        setSidebarOpen(false);
    }, []);

    const handleToggleSidebar = useCallback(() => {
        setSidebarOpen((prev) => !prev);
    }, []);

    // Memoize activeTab calculation
    const activeTab = useMemo(() => getActiveTabFromPath(pathname), [pathname]);

    // Memoize sidebar margin calculation
    const sidebarMargin = useMemo(() => {
        return isCollapsed ? "lg:ml-[90px]" : "lg:ml-[290px]";
    }, [isCollapsed]);

    // Set CSS variable for sidebar width dynamically
    useEffect(() => {
        const sidebarWidth = isCollapsed ? "90px" : "290px";
        document.documentElement.style.setProperty("--sidebar-width", sidebarWidth);
    }, [isCollapsed]);

    // Loading state
    if (isLoading || (!isLoading && !isAuthenticated)) {
        return (
            <div className="flex h-screen items-center justify-center bg-whiten dark:bg-boxdark-2">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-whiten dark:bg-boxdark-2 text-bodydark1">
            {/* Sidebar - uses Link prefetch for instant navigation */}
            <DashboardSidebar
                isOpen={sidebarOpen}
                onClose={handleCloseSidebar}
                activeTab={activeTab}
                menuItems={MENU_ITEMS}
                brandName="Fabiole"
                brandIcon="fa-dumbbell"
                userName={user?.name}
                userSurname={user?.surname}
                avatarUrl={user?.avatarUrl}
                isCollapsed={isCollapsed}
                onToggle={toggleCollapse}
            />

            {/* Header */}
            <DashboardHeader
                onMenuClick={handleToggleSidebar}
                userName={user?.name}
                userSurname={user?.surname}
                userEmail={user?.email}
                avatarUrl={user?.avatarUrl}
                onRefresh={handleRefresh}
                isRefreshing={isManualRefreshing || isDataRefreshing}
                cooldownProgress={cooldownProgress}
                lastRefreshTime={lastRefreshTime ?? undefined}
                onLogout={handleLogout}
                isLoggingOut={logoutMutation.isPending}
                isCollapsed={isCollapsed}
            />

            {/* Main Content */}
            <main className={`flex-1 ml-0 ${sidebarMargin} mt-[72px] p-6 min-h-[calc(100vh-72px)] bg-whiten transition-[margin-left] duration-300`}>
                <div className="max-w-screen-2xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
