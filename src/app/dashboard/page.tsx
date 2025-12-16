"use client";
import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useSession, useLogout } from "@/lib/react-query/hooks/useAuth";
import { useUserData } from "@/lib/react-query/hooks/useUserData";
import { ThemeSwitcher } from "@/app/components/ThemeSwitcher";

// Import recharts components - using regular import to avoid HMR issues
// If HMR issues persist, restart the dev server
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface PersonalInfo {
  name: string;
  email: string;
  birthDate: string;
  phone?: string;
  height?: string;
  weight?: string;
  goals?: string;
  notes?: string;
  lastUpdate?: string;
  trainingCredit?: string;
  trainingsScheduled?: string;
  debtValue?: string;
  paid?: string;
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
}

interface Pesagem {
  data: string;
  peso: number;
  percentualMG: number;
  MM: number;
  H2O: number;
  IMC: number;
  gordVisceral: number;
  IDMetabolica: number;
  massaOssea: number;
  resultadoIMC: string;
  resultadoPercentualMG: string;
  notas?: string;
}

interface PerimetroCorporal {
  data: string;
  msDrt: number;
  msDrtCon: number;
  msEsq: number;
  msEsqCon: number;
  peito: number;
  cintura: number;
  abdominal: number;
  anca: number;
  miDrt: number;
  miEsq: number;
}

interface AvaliacaoFisica {
  data: string;
  flexoes1min: number;
  abdominais1min: number;
  milha: string;
  resultadoMilha: string;
}

type TabType = "overview" | "personal" | "pesagens" | "perimetros" | "avaliacoes" | "referencias";

