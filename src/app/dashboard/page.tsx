"use client";

import NewButton from "@/app/components/newButton";
import { OverviewTab } from "./components/OverviewTab";
import { useDashboardData } from "./hooks/useDashboardData";

export default function DashboardOverviewPage() {
  const {
    personalInfo,
    chartData,
    stats,
    user,
  } = useDashboardData();

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        {/* Navigation Button */}
        <div className="mb-6 flex flex-wrap gap-4">
          <NewButton
            href="/"
            variant="new_primary_rounded"
            icon={<i className="fa-duotone fa-home-lg" />}
            iconPosition="left"
            className="w-full sm:w-auto min-w-[200px] shadow-md uppercase font-bold"
          >
            Voltar ao Site
          </NewButton>
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
        </div>
      </div>

      {/* Tab Content */}
      <OverviewTab personalInfo={personalInfo} stats={stats} chartData={chartData} />
    </>
  );
}
