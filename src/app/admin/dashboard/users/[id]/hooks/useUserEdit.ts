import { useState, useEffect, useCallback } from "react";
import { UserData } from "../types";
import { useAdminUser, useAdminMutations } from "@/lib/react-query/hooks";

export function useUserEdit(userId: string, initialUser: UserData) {
    // 1. Fetch data with React Query (automatic caching & background updates)
    const { data, refetch, error: queryError } = useAdminUser(userId, initialUser as any);

    // 2. Local state for form editing
    const [user, setUser] = useState<UserData>(initialUser);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<React.ReactNode | null>(null);

    // 3. Sync local state when server data updates (e.g. background refetch)
    // Only if we are not "dirty"? For admin dash, usually we want fresh data.
    // Ideally we'd separate View vs Edit modes, but for now strict sync is safer.
    useEffect(() => {
        if (data) {
            setUser(data as UserData);
        }
    }, [data]);

    // 4. Mutations
    const { updateUser } = useAdminMutations(userId, { showToasts: false });

    const handleSaveUser = useCallback(async () => {
        if (!user) return;
        setError(null);
        setSuccess(null);

        try {
            await updateUser.mutateAsync({ userId, userData: user as any });
            setSuccess("Utilizador guardado com sucesso!");
        } catch (err: any) {
            setError(err.message);
        }
    }, [user, updateUser, userId]);

    return {
        user: user || data || initialUser, // Fallback chain
        setUser,
        saving: updateUser.isPending,
        setSaving: () => { }, // No-op, managed by mutation isPending
        error: error || (queryError ? queryError.message : null),
        success,
        setError,
        setSuccess,
        fetchUser: async () => { await refetch(); },
        handleSaveUser
    };
}

