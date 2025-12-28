"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLogout } from "@/lib/react-query/hooks/useAuth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useDashboardData } from "./hooks/useDashboardData";
import { useRefreshData } from "@/lib/react-query/hooks/useUserData";
import { useNotification } from "@/components/NotificationContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// Menu items configuration with hrefs
const MENU_ITEMS = [
  { id: "overview", label: "Overview", icon: "fa-chart-line", href: "/dashboard" },
  { id: "personal", label: "Informações Pessoais", icon: "fa-user", href: "/dashboard/personal-data" },
  { id: "pesagens", label: "Pesagens", icon: "fa-weight", href: "/dashboard/weighings" },
  { id: "perimetros", label: "Perímetros", icon: "fa-ruler-combined", href: "/dashboard/perimeters" },
  { id: "avaliacoes", label: "Avaliações", icon: "fa-dumbbell", href: "/dashboard/evaluations" },
  { id: "referencias", label: "Referências", icon: "fa-clipboard-list", href: "/dashboard/references" },
  { id: "settings", label: "Definições", icon: "fa-gear", href: "/dashboard/settings" },
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { notify } = useNotification();
  const logoutMutation = useLogout();

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const handleTabChange = useCallback((tabId: string) => {
    const item = MENU_ITEMS.find(m => m.id === tabId);
    if (item?.href) {
      router.push(item.href);
    }
    // Close mobile sidebar
    setSidebarOpen(false);
  }, [router]);

  // Loading state
  if (isLoading || (!isLoading && !isAuthenticated)) {
    return (
      <div className="flex h-screen items-center justify-center bg-whiten dark:bg-boxdark-2">
        <LoadingSpinner />
      </div>
    );
  }

  const activeTab = getActiveTabFromPath(pathname);

  return (
    <div className="flex min-h-screen bg-whiten dark:bg-boxdark-2 text-bodydark1">
      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        menuItems={MENU_ITEMS}
        brandName="Fabiole"
        brandIcon="fa-dumbbell"
        userName={user?.name}
        userSurname={user?.surname}
      />

      {/* Header */}
      <DashboardHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
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
      />

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-[var(--sidebar-width,290px)] mt-[72px] p-6 min-h-[calc(100vh-72px)] bg-whiten transition-[margin-left] duration-300">
        <div className="max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
