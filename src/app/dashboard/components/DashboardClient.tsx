"use client";

import { UserSheetData } from "@/lib/types/dashboard";
import { useDashboardData } from "../hooks/useDashboardData";
import { OverviewTab } from "./OverviewTab";

interface DashboardClientProps {
    initialData: UserSheetData | null;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
    // Initialize hook with server data
    // This ensures instant render with data, and subsequent updates via React Query
    const { personalInfo, stats, chartData } = useDashboardData(initialData || undefined);

    return (
        <OverviewTab
            personalInfo={personalInfo}
            stats={stats}
            chartData={chartData}
        />
    );
}
