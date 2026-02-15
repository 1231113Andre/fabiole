"use client";

import dynamic from "next/dynamic";
import { UserSheetData } from "@/lib/types/dashboard";
import { useDashboardData } from "../hooks/useDashboardData";

import { OverviewTab } from "./OverviewTab";

interface DashboardClientProps {
    initialData: UserSheetData | null;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
    const { personalInfo, stats, chartData } = useDashboardData(initialData || undefined);

    return (
        <OverviewTab
            personalInfo={personalInfo}
            stats={stats}
            chartData={chartData}
        />
    );
}
