"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminUser } from "@/app/admin/types";

interface AdminStats {
    users: AdminUser[];
    stats: {
        totalUsers: number;
        activeUsers: number;
        paidUsers: number;
        pendingUsers: number;
    };
    recentActivity: any[];
}

/**
 * Hook to fetch admin users list with React Query caching
 * Provides instant navigation with stale-while-revalidate pattern
 */
export function useAdminUsers() {
    return useQuery<AdminStats, Error>({
        queryKey: ["adminUsers"],
        queryFn: async () => {
            const response = await fetch("/api/admin/stats");

            if (response.status === 403) {
                throw new Error("ACCESS_DENIED");
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || "Erro ao carregar dados");
            }

            return response.json();
        },
        staleTime: 30 * 1000, // 30 seconds - data considered fresh
        gcTime: 5 * 60 * 1000, // 5 minutes cache retention
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        placeholderData: (previousData) => previousData, // Keep showing old data while refetching
        retry: 1,
    });
}

/**
 * Hook to invalidate and refetch admin users data
 */
export function useInvalidateAdminUsers() {
    const queryClient = useQueryClient();

    return {
        invalidate: () => queryClient.invalidateQueries({ queryKey: ["adminUsers"] }),
        prefetch: () => queryClient.prefetchQuery({
            queryKey: ["adminUsers"],
            queryFn: async () => {
                const response = await fetch("/api/admin/stats");
                if (!response.ok) throw new Error("Prefetch failed");
                return response.json();
            },
        }),
    };
}
