"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useLogout } from "@/lib/react-query/hooks/useAuth";
import { useRefreshData } from "@/lib/react-query/hooks/useUserData";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useDashboardData } from "./hooks/useDashboardData";
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
    const queryClient = useQueryClient();
    const { notify } = useNotification();
    const logoutMutation = useLogout();

    // UI state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [isMobile, setIsMobile] = useState(false);
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

    // Handle responsive layout (throttled to avoid excessive re-renders during resize)
    useEffect(() => {
        let rafId: number | null = null;
        let lastWidth = -1;

        const handleResize = () => {
            const width = window.innerWidth;
            if (rafId !== null) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                rafId = null;
                if (width === lastWidth) return;
                lastWidth = width;
                const mobile = width < 768;
                setIsMobile(mobile);
                if (!mobile && width < 1400) {
                    setIsCollapsed(true);
                } else if (width >= 1400) {
                    setIsCollapsed(false);
                }
            });
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    // Prefetch user data when hovering sidebar links so navigation feels instant
    const prefetchUserData = useCallback(() => {
        const email = user?.email;
        if (!email) return;
        queryClient.prefetchQuery({
            queryKey: queryKeys.userData(email, "default"),
            queryFn: async () => {
                const res = await fetch("/api/user/data");
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            },
            staleTime: 30 * 1000,
        });
    }, [queryClient, user?.email]);

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

    // Sidebar margin is no longer needed as we use sticky positioning in a flex container
    // but we might need it for transitions or if we kept it fixed. 
    // Since we switched to sticky, we just need to ensure the main content grows.
    // However, the header is still fixed and needs to know the offset.
    // The main content should just flow next to the sidebar.

    // Set CSS variable for sidebar width dynamically - Updated for compact design
    useEffect(() => {
        const sidebarWidth = isMobile ? "0px" : (isCollapsed ? "72px" : "260px");
        document.documentElement.style.setProperty("--sidebar-width", sidebarWidth);
    }, [isCollapsed, isMobile]);

    // Loading state
    if (isLoading || (!isLoading && !isAuthenticated)) {
        return (
            <div className="flex h-screen items-center justify-center bg-boxdark-2">
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
                onLinkHover={prefetchUserData}
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

            {/* Main Content – flows naturally next to sticky sidebar on desktop */}
            <main className={`flex-1 mt-14 min-h-[calc(100vh-3.5rem)] bg-whiten overflow-x-hidden px-2 py-3 sm:px-3 sm:py-4 lg:px-4 lg:py-5`}>
                <div className={pathname === "/dashboard" || pathname?.includes("weighings") ? "w-full min-w-0 mr-auto" : "max-w-screen-xl w-full mr-auto"}>
                    {children}
                </div>
            </main>

            {/* Mobile Overlay */}
            {sidebarOpen && isMobile && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in"
                    onClick={handleCloseSidebar}
                    aria-hidden="true"
                />
            )}
        </div>
    );
}
