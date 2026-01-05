import { useState, useCallback, useEffect } from "react";
import { UserData } from "../types";
import { useAdminUser, useAdminMutations, queryKeys } from "@/lib/react-query/hooks";
import { useQueryClient } from "@tanstack/react-query";

export function useUserEdit(userId: string, initialUser: UserData) {
    const queryClient = useQueryClient();

    // React Query - fetch fresh data, NO initialData to avoid stale cache issues
    const { data, refetch, error: queryError, dataUpdatedAt } = useAdminUser(userId);

    // Local state synced with React Query data
    const [user, setLocalUser] = useState<UserData>(initialUser);

    // Sync local state when React Query data updates
    useEffect(() => {
        if (data) {
            console.log('[useUserEdit] Syncing from React Query data, dataUpdatedAt:', dataUpdatedAt);
            setLocalUser(data as UserData);
        }
    }, [data, dataUpdatedAt]);

    // UI state only
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<React.ReactNode | null>(null);

    // Set user data for form editing
    const setUser = useCallback((newUser: UserData) => {
        setLocalUser(newUser);
        // Also update cache for consistency
        queryClient.setQueryData(queryKeys.adminUser(userId), newUser);
    }, [queryClient, userId]);

    // Force refresh: invalidate cache + wait for DB + refetch
    const forceRefresh = useCallback(async () => {
        console.log('[useUserEdit] forceRefresh called');

        // 1. Invalidate the query to mark it stale
        await queryClient.invalidateQueries({ queryKey: queryKeys.adminUser(userId) });

        // 2. Small delay to ensure DB write is committed
        await new Promise(resolve => setTimeout(resolve, 150));

        // 3. Refetch fresh data - this should trigger useEffect
        const result = await refetch();
        console.log('[useUserEdit] refetch completed, data:', result.data);

        // 4. Manually update local state with new data
        if (result.data) {
            setLocalUser(result.data as UserData);
        }
    }, [queryClient, userId, refetch]);

    // Mutations
    const { updateUser } = useAdminMutations(userId, { showToasts: false });

    const handleSaveUser = useCallback(async () => {
        if (!user) return;
        setError(null);
        setSuccess(null);

        try {
            await updateUser.mutateAsync({ userId, userData: user as any });
            await forceRefresh();
            setSuccess("Utilizador guardado com sucesso!");
        } catch (err: any) {
            setError(err.message);
        }
    }, [user, updateUser, userId, forceRefresh]);

    return {
        user,
        setUser,
        saving: updateUser.isPending,
        setSaving: () => { }, // No-op, managed by mutation isPending
        error: error || (queryError ? queryError.message : null),
        success,
        setError,
        setSuccess,
        fetchUser: forceRefresh,
        handleSaveUser
    };
}
