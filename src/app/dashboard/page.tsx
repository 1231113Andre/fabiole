"use client";
import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, useLogout } from "@/lib/react-query/hooks/useAuth";
import { useUserData } from "@/lib/react-query/hooks/useUserData";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import NewButton from "@/app/components/newButton";
import { OverviewTab } from "./components/OverviewTab";
import { PersonalInfoTab } from "./components/PersonalInfoTab";
import { PesagensTab } from "./components/PesagensTab";
import { PerimetrosTab } from "./components/PerimetrosTab";
import { AvaliacoesTab } from "./components/AvaliacoesTab";
import { ReferencesTab } from "./components/ReferencesTab";
import { PersonalInfo, Pesagem, PerimetroCorporal, AvaliacaoFisica, TabType, ReferenceTables } from "./types";

import { useNotification } from "@/components/NotificationContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function DashboardPage() {
  const router = useRouter();
  const [forceRefresh, setForceRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const { notify } = useNotification();

  // Use TanStack Query hooks - ALL HOOKS MUST BE CALLED UNCONDITIONALLY
  const { data: sessionData, isLoading: isSessionLoading } = useSession();
  const { data: userData, isLoading: isUserDataLoading, isFetching: isUserDataFetching, error: userDataError, refetch } = useUserData(forceRefresh);
  const logoutMutation = useLogout();

  const user = sessionData?.user;
  const isLoading = isSessionLoading || isUserDataLoading;
  const isAuthenticated = sessionData?.authenticated && sessionData?.user;

  // Redirect to home if not authenticated (using useEffect to avoid hooks order issues)
  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isSessionLoading, isAuthenticated, router]);

  // Transform user data from Google Sheets format to component format
  const transformedData = useMemo(() => {
    if (!userData || !user) {
      return {
        personalInfo: null,
        pesagens: [],
        perimetros: [],
        avaliacoes: [],
        referenceTables: {},
      };
    }

    // Fallback to session data if userData fails
    const fallbackPersonalInfo: PersonalInfo = {
      name: `${user.name} ${user.surname}`,
      email: user.email,
      birthDate: user.birth,
      phone: "",
      height: "",
      weight: "",
      goals: "",
      notes: "",
    };

    if (userDataError || !userData) {
      return {
        personalInfo: fallbackPersonalInfo,
        pesagens: [],
        perimetros: [],
        avaliacoes: [],
        referenceTables: {},
      };
    }

    // Set personal info from sheet data
    const personalInfo: PersonalInfo = {
      name: `${userData.personalInfo.userName} ${userData.personalInfo.userSurname}`,
      email: userData.personalInfo.userEmail,
      birthDate: userData.personalInfo.userBirth,
      phone: userData.personalInfo.userPhone || "",
      height: "",
      weight: userData.pesagens && userData.pesagens.length > 0 ? `${userData.pesagens[userData.pesagens.length - 1].peso} kg` : "",
      goals: userData.personalInfo.notas || "",
      notes: userData.personalInfo.notas || "",
      trainingCredit: userData.personalInfo.trainingCredit || "",
      trainingsScheduled: userData.personalInfo.trainingsScheduled || "",
      debtValue: userData.personalInfo.debtValue || "",
      paid: userData.personalInfo.paid || "",
      q1: userData.personalInfo.q1 || "",
      q2: userData.personalInfo.q2 || "",
      q3: userData.personalInfo.q3 || "",
      q4: userData.personalInfo.q4 || "",
    };

    // Helper to parse date (assuming DD/MM/YYYY or DD.MM.YYYY format)
    const parseDate = (dateStr: string) => {
      if (!dateStr) return 0;
      const parts = dateStr.split(/[./]/); // Split by . or /
      if (parts.length === 3) {
        // DD/MM/YYYY -> YYYY-MM-DD for comparison
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
      }
      return new Date(dateStr).getTime();
    };

    // Convert pesagens data
    const pesagens: Pesagem[] = (userData.pesagens || [])
      .map((p: any) => ({
        data: p.data,
        peso: parseFloat(p.peso) || 0,
        percentualMG: parseFloat(p.percentualMG) || 0,
        MM: parseFloat(p.MM) || 0,
        H2O: parseFloat(p.H2O) || 0,
        IMC: parseFloat(p.IMC) || 0,
        gordVisceral: parseFloat(p.gordVisceral) || 0,
        IDMetabolica: parseFloat(p.IDMetabolica) || 0,
        massaOssea: parseFloat(p.massaOssea) || 0,
        resultadoIMC: p.resultadoIMC || "",
        resultadoPercentualMG: p.resultadoPercentualMG || "",
        notas: p.notas || "",
      }))
      .filter((p: Pesagem) => p.peso > 0)
      .sort((a, b) => parseDate(b.data) - parseDate(a.data)); // Sort descending (newest first)

    // Convert perimetros data
    const perimetros: PerimetroCorporal[] = (userData.perimetros || [])
      .map((p: any) => ({
        date: p.date,
        msRight: parseFloat(p.msRight) || 0,
        msRightFlex: parseFloat(p.msRightFlex) || 0,
        msLeft: parseFloat(p.msLeft) || 0,
        msLeftFlex: parseFloat(p.msLeftFlex) || 0,
        chest: parseFloat(p.chest) || 0,
        waist: parseFloat(p.waist) || 0,
        abdomen: parseFloat(p.abdomen) || 0,
        hips: parseFloat(p.hips) || 0,
        thighR: parseFloat(p.thighR) || 0,
        thighL: parseFloat(p.thighL) || 0,
      }))
      .filter((p: PerimetroCorporal) => p.chest > 0 || p.waist > 0)
      .sort((a, b) => parseDate(b.date) - parseDate(a.date)); // Sort descending (newest first)

    // Convert avaliacoes data
    const avaliacoes: AvaliacaoFisica[] = (userData.avaliacoes || [])
      .map((a: any) => ({
        date: a.date,
        pushUps: parseInt(a.pushUps) || 0,
        sitUps: parseInt(a.sitUps) || 0,
        mile: a.mile || "",
        mileResult: a.mileResult || "",
        notes: a.notes || "",
      }))
      .filter((a: AvaliacaoFisica) => a.pushUps > 0 || a.sitUps > 0 || a.mile)
      .sort((a, b) => parseDate(b.date) - parseDate(a.date)); // Sort descending (newest first)

    return {
      personalInfo,
      pesagens,
      perimetros,
      avaliacoes,
      referenceTables: (userData.referenceTables || {}) as ReferenceTables,
    };
  }, [userData, user, userDataError]);

  const { personalInfo, pesagens, perimetros, avaliacoes, referenceTables } = transformedData;

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setForceRefresh(true);
    refetch()
      .then(() => notify("Dados atualizados com sucesso", "success"))
      .catch(() => notify("Erro ao atualizar dados", "error"))
      .finally(() => {
        setTimeout(() => {
          setForceRefresh(false);
          setIsRefreshing(false);
        }, 500);
      });
  }, [refetch, notify]);

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  // Prepare chart data
  const chartData = pesagens.map((p) => ({
    data: p.data,
    peso: typeof p.peso === 'number' ? p.peso : parseFloat(String(p.peso)) || 0,
    massaGorda: typeof p.percentualMG === 'number' ? p.percentualMG : parseFloat(String(p.percentualMG)) || 0,
    massaMuscular: typeof p.MM === 'number' ? p.MM : parseFloat(String(p.MM)) || 0,
    gorduraVisceral: typeof p.gordVisceral === 'number' ? p.gordVisceral : parseFloat(String(p.gordVisceral)) || 0,
    IMC: typeof p.IMC === 'number' ? p.IMC : parseFloat(String(p.IMC)) || 0,
  }));

  // Calculate statistics for overview
  const stats = useMemo(() => {
    const latestPesagem = pesagens.length > 0 ? pesagens[pesagens.length - 1] : null;
    const latestPerimetro = perimetros.length > 0 ? perimetros[perimetros.length - 1] : null;
    const latestAvaliacao = avaliacoes.length > 0 ? avaliacoes[avaliacoes.length - 1] : null;

    // Calculate weight trend
    const weightTrend = pesagens.length >= 2
      ? pesagens[pesagens.length - 1].peso - pesagens[pesagens.length - 2].peso
      : 0;

    return {
      latestPesagem,
      latestPerimetro,
      latestAvaliacao,
      weightTrend,
      totalPesagens: pesagens.length,
      totalPerimetros: perimetros.length,
      totalAvaliacoes: avaliacoes.length,
    };
  }, [pesagens, perimetros, avaliacoes]);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "fa-chart-line" },
    { id: "personal", label: "Informações Pessoais", icon: "fa-user" },
    { id: "pesagens", label: "Pesagens", icon: "fa-weight" },
    { id: "perimetros", label: "Perímetros", icon: "fa-ruler-combined" },
    { id: "avaliacoes", label: "Avaliações", icon: "fa-dumbbell" },
    { id: "referencias", label: "Referências", icon: "fa-clipboard-list" },
  ];

  // Menu items for sidebar
  const menuItems = tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
  }));



  // Show loading spinner while loading OR while redirecting unauthenticated users
  if (isLoading || (!isSessionLoading && !isAuthenticated)) {
    return (
      <div className="flex h-screen items-center justify-center bg-whiten dark:bg-boxdark-2">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-whiten dark:bg-boxdark-2 text-bodydark1">
      {/* TailAdmin-style Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
        menuItems={menuItems}
        brandName="Fabiole"
        brandIcon="fa-dumbbell"
      />

      {/* TailAdmin-style Header */}
      <DashboardHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userName={user?.name}
        userSurname={user?.surname}
        userEmail={user?.email}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing || isUserDataFetching}
        onLogout={handleLogout}
        isLoggingOut={logoutMutation.isPending}
      />

      <main className="flex-1 ml-0 lg:ml-[var(--sidebar-width,290px)] mt-[72px] p-6 min-h-[calc(100vh-72px)] bg-whiten transition-[margin-left] duration-300">
        <div className="max-w-screen-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg">
                    <i className="fa-duotone fa-user-circle text-white text-lg sm:text-xl"></i>
                  </div>
                  <span>Dashboard do Cliente</span>
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base flex items-center gap-2">
                  <i className="fa-duotone fa-hand-sparkles text-primary"></i>
                  Bem-vindo de volta{user ? `, ${user.name} ${user.surname}` : ''}!
                </p>
              </div>
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

          {activeTab === "perimetros" && (
            <PerimetrosTab perimetros={perimetros} />
          )}

          {activeTab === "avaliacoes" && (
            <AvaliacoesTab avaliacoes={avaliacoes} />
          )}

          {activeTab === "referencias" && (
            <ReferencesTab referenceTables={referenceTables} />
          )}

          {/* Back to Home */}
          <div className="text-center mt-8 pb-8">
            <NewButton
              href="/"
              variant="new_primary_rounded"
              icon={<i className="fa-duotone fa-arrow-left"></i>}
              iconPosition="left"
              className="!text-black hover:!text-primary"
            >
              Voltar ao website
            </NewButton>
          </div>
        </div>
      </main >
    </div >
  );
}
