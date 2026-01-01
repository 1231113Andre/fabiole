"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { apiGet, ApiError } from "../apiClient";
import type { AdminDashboardData } from "@/lib/api/services/AdminService";

/**
 * Hook to fetch admin users list with React Query caching
 * Provides instant navigation with stale-while-revalidate pattern
 * 
 * @param initialData - Optional SSR data to hydrate the cache (prevents flash)
 */
export function useAdminUsers(initialData?: AdminDashboardData) {
    return useQuery<AdminDashboardData, ApiError>({
        queryKey: queryKeys.adminUsers,
        queryFn: () => apiGet<AdminDashboardData>("/api/admin/stats"),
        staleTime: 30 * 1000, // 30 seconds - data considered fresh
        gcTime: 5 * 60 * 1000, // 5 minutes cache retention
        refetchOnWindowFocus: true,
        refetchOnMount: initialData ? false : true, // Skip initial fetch if we have SSR data
        initialData: initialData, // Pre-populate cache with SSR data
        initialDataUpdatedAt: initialData ? Date.now() : undefined, // Mark SSR data as fresh
        retry: 1,
    });
}

/**
 * Hook to invalidate and refetch admin users data
 */
export function useInvalidateAdminUsers() {
    const queryClient = useQueryClient();

    return {
        invalidate: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers }),
        prefetch: () => queryClient.prefetchQuery({
            queryKey: queryKeys.adminUsers,
            queryFn: () => apiGet<AdminDashboardData>("/api/admin/stats"),
        }),
    };
}
