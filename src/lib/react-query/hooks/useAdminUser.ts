"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { apiGet, ApiError } from "../apiClient";

/**
 * User data interface for admin user view
 * This is the complete user data including all measurements
 */
export interface AdminUserData {
    id: string;
    name: string;
    surname: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    phone: string;
    birth: string;
    role: string;
    gender: string;
    trainingCredit: number;
    trainingsScheduled: number;
    debtValue: number;
    paid: boolean;
    notes: string;
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    goals: string;
    avatarUrl: string | null;
    status: string;
    statusChangedBy: string | null;
    statusChangedAt: string | null;
    statusReason: string | null;
    pesagens: Array<{
        id: number;
        date: string;
        peso: number | null;
        percentualMG: number | null;
        mm: number | null;
        h2o: number | null;
        imc: number | null;
        gordVisceral: number | null;
        idMetabolica: number | null;
        massaOssea: number | null;
        height: number | null;
        resultadoIMC: string | null;
        resultadoPercentMG: string | null;
        notas: string | null;
    }>;
    perimetros: Array<{
        id: number;
        date: string;
        msRight: number | null;
        msRightFlex: number | null;
        msLeft: number | null;
        msLeftFlex: number | null;
        chest: number | null;
        waist: number | null;
        abdomen: number | null;
        hips: number | null;
        thighR: number | null;
        thighL: number | null;
    }>;
    avaliacoes: Array<{
        id: number;
        date: string;
        pushUps: number | null;
        sitUps: number | null;
        mile: string | null;
        mileResult: string | null;
        pushUpsResult: string | null;
        notes: string | null;
    }>;
}

/**
 * Hook to fetch a single admin user with all their measurements
 * 
 * @param userId - The user ID to fetch
 * @param initialData - Optional initial data for SSR hydration
 * @returns Query result with user data
 * 
 * @example
 * ```tsx
 * const { data: user, isLoading, error } = useAdminUser(userId, serverData);
 * ```
 */
export function useAdminUser(userId: string, initialData?: AdminUserData) {
    return useQuery<AdminUserData, ApiError>({
        queryKey: queryKeys.adminUser(userId),
        queryFn: () => apiGet<AdminUserData>(`/api/admin/users/${userId}?_t=${Date.now()}`, { cache: 'no-store' }),
        initialData,
        staleTime: 30 * 1000, // 30 seconds - reduced for faster updates
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnMount: true, // Always refetch when component mounts
        retry: (failureCount, error) => {
            // Don't retry on 403 (access denied) or 404 (not found)
            if (error.status === 403 || error.status === 404) {
                return false;
            }
            return failureCount < 2;
        },
    });
}
