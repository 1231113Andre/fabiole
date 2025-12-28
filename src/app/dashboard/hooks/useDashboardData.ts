"use client";

import { useMemo } from "react";
import { useSession } from "@/lib/react-query/hooks/useAuth";
import { useUserData } from "@/lib/react-query/hooks/useUserData";
import {
    Pesagem,
    PerimetroCorporal,
    AvaliacaoFisica,
    ReferenceTables,
    ChartData,
    DashboardStats,
    PersonalInfo,
} from "../types";
import { UserSheetData } from "@/lib/types/dashboard";
import { transformDashboardData } from "../lib/transformers";

interface TransformedData {
    personalInfo: PersonalInfo | null;
    pesagens: Pesagem[];
    perimetros: PerimetroCorporal[];
    avaliacoes: AvaliacaoFisica[];
    referenceTables: ReferenceTables;
    chartData: ChartData[];
    stats: DashboardStats;
}

interface UseDashboardDataResult extends TransformedData {
    isLoading: boolean;
    isRefreshing: boolean;
    error: Error | null;
    user: { name: string; surname: string; email: string; birth: string; avatarUrl?: string } | undefined;
    isAuthenticated: boolean;
    refetch: () => Promise<unknown>;
}



/**
 * Custom hook for dashboard data transformation and management
 */
export function useDashboardData(initialData?: UserSheetData): UseDashboardDataResult {
    const { data: sessionData, isLoading: isSessionLoading } = useSession();
    const {
        data: userData,
        isLoading: isUserDataLoading,
        isFetching,
        error,
        refetch
    } = useUserData(false, initialData);

    const user = sessionData?.user;
    const isAuthenticated = Boolean(sessionData?.authenticated && user);

    const transformedData = useMemo(() => {
        // Use shared transformer
        return transformDashboardData(userData);
    }, [userData]);

    return {
        ...transformedData, // ...
        isLoading: isSessionLoading || isUserDataLoading,
        isRefreshing: isFetching,
        error: error as Error | null,
        user,
        isAuthenticated,
        refetch,
    };
}