export default function DashboardPage() {
  const [forceRefresh, setForceRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  
  // Use TanStack Query hooks
  const { data: sessionData, isLoading: isSessionLoading } = useSession();
  const { data: userData, isLoading: isUserDataLoading, isFetching: isUserDataFetching, error: userDataError, refetch } = useUserData(forceRefresh);
  const logoutMutation = useLogout();

  // Redirect to login if not authenticated
  if (!isSessionLoading && (!sessionData?.authenticated || !sessionData?.user)) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  const user = sessionData?.user;
  const isLoading = isSessionLoading || isUserDataLoading;

  // Transform user data from Google Sheets format to component format
  const transformedData = useMemo(() => {
    if (!userData || !user) {
      return {
        personalInfo: null,
        pesagens: [],
        perimetros: [],
        avaliacoes: [],
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
      .filter((p) => p.peso > 0);

    // Convert perimetros data
    const perimetros: PerimetroCorporal[] = (userData.perimetros || [])
      .map((p: any) => ({
        data: p.data,
        msDrt: parseFloat(p.msDrt) || 0,
        msDrtCon: parseFloat(p.msDrtCon) || 0,
        msEsq: parseFloat(p.msEsq) || 0,
        msEsqCon: parseFloat(p.msEsqCon) || 0,
        peito: parseFloat(p.peito) || 0,
        cintura: parseFloat(p.cintura) || 0,
        abdominal: parseFloat(p.abdominal) || 0,
        anca: parseFloat(p.anca) || 0,
        miDrt: parseFloat(p.miDrt) || 0,
        miEsq: parseFloat(p.miEsq) || 0,
      }))
      .filter((p: any) => p.peito > 0 || p.cintura > 0);

    // Convert avaliacoes data
    const avaliacoes: AvaliacaoFisica[] = (userData.avaliacoes || [])
      .map((a: any) => ({
        data: a.data,
        flexoes1min: parseInt(a.flexoes1min) || 0,
        abdominais1min: parseInt(a.abdominais1min) || 0,
        milha: a.milha || "",
        resultadoMilha: a.resultadoMilha || "",
      }))
      .filter((a: any) => a.flexoes1min > 0 || a.abdominais1min > 0 || a.milha);

    return {
      personalInfo,
      pesagens,
      perimetros,
      avaliacoes,
      referenceTables: userData.referenceTables || {},
    };
  }, [userData, user, userDataError]);

  const { personalInfo, pesagens, perimetros, avaliacoes, referenceTables } = transformedData;

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setForceRefresh(true);
    refetch().finally(() => {
      setTimeout(() => {
        setForceRefresh(false);
        setIsRefreshing(false);
      }, 500);
    });
  }, [refetch]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-6 z-[1000] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        <div className="pt-16 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-lg border border-border p-6 shadow-sm">
                    <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-24 mb-4"></div>
                    <div className="h-8 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Top Header Bar - Paper Dashboard Pro Style */}
      <header className="paper-header fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 sm:px-6 z-[1000]">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            className="md:hidden p-2.5 rounded-xl hover:bg-muted/80 active:scale-95 transition-all duration-200"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <i className="fas fa-bars text-lg text-foreground"></i>
          </button>
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-muted/50">
            <i className="fas fa-envelope-circle-check text-primary text-sm"></i>
            <span className="font-medium text-sm sm:text-base text-foreground hidden sm:inline">{user?.email || 'Email'}</span>
            <span className="font-medium text-xs text-foreground sm:hidden truncate max-w-[120px]">{user?.email?.split('@')[0] || 'Email'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeSwitcher />
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isUserDataFetching}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-foreground bg-muted/80 hover:bg-muted rounded-xl active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            title="Atualizar dados"
          >
            {isRefreshing || isUserDataFetching ? (
              <>
                <i className="fas fa-spinner fa-spin text-primary"></i>
                <span className="hidden sm:inline">A atualizar...</span>
              </>
            ) : (
              <>
                <i className="fas fa-arrows-rotate text-primary"></i>
                <span className="hidden sm:inline">Atualizar</span>
              </>
            )}
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-xl hover:bg-muted/80 active:scale-95 transition-all duration-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-primary-foreground text-sm font-bold shadow-md ring-2 ring-primary/20">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden lg:inline text-sm font-semibold text-foreground">{user?.name || 'User'}</span>
              <i className="fas fa-chevron-down text-xs text-muted-foreground hidden lg:inline"></i>
            </button>
            <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-2xl border border-border/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 backdrop-blur-md">
              <div className="py-2">
                <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
                  <p className="text-sm font-bold text-foreground flex items-center gap-2">
                    <i className="fas fa-user-circle text-primary"></i>
                    {user?.name} {user?.surname}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-1 flex items-center gap-1.5">
                    <i className="fas fa-envelope text-[10px]"></i>
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2.5 disabled:opacity-50 rounded-lg mx-1 my-1"
                >
                  <i className="fas fa-right-from-bracket"></i>
                  <span>{logoutMutation.isPending ? 'A sair...' : 'Sair'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar Navigation - Paper Dashboard Pro Style */}
        <aside className={`paper-sidebar w-[280px] fixed top-16 left-0 h-[calc(100vh-64px)] overflow-y-auto z-50 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xl font-bold flex items-center gap-3 m-0" style={{ color: 'var(--foreground)' }}>
              <div className="paper-icon-container primary">
                <i className="fas fa-chart-line text-white text-lg"></i>
              </div>
              <span>Dashboard</span>
          </h3>
        </div>
        <nav className="py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`paper-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
              >
                <i className={`fas ${tab.icon} w-5 text-center`}></i>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
        </nav>
      </aside>

        {/* Main Content - Enhanced with Tailwind */}
        <main className="flex-1 ml-0 md:ml-[280px] p-4 sm:p-6 min-h-[calc(100vh-64px)]">
          <div className="max-w-7xl mx-auto">
            {/* Page Header - Enhanced */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg">
                      <i className="fas fa-user-circle text-white text-lg sm:text-xl"></i>
                    </div>
                    <span>Dashboard do Cliente</span>
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base flex items-center gap-2">
                    <i className="fas fa-hand-sparkles text-primary"></i>
                    Bem-vindo de volta{user ? `, ${user.name} ${user.surname}` : ''}!
                  </p>
            </div>
          </div>
        </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Statistics Cards - Paper Dashboard Pro Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {personalInfo?.trainingCredit && personalInfo.trainingCredit.trim() !== "" && (
                    <div className="paper-stat-card">
                  <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <p className="paper-stat-label">Training Credit</p>
                          <h3 className="paper-stat-value">{personalInfo.trainingCredit}</h3>
                    </div>
                        <div className="paper-icon-container primary">
                      <i className="fas fa-coins text-white text-xl"></i>
                    </div>
                  </div>
                </div>
              )}
                  {personalInfo?.trainingsScheduled && personalInfo.trainingsScheduled.trim() !== "" && (
                    <div className="paper-stat-card">
                  <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <p className="paper-stat-label">Treinings Scheduled</p>
                          <h3 className="paper-stat-value">{personalInfo.trainingsScheduled}</h3>
                    </div>
                        <div className="paper-icon-container success">
                      <i className="fas fa-calendar-check text-white text-xl"></i>
                    </div>
                  </div>
                </div>
              )}
                  {personalInfo?.debtValue && personalInfo.debtValue.trim() !== "" && (
                    <div className="paper-stat-card">
                  <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <p className="paper-stat-label">Debt Value</p>
                          <h3 className="paper-stat-value">{personalInfo.debtValue}</h3>
                    </div>
                        <div className="paper-icon-container danger">
                      <i className="fas fa-exclamation-triangle text-white text-xl"></i>
                    </div>
                  </div>
                </div>
              )}
                  {personalInfo?.paid && personalInfo.paid.trim() !== "" && (
                    <div className="paper-stat-card">
                  <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <p className="paper-stat-label">Paid Status</p>
                          <h3 className="paper-stat-value">{personalInfo.paid}</h3>
                    </div>
                        <div className={`paper-icon-container ${
                    personalInfo.paid.toLowerCase() === 'sim' || personalInfo.paid.toLowerCase() === 'yes'
                            ? 'success'
                            : 'warning'
                    }`}>
                      <i className={`fas text-white text-xl ${
                        personalInfo.paid.toLowerCase() === 'sim' || personalInfo.paid.toLowerCase() === 'yes'
                              ? 'fa-circle-check'
                              : 'fa-circle-exclamation'
                      }`}></i>
                    </div>
                  </div>
                </div>
              )}
            </div>

                {/* Quick Stats Grid - Paper Dashboard Pro Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="paper-card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="paper-title flex items-center gap-2">
                        <i className="fas fa-scale-balanced" style={{ color: 'var(--primary)' }}></i>
                        Total Pesagens
                      </h3>
                      <div className="paper-icon-container info">
                        <i className="fas fa-weight text-white text-xl"></i>
                      </div>
                    </div>
                    <p className="paper-stat-value">{stats.totalPesagens}</p>
                    {stats.latestPesagem && (
                      <p className="paper-subtitle flex items-center gap-1.5">
                        <i className="fas fa-clock text-[10px]"></i>
                        Última: {stats.latestPesagem.peso} kg ({stats.latestPesagem.data})
                      </p>
                    )}
                  </div>
                  <div className="paper-card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="paper-title flex items-center gap-2">
                        <i className="fas fa-ruler" style={{ color: 'var(--info)' }}></i>
                        Total Perímetros
                      </h3>
                      <div className="paper-icon-container info">
                        <i className="fas fa-ruler-combined text-white text-xl"></i>
                      </div>
                    </div>
                    <p className="paper-stat-value">{stats.totalPerimetros}</p>
                    {stats.latestPerimetro && (
                      <p className="paper-subtitle flex items-center gap-1.5">
                        <i className="fas fa-clock text-[10px]"></i>
                        Último: {stats.latestPerimetro.data}
                      </p>
                    )}
                  </div>
                  <div className="paper-card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="paper-title flex items-center gap-2">
                        <i className="fas fa-dumbbell" style={{ color: 'var(--rose)' }}></i>
                        Total Avaliações
                      </h3>
                      <div className="paper-icon-container rose">
                        <i className="fas fa-dumbbell text-white text-xl"></i>
                      </div>
                    </div>
                    <p className="paper-stat-value">{stats.totalAvaliacoes}</p>
                    {stats.latestAvaliacao && (
                      <p className="paper-subtitle flex items-center gap-1.5">
                        <i className="fas fa-clock text-[10px]"></i>
                        Última: {stats.latestAvaliacao.data}
                      </p>
                    )}
                  </div>
                </div>

                {/* Latest Measurements Summary - Paper Dashboard Pro Style */}
                {stats.latestPesagem && (
                  <div className="paper-card">
                    <h3 className="paper-title mb-4 flex items-center gap-3">
                      <div className="paper-icon-container primary">
                        <i className="fas fa-chart-line text-white"></i>
                      </div>
                      <span>Última Pesagem - Resumo</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4" style={{ background: 'var(--muted)', borderRadius: '4px' }}>
                        <p className="paper-stat-label">Peso</p>
                        <p className="paper-stat-value" style={{ fontSize: '1.5rem' }}>{stats.latestPesagem.peso} <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>kg</span></p>
                      </div>
                      <div className="p-4" style={{ background: 'var(--muted)', borderRadius: '4px' }}>
                        <p className="paper-stat-label">% Massa Gorda</p>
                        <p className="paper-stat-value" style={{ fontSize: '1.5rem' }}>{stats.latestPesagem.percentualMG}<span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>%</span></p>
                      </div>
                      <div className="p-4" style={{ background: 'var(--muted)', borderRadius: '4px' }}>
                        <p className="paper-stat-label">Massa Muscular</p>
                        <p className="paper-stat-value" style={{ fontSize: '1.5rem' }}>{stats.latestPesagem.MM} <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>kg</span></p>
                      </div>
                      <div className="p-4" style={{ background: 'var(--muted)', borderRadius: '4px' }}>
                        <p className="paper-stat-label">IMC</p>
                        <p className="paper-stat-value" style={{ fontSize: '1.5rem' }}>{stats.latestPesagem.IMC}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Chart Preview - Paper Dashboard Pro Style */}
                {chartData.length > 0 && (
                  <div className="paper-chart">
                    <h3 className="paper-title mb-4 flex items-center gap-3">
                      <div className="paper-icon-container primary">
                        <i className="fas fa-chart-area text-white"></i>
                      </div>
                      <span>Evolução do Peso</span>
                    </h3>
                    <div className="h-[300px] sm:h-[400px] p-4" style={{ background: 'var(--muted)', borderRadius: '4px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                            <XAxis 
                              dataKey="data" 
                              stroke="var(--muted-foreground)" 
                              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                            />
                            <YAxis 
                              stroke="var(--muted-foreground)" 
                              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'var(--card)', 
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                                padding: '12px'
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="peso" 
                              stroke="var(--primary)" 
                              strokeWidth={3}
                              fillOpacity={1}
                              fill="url(#colorPeso)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                )}
              </div>
            )}

            {activeTab === "personal" && (
              <div className="space-y-6">
                <div className="bg-card rounded-2xl border border-border/50 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative px-6 sm:px-8 py-5 sm:py-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3 m-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg">
                        <i className="fas fa-user-circle text-white"></i>
                      </div>
                  <span>Informações Pessoais</span>
                </h2>
                {personalInfo?.lastUpdate && (
                      <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 mt-3 px-3 py-1.5 bg-muted/50 rounded-lg inline-block">
                        <i className="fas fa-clock text-primary"></i>
                    Última atualização: {new Date(personalInfo.lastUpdate).toLocaleDateString("pt-PT")}
                  </span>
                )}
              </div>
                  <div className="p-6 sm:p-8">
              {personalInfo ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                        <div className="group p-5 bg-gradient-to-br from-muted to-muted/50 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          <div className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wide">
                            <i className="fas fa-user text-primary"></i>
                        Nome Completo
                      </div>
                          <div className="text-base sm:text-lg font-bold text-foreground">{personalInfo.name}</div>
                    </div>
                        <div className="group p-5 bg-gradient-to-br from-muted to-muted/50 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          <div className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wide">
                            <i className="fas fa-envelope-circle-check text-primary"></i>
                        Email
                      </div>
                          <div className="text-base sm:text-lg font-bold text-foreground break-words">{personalInfo.email}</div>
                    </div>
                        <div className="group p-5 bg-gradient-to-br from-muted to-muted/50 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          <div className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wide">
                            <i className="fas fa-calendar-days text-primary"></i>
                        Data de Nascimento
                      </div>
                          <div className="text-base sm:text-lg font-bold text-foreground">{personalInfo.birthDate}</div>
                  </div>
                  {personalInfo.phone && personalInfo.phone.trim() !== "" && (
                          <div className="group p-5 bg-gradient-to-br from-muted to-muted/50 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                            <div className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wide">
                              <i className="fas fa-phone text-primary"></i>
                          Telefone
                        </div>
                            <div className="text-base sm:text-lg font-bold text-foreground">{personalInfo.phone}</div>
                    </div>
                  )}
                  {(personalInfo.q1 || personalInfo.q2 || personalInfo.q3 || personalInfo.q4) && (
                          <div className="col-span-full mt-4">
                            <div className="p-5 sm:p-6 bg-gradient-to-br from-muted to-muted/50 rounded-xl border border-border/50">
                              <div className="text-sm sm:text-base font-bold text-foreground mb-4 flex items-center gap-2">
                                <i className="fas fa-chart-pie text-primary"></i>
                          Quarterly Data
                        </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                          {personalInfo.q1 && personalInfo.q1.trim() !== "" && (
                                  <div className="group p-4 bg-card rounded-xl text-center border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Q1</label>
                                    <p className="text-xl sm:text-2xl mb-0 font-bold text-foreground">{personalInfo.q1}</p>
                            </div>
                          )}
                          {personalInfo.q2 && personalInfo.q2.trim() !== "" && (
                                  <div className="group p-4 bg-card rounded-xl text-center border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Q2</label>
                                    <p className="text-xl sm:text-2xl mb-0 font-bold text-foreground">{personalInfo.q2}</p>
                            </div>
                          )}
                          {personalInfo.q3 && personalInfo.q3.trim() !== "" && (
                                  <div className="group p-4 bg-card rounded-xl text-center border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Q3</label>
                                    <p className="text-xl sm:text-2xl mb-0 font-bold text-foreground">{personalInfo.q3}</p>
                            </div>
                          )}
                          {personalInfo.q4 && personalInfo.q4.trim() !== "" && (
                                  <div className="group p-4 bg-card rounded-xl text-center border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Q4</label>
                                    <p className="text-xl sm:text-2xl mb-0 font-bold text-foreground">{personalInfo.q4}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-5">
                        <p className="text-muted-foreground mb-0">Nenhuma informação disponível</p>
                </div>
              )}
          </div>
        </div>

        {(personalInfo?.goals || personalInfo?.notes) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {personalInfo.goals && (
                      <div className="bg-card rounded-2xl border border-border/50 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative px-6 sm:px-8 py-5 sm:py-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                          <h3 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-3 m-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg">
                              <i className="fas fa-bullseye text-white"></i>
                            </div>
                        <span>Objetivos</span>
                      </h3>
                    </div>
                        <div className="p-6 sm:p-8">
                          <p className="m-0 text-foreground leading-relaxed text-sm sm:text-base">{personalInfo.goals}</p>
                  </div>
                </div>
              )}
              {personalInfo.notes && (
                      <div className="bg-card rounded-2xl border border-border/50 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative px-6 sm:px-8 py-5 sm:py-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                          <h3 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-3 m-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg">
                              <i className="fas fa-clipboard-list text-white"></i>
                            </div>
                        <span>Notas do Personal Trainer</span>
                      </h3>
                    </div>
                        <div className="p-6 sm:p-8">
                          <p className="m-0 text-foreground leading-relaxed text-sm sm:text-base">{personalInfo.notes}</p>
                    </div>
                  </div>
                    )}
                </div>
              )}
          </div>
        )}

            {activeTab === "pesagens" && (
              <div className="space-y-4 sm:space-y-6">
                {pesagens.length > 0 ? (
                  <>
                    <div className="paper-card">
                      <h2 className="paper-title mb-4 flex items-center gap-3">
                        <div className="paper-icon-container primary">
                          <i className="fas fa-weight text-white"></i>
                        </div>
                <span>Pesagens / Weighting Data</span>
              </h2>
          <div className="overflow-x-auto">
                        <table className="paper-table">
                          <thead>
                            <tr>
                              <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-left whitespace-nowrap">Data</th>
                              <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap">Peso (kg)</th>
                              <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap">% MG</th>
                              <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap hidden md:table-cell">MM (kg)</th>
                              <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap hidden lg:table-cell">H20</th>
                              <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap">IMC</th>
                              <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap hidden lg:table-cell">Gordura Visceral</th>
                              <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap hidden xl:table-cell">ID Metabólica</th>
                              <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap hidden xl:table-cell">Massa Óssea (kg)</th>
                              <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap">Resultado IMC</th>
                              <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap hidden md:table-cell">Resultado %MG</th>
                </tr>
              </thead>
              <tbody>
                            {pesagens.map((pesagem, index) => (
                              <tr key={index}>
                                <td style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                  <div className="flex items-center gap-2">
                                    <i className="fas fa-calendar-days" style={{ color: 'var(--primary)', fontSize: '0.75rem' }}></i>
                                    {pesagem.data}
                                  </div>
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 600, fontSize: '1.125rem' }}>{pesagem.peso || "-"}</td>
                                <td style={{ textAlign: 'center' }}>{pesagem.percentualMG || "-"}</td>
                                <td className="hidden md:table-cell" style={{ textAlign: 'center' }}>{pesagem.MM || "-"}</td>
                                <td className="hidden lg:table-cell" style={{ textAlign: 'center' }}>{pesagem.H2O || "-"}</td>
                                <td style={{ textAlign: 'center', fontWeight: 600, fontSize: '1.125rem' }}>{pesagem.IMC || "-"}</td>
                                <td className="hidden lg:table-cell" style={{ textAlign: 'center' }}>{pesagem.gordVisceral || "-"}</td>
                                <td className="hidden xl:table-cell" style={{ textAlign: 'center' }}>{pesagem.IDMetabolica || "-"}</td>
                                <td className="hidden xl:table-cell" style={{ textAlign: 'center' }}>{pesagem.massaOssea || "-"}</td>
                                <td style={{ textAlign: 'center' }}>
                                  <span className={`paper-badge ${
                                    pesagem.resultadoIMC?.toLowerCase().includes('excelente') ? 'success' :
                                    pesagem.resultadoIMC?.toLowerCase().includes('bom') ? 'info' :
                                    pesagem.resultadoIMC?.toLowerCase().includes('médio') || pesagem.resultadoIMC?.toLowerCase().includes('medio') ? 'warning' :
                                    pesagem.resultadoIMC?.toLowerCase().includes('mau') ? 'danger' :
                                    ''
                        }`}>
                          {pesagem.resultadoIMC || "-"}
                        </span>
                      </td>
                                <td className="hidden md:table-cell" style={{ textAlign: 'center' }}>
                                  <span className={`paper-badge ${
                                    pesagem.resultadoPercentualMG?.toLowerCase().includes('excelente') ? 'success' :
                                    pesagem.resultadoPercentualMG?.toLowerCase().includes('bom') ? 'info' :
                                    pesagem.resultadoPercentualMG?.toLowerCase().includes('médio') || pesagem.resultadoPercentualMG?.toLowerCase().includes('medio') ? 'warning' :
                                    pesagem.resultadoPercentualMG?.toLowerCase().includes('mau') ? 'danger' :
                                    ''
                        }`}>
                          {pesagem.resultadoPercentualMG || "-"}
                        </span>
                      </td>
                    </tr>
                            ))}
              </tbody>
            </table>
          </div>
            </div>

                    {/* Charts - Paper Dashboard Pro Style */}
                    <div className="paper-card">
                      <h2 className="paper-title mb-4 flex items-center gap-3">
                        <div className="paper-icon-container primary">
                          <i className="fas fa-chart-line text-white"></i>
                        </div>
                  <span>Gráficos de Pesagens</span>
                </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="paper-chart">
                          <h3 className="paper-title mb-4 flex items-center gap-2">
                            <i className="fas fa-weight" style={{ color: 'var(--primary)' }}></i>
                    Peso (kg)
                  </h3>
                          <div className="h-[280px] sm:h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="data" stroke="var(--muted-foreground)" />
                                <YAxis stroke="var(--muted-foreground)" />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'var(--card)', 
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px'
                                  }}
                                />
                                <Line type="monotone" dataKey="peso" stroke="var(--primary)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                        <div className="paper-chart">
                          <h3 className="paper-title mb-4 flex items-center gap-2">
                            <i className="fas fa-chart-pie" style={{ color: 'var(--primary)' }}></i>
                    Massa Gorda (%)
                  </h3>
                          <div className="h-[280px] sm:h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="data" stroke="var(--muted-foreground)" />
                                <YAxis stroke="var(--muted-foreground)" />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'var(--card)', 
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px'
                                  }}
                                />
                                <Line type="monotone" dataKey="massaGorda" stroke="var(--primary)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                        <div className="paper-chart">
                          <h3 className="paper-title mb-4 flex items-center gap-2">
                            <i className="fas fa-dumbbell" style={{ color: 'var(--primary)' }}></i>
                    Massa Muscular (kg)
                  </h3>
                          <div className="h-[280px] sm:h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="data" stroke="var(--muted-foreground)" />
                                <YAxis stroke="var(--muted-foreground)" />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'var(--card)', 
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px'
                                  }}
                                />
                                <Line type="monotone" dataKey="massaMuscular" stroke="var(--color-secondary)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                        <div className="paper-chart">
                          <h3 className="paper-title mb-4 flex items-center gap-2">
                            <i className="fas fa-heartbeat" style={{ color: 'var(--primary)' }}></i>
                    Gordura Visceral
                  </h3>
                          <div className="h-[280px] sm:h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="data" stroke="var(--muted-foreground)" />
                                <YAxis stroke="var(--muted-foreground)" />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'var(--card)', 
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px'
                                  }}
                                />
                                <Line type="monotone" dataKey="gorduraVisceral" stroke="var(--color-error)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                </div>
              </div>
            </div>
            </div>
                  </>
                ) : (
                  <div className="bg-card rounded-lg border border-border p-12 text-center">
                    <i className="fas fa-weight text-muted-foreground text-4xl mb-4"></i>
                    <p className="text-muted-foreground">Nenhuma pesagem registada</p>
          </div>
                )}
          </div>
        )}

            {activeTab === "perimetros" && (
              <div className="space-y-6">
                {perimetros.length > 0 ? (
                  <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-card">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 m-0">
                        <i className="fas fa-ruler-combined text-primary"></i>
                  <span>Perímetros Corporais / Body Measurements</span>
                </h2>
              </div>
          <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-left whitespace-nowrap">Data</th>
                            <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap hidden md:table-cell">MS Drt</th>
                            <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap hidden lg:table-cell">MS Drt Con</th>
                            <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap hidden md:table-cell">MS Esq</th>
                            <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap hidden lg:table-cell">MS Esq Con</th>
                            <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap">Peito</th>
                            <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap">Cintura</th>
                            <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap hidden md:table-cell">Abdominal</th>
                            <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap hidden lg:table-cell">Anca</th>
                            <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap hidden lg:table-cell">MI Drt</th>
                            <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap hidden lg:table-cell">MI Esq</th>
                </tr>
              </thead>
              <tbody>
                          {perimetros.map((perimetro, index) => (
                            <tr key={index} className="hover:bg-muted transition-colors">
                              <td className="px-4 py-3 border-b border-border text-foreground font-medium whitespace-nowrap">{perimetro.data}</td>
                              <td className="px-4 py-3 border-b border-border text-center text-foreground hidden md:table-cell">{perimetro.msDrt || "-"}</td>
                              <td className="px-4 py-3 border-b border-border text-center text-foreground hidden lg:table-cell">{perimetro.msDrtCon || "-"}</td>
                              <td className="px-4 py-3 border-b border-border text-center text-foreground hidden md:table-cell">{perimetro.msEsq || "-"}</td>
                              <td className="px-4 py-3 border-b border-border text-center text-foreground hidden lg:table-cell">{perimetro.msEsqCon || "-"}</td>
                              <td className="px-4 py-3 border-b border-border text-center font-bold text-foreground">{perimetro.peito || "-"}</td>
                              <td className="px-4 py-3 border-b border-border text-center font-bold text-foreground">{perimetro.cintura || "-"}</td>
                              <td className="px-4 py-3 border-b border-border text-center hidden md:table-cell font-semibold text-foreground">{perimetro.abdominal || "-"}</td>
                              <td className="px-4 py-3 border-b border-border text-center text-foreground hidden lg:table-cell">{perimetro.anca || "-"}</td>
                              <td className="px-4 py-3 border-b border-border text-center text-foreground hidden lg:table-cell">{perimetro.miDrt || "-"}</td>
                              <td className="px-4 py-3 border-b border-border text-center text-foreground hidden lg:table-cell">{perimetro.miEsq || "-"}</td>
                    </tr>
                          ))}
              </tbody>
            </table>
          </div>
            </div>
                ) : (
                  <div className="bg-card rounded-lg border border-border p-12 text-center">
                    <i className="fas fa-ruler-combined text-muted-foreground text-4xl mb-4"></i>
                    <p className="text-muted-foreground">Nenhum perímetro registado</p>
                  </div>
                )}
          </div>
        )}

            {activeTab === "avaliacoes" && (
              <div className="space-y-6">
                {avaliacoes.length > 0 ? (
                  <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-card">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 m-0">
                        <i className="fas fa-dumbbell text-primary"></i>
                  <span>Avaliação Física / Physical Evaluation</span>
                </h2>
              </div>
          <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-left whitespace-nowrap">Data</th>
                            <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap">Flexões 1&apos;</th>
                            <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap">Abdominais 1&apos;</th>
                            <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap hidden md:table-cell">Milha</th>
                            <th className="px-4 py-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b-2 border-border text-center whitespace-nowrap">Resultado Milha</th>
                </tr>
              </thead>
              <tbody>
                          {avaliacoes.map((avaliacao, index) => (
                            <tr key={index} className="hover:bg-muted transition-colors">
                              <td className="px-4 py-4 border-b border-border text-foreground font-semibold whitespace-nowrap">{avaliacao.data}</td>
                              <td className="px-4 py-4 border-b border-border text-center font-bold text-foreground">{avaliacao.flexoes1min || "-"}</td>
                              <td className="px-4 py-4 border-b border-border text-center font-bold text-foreground">{avaliacao.abdominais1min || "-"}</td>
                              <td className="px-4 py-4 border-b border-border text-center hidden md:table-cell font-mono text-foreground">{avaliacao.milha || "-"}</td>
                              <td className="px-4 py-4 border-b border-border text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  avaliacao.resultadoMilha?.toLowerCase().includes('excelente') ? 'bg-color-success text-white' :
                          avaliacao.resultadoMilha?.toLowerCase().includes('bom') ? 'bg-blue-500 text-white' :
                                  avaliacao.resultadoMilha?.toLowerCase().includes('médio') || avaliacao.resultadoMilha?.toLowerCase().includes('medio') ? 'bg-color-warning text-white' :
                                  avaliacao.resultadoMilha?.toLowerCase().includes('mau') ? 'bg-color-error text-white' :
                                  'bg-muted text-muted-foreground'
                        }`}>
                          {avaliacao.resultadoMilha || "-"}
                        </span>
                      </td>
                    </tr>
                          ))}
              </tbody>
            </table>
          </div>
            </div>
                ) : (
                  <div className="bg-card rounded-lg border border-border p-12 text-center">
                    <i className="fas fa-dumbbell text-muted-foreground text-4xl mb-4"></i>
                    <p className="text-muted-foreground">Nenhuma avaliação registada</p>
                  </div>
                )}
          </div>
        )}

            {activeTab === "referencias" && (
              <div className="space-y-6">
                <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-card">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 m-0">
                      <i className="fas fa-clipboard-list text-primary"></i>
                <span>Tabelas de Referência</span>
              </h2>
            </div>
            <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {referenceTables?.massaGordaMasculino && (
                        <div className="bg-muted rounded-lg border border-border overflow-hidden">
                          <div className="px-5 py-4 bg-card border-b border-border">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                              <i className="fas fa-weight text-primary"></i>
                              Massa Gorda | Masculino
                  </h3>
                </div>
                    <div className="p-0">
                  <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                                <thead className="bg-card">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Idade</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Excelente</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Bom</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Médio</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Mau</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                                    <td className="px-3 py-2 text-foreground">20-29</td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.massaGordaMasculino?.['20-29']?.excelente || '--'}</td>
                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.massaGordaMasculino?.['20-29']?.bom || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.massaGordaMasculino?.['20-29']?.medio || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.massaGordaMasculino?.['20-29']?.mau || '--'}</td>
                        </tr>
                        <tr>
                                    <td className="px-3 py-2 text-foreground">30-39</td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.massaGordaMasculino?.['30-39']?.excelente || '--'}</td>
                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.massaGordaMasculino?.['30-39']?.bom || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.massaGordaMasculino?.['30-39']?.medio || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.massaGordaMasculino?.['30-39']?.mau || '--'}</td>
                        </tr>
                      </tbody>
                    </table>
                </div>
              </div>
            </div>
            )}
            {referenceTables?.massaGordaFeminino && (
                        <div className="bg-muted rounded-lg border border-border overflow-hidden">
                          <div className="px-5 py-4 bg-card border-b border-border">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                              <i className="fas fa-weight text-primary"></i>
                              Massa Gorda | Feminino
                  </h3>
                </div>
                  <div className="p-0">
                  <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                                <thead className="bg-card">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Idade</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Excelente</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Bom</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Médio</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Mau</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                                    <td className="px-3 py-2 text-foreground">20-29</td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.massaGordaFeminino?.['20-29']?.excelente || '--'}</td>
                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.massaGordaFeminino?.['20-29']?.bom || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.massaGordaFeminino?.['20-29']?.medio || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.massaGordaFeminino?.['20-29']?.mau || '--'}</td>
                        </tr>
                        <tr>
                                    <td className="px-3 py-2 text-foreground">30-39</td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.massaGordaFeminino?.['30-39']?.excelente || '--'}</td>
                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.massaGordaFeminino?.['30-39']?.bom || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.massaGordaFeminino?.['30-39']?.medio || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.massaGordaFeminino?.['30-39']?.mau || '--'}</td>
                        </tr>
                      </tbody>
                    </table>
                </div>
              </div>
            </div>
            )}
            {referenceTables?.imc && (
                        <div className="bg-muted rounded-lg border border-border overflow-hidden">
                          <div className="px-5 py-4 bg-card border-b border-border">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                              <i className="fas fa-ruler-vertical text-primary"></i>
                              IMC
                  </h3>
                </div>
                  <div className="p-0">
                  <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                                <thead className="bg-card">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Classificação</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">IMC</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                                    <td className="px-3 py-2 text-foreground flex items-center gap-2">
                                      <i className="fas fa-arrow-down text-color-error"></i>
                            <span>Magreza</span>
                          </td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.imc?.magreza || '--'}</td>
                        </tr>
                        <tr>
                                    <td className="px-3 py-2 text-foreground flex items-center gap-2">
                                      <i className="fas fa-check text-color-success"></i>
                            <span>Normal</span>
                          </td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.imc?.normal || '--'}</td>
                        </tr>
                        <tr>
                                    <td className="px-3 py-2 text-foreground flex items-center gap-2">
                                      <i className="fas fa-arrow-up text-color-warning"></i>
                            <span>Sobrepeso</span>
                          </td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.imc?.sobrepeso || '--'}</td>
                        </tr>
                        <tr>
                                    <td className="px-3 py-2 text-foreground flex items-center gap-2">
                                      <i className="fas fa-exclamation-triangle text-color-error"></i>
                            <span>Obesidade</span>
                          </td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.imc?.obesidade || '--'}</td>
                        </tr>
                      </tbody>
                    </table>
                </div>
              </div>
            </div>
            )}
            {referenceTables?.flexoesFeminino && (
                        <div className="bg-muted rounded-lg border border-border overflow-hidden">
                          <div className="px-5 py-4 bg-card border-b border-border">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                              <i className="fas fa-dumbbell text-primary"></i>
                              Flexões 1&apos; | Feminino
                  </h3>
                </div>
                  <div className="p-0">
                  <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                                <thead className="bg-card">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Idade</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Excelente</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Bom</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Médio</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Mau</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                                    <td className="px-3 py-2 text-foreground">20-29</td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.flexoesFeminino?.['20-29']?.excelente || '--'}</td>
                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.flexoesFeminino?.['20-29']?.bom || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.flexoesFeminino?.['20-29']?.medio || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.flexoesFeminino?.['20-29']?.mau || '--'}</td>
                        </tr>
                        <tr>
                                    <td className="px-3 py-2 text-foreground">30-39</td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.flexoesFeminino?.['30-39']?.excelente || '--'}</td>
                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.flexoesFeminino?.['30-39']?.bom || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.flexoesFeminino?.['30-39']?.medio || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.flexoesFeminino?.['30-39']?.mau || '--'}</td>
                        </tr>
                      </tbody>
                    </table>
                </div>
              </div>
            </div>
            )}
            {referenceTables?.flexoesMasculino && (
                        <div className="bg-muted rounded-lg border border-border overflow-hidden">
                          <div className="px-5 py-4 bg-card border-b border-border">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                              <i className="fas fa-dumbbell text-primary"></i>
                              Flexões 1&apos; | Masculino
                  </h3>
                </div>
                  <div className="p-0">
                  <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                                <thead className="bg-card">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Idade</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Excelente</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Bom</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Médio</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Mau</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                                    <td className="px-3 py-2 text-foreground">20-29</td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.flexoesMasculino?.['20-29']?.excelente || '--'}</td>
                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.flexoesMasculino?.['20-29']?.bom || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.flexoesMasculino?.['20-29']?.medio || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.flexoesMasculino?.['20-29']?.mau || '--'}</td>
                        </tr>
                        <tr>
                                    <td className="px-3 py-2 text-foreground">30-39</td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.flexoesMasculino?.['30-39']?.excelente || '--'}</td>
                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.flexoesMasculino?.['30-39']?.bom || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.flexoesMasculino?.['30-39']?.medio || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.flexoesMasculino?.['30-39']?.mau || '--'}</td>
                        </tr>
                      </tbody>
                    </table>
                </div>
              </div>
            </div>
            )}
            {referenceTables?.abdominaisFeminino && (
                        <div className="bg-muted rounded-lg border border-border overflow-hidden">
                          <div className="px-5 py-4 bg-card border-b border-border">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                              <i className="fas fa-fire text-primary"></i>
                              Abdominais 1&apos; | Feminino
                  </h3>
                </div>
                  <div className="p-0">
                  <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                                <thead className="bg-card">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Idade</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Excelente</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Bom</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Médio</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Mau</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                                    <td className="px-3 py-2 text-foreground">20-29</td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.abdominaisFeminino?.['20-29']?.excelente || '--'}</td>
                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.abdominaisFeminino?.['20-29']?.bom || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.abdominaisFeminino?.['20-29']?.medio || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.abdominaisFeminino?.['20-29']?.mau || '--'}</td>
                        </tr>
                        <tr>
                                    <td className="px-3 py-2 text-foreground">30-39</td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.abdominaisFeminino?.['30-39']?.excelente || '--'}</td>
                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.abdominaisFeminino?.['30-39']?.bom || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.abdominaisFeminino?.['30-39']?.medio || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.abdominaisFeminino?.['30-39']?.mau || '--'}</td>
                        </tr>
                      </tbody>
                    </table>
                </div>
              </div>
            </div>
            )}
            {referenceTables?.abdominaisMasculino && (
                        <div className="bg-muted rounded-lg border border-border overflow-hidden">
                          <div className="px-5 py-4 bg-card border-b border-border">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                              <i className="fas fa-fire text-primary"></i>
                              Abdominais 1&apos; | Masculino
                  </h3>
                </div>
                  <div className="p-0">
                  <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                                <thead className="bg-card">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Idade</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Excelente</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Bom</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Médio</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Mau</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                                    <td className="px-3 py-2 text-foreground">20-29</td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.abdominaisMasculino?.['20-29']?.excelente || '--'}</td>
                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.abdominaisMasculino?.['20-29']?.bom || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.abdominaisMasculino?.['20-29']?.medio || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.abdominaisMasculino?.['20-29']?.mau || '--'}</td>
                        </tr>
                        <tr>
                                    <td className="px-3 py-2 text-foreground">30-39</td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.abdominaisMasculino?.['30-39']?.excelente || '--'}</td>
                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.abdominaisMasculino?.['30-39']?.bom || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.abdominaisMasculino?.['30-39']?.medio || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.abdominaisMasculino?.['30-39']?.mau || '--'}</td>
                        </tr>
                      </tbody>
                    </table>
                </div>
              </div>
            </div>
            )}
            {referenceTables?.milhaFeminino && (
                        <div className="bg-muted rounded-lg border border-border overflow-hidden">
                          <div className="px-5 py-4 bg-card border-b border-border">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                              <i className="fas fa-running text-primary"></i>
                              Teste da Milha | Feminino
                  </h3>
                </div>
                  <div className="p-0">
                  <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                                <thead className="bg-card">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Idade</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Excelente</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Bom</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Médio</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Mau</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                                    <td className="px-3 py-2 text-foreground">20-29</td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.milhaFeminino?.['20-29']?.excelente || '--'}</td>
                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.milhaFeminino?.['20-29']?.bom || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.milhaFeminino?.['20-29']?.medio || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.milhaFeminino?.['20-29']?.mau || '--'}</td>
                        </tr>
                        <tr>
                                    <td className="px-3 py-2 text-foreground">30-39</td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.milhaFeminino?.['30-39']?.excelente || '--'}</td>
                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.milhaFeminino?.['30-39']?.bom || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.milhaFeminino?.['30-39']?.medio || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.milhaFeminino?.['30-39']?.mau || '--'}</td>
                        </tr>
                      </tbody>
                    </table>
                </div>
              </div>
            </div>
            )}
            {referenceTables?.milhaMasculino && (
                        <div className="bg-muted rounded-lg border border-border overflow-hidden">
                          <div className="px-5 py-4 bg-card border-b border-border">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                              <i className="fas fa-running text-primary"></i>
                              Teste da Milha | Masculino
                  </h3>
                </div>
                  <div className="p-0">
                  <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                                <thead className="bg-card">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Idade</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Excelente</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Bom</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Médio</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Mau</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                                    <td className="px-3 py-2 text-foreground">20-29</td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.milhaMasculino?.['20-29']?.excelente || '--'}</td>
                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.milhaMasculino?.['20-29']?.bom || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.milhaMasculino?.['20-29']?.medio || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.milhaMasculino?.['20-29']?.mau || '--'}</td>
                        </tr>
                        <tr>
                                    <td className="px-3 py-2 text-foreground">30-39</td>
                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.milhaMasculino?.['30-39']?.excelente || '--'}</td>
                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.milhaMasculino?.['30-39']?.bom || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.milhaMasculino?.['30-39']?.medio || '--'}</td>
                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.milhaMasculino?.['30-39']?.mau || '--'}</td>
                        </tr>
                      </tbody>
                    </table>
                </div>
              </div>
            </div>
            )}
          </div>
          </div>
        </div>
      </div>
            )}

            {/* Back to Home */}
            <div className="text-center mt-8">
          <Link
            href="/"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
            Voltar ao website
          </Link>
        </div>
      </div>
        </main>
      </div>
    </div>
  );
}
