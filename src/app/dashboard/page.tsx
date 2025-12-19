"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/lib/react-query/hooks/useAuth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import NewButton from "@/app/components/newButton";
import { OverviewTab } from "./components/OverviewTab";
import { PersonalInfoTab } from "./components/PersonalInfoTab";
import { PesagensTab } from "./components/PesagensTab";
import { PerimetrosTab } from "./components/PerimetrosTab";
import { AvaliacoesTab } from "./components/AvaliacoesTab";
import { ReferencesTab } from "./components/ReferencesTab";
import { PesagensInfoCards } from "./components/PesagensInfoCards";
import { TabType, Gender, Category } from "./types";
import { useDashboardData } from "./hooks/useDashboardData";
import { useRefreshData } from "@/lib/react-query/hooks/useUserData";
import { useNotification } from "@/components/NotificationContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// Tab configuration
const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "fa-chart-line" },
  { id: "personal", label: "Informações Pessoais", icon: "fa-user" },
  { id: "pesagens", label: "Pesagens", icon: "fa-weight" },
  { id: "perimetros", label: "Perímetros", icon: "fa-ruler-combined" },
  { id: "avaliacoes", label: "Avaliações", icon: "fa-dumbbell" },
  { id: "referencias", label: "Referências", icon: "fa-clipboard-list" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { notify } = useNotification();
  const logoutMutation = useLogout();

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Reference tab state (lifted up)
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>("massaGorda");

  // Refresh hook with cooldown
  const {
    refresh,
    isRefreshing: isManualRefreshing,
    cooldownProgress
  } = useRefreshData();

  // Data from custom hook
  const {
    personalInfo,
    pesagens,
    perimetros,
    avaliacoes,
    referenceTables,
    chartData,
    stats,
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

  const handleResetReferences = useCallback(() => {
    setSelectedGender(null);
    setSelectedCategory("massaGorda");
  }, []);

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
      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
        menuItems={TABS}
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
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            {/* Navigation Buttons */}
            <div className="mb-6 flex flex-wrap gap-4">
              {activeTab === "overview" ? (
                <NewButton
                  href="/"
                  variant="new_primary_rounded"
                  icon={<i className="fa-duotone fa-home-lg" />}
                  iconPosition="left"
                  className="w-full sm:w-auto min-w-[200px] shadow-md uppercase font-bold"
                >
                  Voltar ao Site
                </NewButton>
              ) : (
                <NewButton
                  onClick={() => setActiveTab("overview")}
                  variant="new_primary_rounded"
                  icon={<i className="fa-duotone fa-arrow-left" />}
                  iconPosition="left"
                  className="w-full sm:w-auto min-w-[200px] shadow-md uppercase font-bold"
                >
                  Voltar ao Overview
                </NewButton>
              )}

              {activeTab === "referencias" && selectedGender && (
                <NewButton
                  onClick={handleResetReferences}
                  variant="new_primary_rounded"
                  icon={<i className="fa-duotone fa-arrow-left" />}
                  iconPosition="left"
                  className="w-full sm:w-auto min-w-[200px] uppercase font-bold"
                >
                  Voltar ao IMC
                </NewButton>
              )}
            </div>

            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg">
                    <i className="fa-duotone fa-user-circle text-white text-lg sm:text-xl" />
                  </div>
                  <span>Dashboard do Cliente</span>
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl font-medium flex items-center gap-2 mt-1 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
                  <span className="text-2xl hover:animate-pulse cursor-default">👋</span>
                  Bem-vindo de volta,{" "}
                  <span className="text-primary font-bold">
                    {user ? `${user.name} ${user.surname}!` : "Visitante!"}
                  </span>
                </p>
              </div>

              {/* Info Cards - Pesagens tab only */}
              {activeTab === "pesagens" && <PesagensInfoCards />}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <OverviewTab personalInfo={personalInfo} stats={stats} chartData={chartData} />
          )}

          {activeTab === "personal" && personalInfo && (
            <PersonalInfoTab personalInfo={personalInfo} />
          )}

          {activeTab === "pesagens" && (
            <PesagensTab pesagens={pesagens} chartData={chartData} />
          )}

          {activeTab === "perimetros" && <PerimetrosTab perimetros={perimetros} />}

          {activeTab === "avaliacoes" && <AvaliacoesTab avaliacoes={avaliacoes} />}

          {activeTab === "referencias" && referenceTables && (
            <ReferencesTab
              referenceTables={referenceTables}
              selectedGender={selectedGender}
              setSelectedGender={setSelectedGender}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          )}
        </div>
      </main>
    </div>
  );
}
