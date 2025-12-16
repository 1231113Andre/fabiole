"use client";

import { useQuery } from "@tanstack/react-query";
import type { UserSheetData } from "@/lib/googleSheets/types";

/**
 * Query hook to fetch user data from Google Sheets
 * Optimized for performance with smart caching and refresh strategy
 * 
 * Strategy:
 * - staleTime: 2 minutes (data considered fresh for 2 minutes)
 * - refetchOnMount: true (always check for updates when component mounts - F5 refresh)
 * - refetchOnWindowFocus: true (refresh when user returns to tab)
 * - refetchInterval: 5 minutes (background refresh every 5 minutes)
 * - Uses stale-while-revalidate pattern for instant responses
 * 
 * @param forceRefresh - If true, forces a refresh by adding ?refresh=true to the URL
 */
export function useUserData(forceRefresh: boolean = false) {
  return useQuery<UserSheetData, Error>({
    queryKey: ["userData", forceRefresh ? Date.now() : "default"], // Include timestamp when forceRefresh to invalidate cache
    queryFn: async () => {
      // Add refresh parameter and timestamp if forceRefresh to bypass all caches
      // Otherwise rely on server-side stale-while-revalidate cache
      const url = forceRefresh
        ? `/api/user/data?refresh=true&t=${Date.now()}`
        : `/api/user/data`;

      const response = await fetch(url, {
        cache: "no-store", // Always bypass browser cache
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao carregar dados do utilizador");
      }

      return response.json();
    },
    staleTime: forceRefresh ? 0 : 2 * 60 * 1000, // If forceRefresh, data is immediately stale; otherwise 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes (formerly cacheTime)
    refetchOnMount: true, // Always check for updates when component mounts (F5 refresh)
    refetchOnWindowFocus: true, // Refetch when user returns to the tab
    refetchInterval: forceRefresh ? false : 5 * 60 * 1000, // Background refetch every 5 minutes (disabled if forceRefresh)
    retry: 2, // Retry failed requests up to 2 times
    placeholderData: (previousData) => previousData, // Keep previous data while fetching (prevents flickering)
    enabled: true,
  });
}
