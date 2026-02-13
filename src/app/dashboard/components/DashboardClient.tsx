"use client";

import dynamic from "next/dynamic";
import { UserSheetData } from "@/lib/types/dashboard";
import { useDashboardData } from "../hooks/useDashboardData";

const OverviewTab = dynamic(
    () => import("./OverviewTab").then((m) => ({ default: m.OverviewTab })),
    {
        loading: () => (
            <div className="w-full min-w-0 animate-pulse space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 rounded-xl bg-gray-100" />
                    ))}
                </div>
                <div className="h-64 rounded-xl bg-gray-100" />
            </div>
        ),
        ssr: false,
    }
);

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
