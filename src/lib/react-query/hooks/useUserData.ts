"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback, useRef } from "react";
import type { UserSheetData } from "@/lib/types/dashboard";
import { useSession } from "./useAuth";
import { queryKeys } from "../queryKeys";

// Polling intervals (in milliseconds)
const ACTIVE_INTERVAL = 15 * 1000;    // 15 seconds when tab is active
const BACKGROUND_INTERVAL = 5 * 60 * 1000; // 5 minutes when tab is in background
const VISIBILITY_DEBOUNCE = 1000;      // Debounce visibility changes

/**
 * Hook to detect document visibility
 * Returns true when tab is visible/active
 */
function useDocumentVisibility() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    // Set initial state
    setIsVisible(document.visibilityState === "visible");

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

/**
 * Query hook to fetch user data from Google Sheets
 * Optimized for performance with smart caching and refresh strategy
 * 
 * Strategy:
 * - Smart polling: 30s when tab is active, 5min when in background
 * - Immediate refetch when tab becomes visible after being hidden
 * - staleTime: 30 seconds (data considered fresh for 30s)
 * - refetchOnWindowFocus: true (refresh when user returns to tab)
 * - Uses stale-while-revalidate pattern for instant responses
 * 
 * @param forceRefresh - If true, forces a refresh by adding ?refresh=true to the URL
 */
export function useUserData(forceRefresh: boolean = false, initialData?: UserSheetData) {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSession();
  const isVisible = useDocumentVisibility();
  const wasHiddenRef = useRef(false);
  const lastRefetchTimeRef = useRef(Date.now());

  const userId = sessionData?.user?.email || 'guest';

  // Track when tab becomes hidden
  useEffect(() => {
    if (!isVisible) {
      wasHiddenRef.current = true;
    }
  }, [isVisible]);

  // Immediate refetch when tab becomes visible after being hidden
  useEffect(() => {
    if (isVisible && wasHiddenRef.current) {
      const timeSinceLastRefetch = Date.now() - lastRefetchTimeRef.current;

      // Only refetch if it's been more than debounce time since last refetch
      if (timeSinceLastRefetch > VISIBILITY_DEBOUNCE) {
        // Invalidate all userData queries (prefix matching)
        queryClient.invalidateQueries({ queryKey: ["userData"] });
        lastRefetchTimeRef.current = Date.now();
      }
      wasHiddenRef.current = false;
    }
  }, [isVisible, queryClient]);

  // Calculate refetch interval based on visibility
  const refetchInterval = forceRefresh
    ? false
    : (isVisible ? ACTIVE_INTERVAL : BACKGROUND_INTERVAL);

  return useQuery<UserSheetData, Error>({
    queryKey: queryKeys.userData(userId, forceRefresh ? Date.now().toString() : "default"),
    queryFn: async () => {
      // Update last refetch time
      lastRefetchTimeRef.current = Date.now();

      // Add refresh parameter and timestamp if forceRefresh to bypass all caches
      const url = forceRefresh
        ? `/api/user/data?refresh=true&t=${Date.now()}`
        : `/api/user/data`;

      const response = await fetch(url, {
        cache: "no-store",
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
    initialData: initialData, // Hydrate with server data
    staleTime: 30 * 1000, // 30s – reduce refetches when switching tabs; refetchOnWindowFocus still refreshes when stale
    gcTime: 10 * 60 * 1000, // 10 minutes cache retention
    refetchOnMount: false, // Don't refetch immediately if we have initialData
    refetchOnWindowFocus: true,
    refetchInterval,
    retry: 2,
    placeholderData: (previousData) => previousData,
    enabled: true,
  });
}

/**
 * Hook to manually trigger a data refresh with cooldown
 * Returns refetch function and cooldown state
 */
export function useRefreshData() {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  const COOLDOWN_DURATION = 30000; // 30 seconds cooldown
  const STORAGE_KEY = 'lastRefreshTime';

  // Initialize cooldown from localStorage on mount
  useEffect(() => {
    const savedTime = localStorage.getItem(STORAGE_KEY);
    if (savedTime) {
      const elapsed = Date.now() - parseInt(savedTime, 10);
      const remaining = COOLDOWN_DURATION - elapsed;
      if (remaining > 0) {
        setCooldownRemaining(remaining);
        // Start countdown timer
        cooldownRef.current = setInterval(() => {
          setCooldownRemaining((prev) => {
            if (prev <= 100) {
              if (cooldownRef.current) {
                clearInterval(cooldownRef.current);
              }
              return 0;
            }
            return prev - 100;
          });
        }, 100);
      }
    }
  }, []);

  // Cleanup cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
      }
    };
  }, []);

  const refresh = useCallback(async () => {
    if (cooldownRemaining > 0 || isRefreshing) {
      return { success: false, reason: "cooldown", remainingSeconds: Math.ceil(cooldownRemaining / 1000) };
    }

    setIsRefreshing(true);
    const startTime = Date.now();
    const MIN_SPINNER_TIME = 800; // Minimum time to show spinner (ms)

    try {
      // Force refresh by manually fetching with refresh=true
      // We do this manually to bypass the query cache logic completely for this specific request
      // invalidateQueries isn't enough because the queryFn defaults forceRefresh to false
      const refreshUrl = `/api/user/data?refresh=true&t=${Date.now()}`;
      const response = await fetch(refreshUrl, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh data');
      }

      const newData = await response.json();

      // Update the cache directly with the new data
      const userId = sessionData?.user?.email || 'guest';
      queryClient.setQueryData(queryKeys.userData(userId, "default"), newData);

      // Also invalidate to ensure related queries like "userData", <timestamp> are also refreshed if needed
      // Using prefix matching to invalidate all userData queries
      await queryClient.invalidateQueries({ queryKey: ["userData"] });

      // Start cooldown and save to localStorage
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
      setCooldownRemaining(COOLDOWN_DURATION);
      cooldownRef.current = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 100) {
            if (cooldownRef.current) {
              clearInterval(cooldownRef.current);
            }
            return 0;
          }
          return prev - 100;
        });
      }, 100);

      // Ensure spinner shows for minimum time (300ms for snappy feel)
      const elapsed = Date.now() - startTime;
      const SNAP_SPINNER_TIME = 300;
      if (elapsed < SNAP_SPINNER_TIME) {
        await new Promise(resolve => setTimeout(resolve, SNAP_SPINNER_TIME - elapsed));
      }

      return { success: true };
    } catch (error) {
      console.error("Refresh failed:", error);
      return { success: false, reason: "error", error };
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, cooldownRemaining, isRefreshing, sessionData]);

  return {
    refresh,
    isRefreshing,
    cooldownRemaining,
    cooldownProgress: cooldownRemaining / COOLDOWN_DURATION,
  };
}
