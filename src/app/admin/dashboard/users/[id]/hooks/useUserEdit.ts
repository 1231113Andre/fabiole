import { useState, useEffect, useCallback } from "react";
import { UserData } from "../types";
import { useAdminUser } from "./useAdminUser";
import { useRecordMutations } from "./useRecordMutations";

export function useUserEdit(userId: string, initialUser: UserData) {
    // 1. Fetch data with React Query (automatic caching & background updates)
    const { data, refetch, error: queryError } = useAdminUser(userId, initialUser);

    // 2. Local state for form editing
    const [user, setUser] = useState<UserData>(initialUser);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<React.ReactNode | null>(null);

    // 3. Sync local state when server data updates (e.g. background refetch)
    // Only if we are not "dirty"? For admin dash, usually we want fresh data.
    // Ideally we'd separate View vs Edit modes, but for now strict sync is safer.
    useEffect(() => {
        if (data) {
            setUser(data);
        }
    }, [data]);

    // 4. Mutations
    const { updateUserMutation } = useRecordMutations(userId);

    const handleSaveUser = useCallback(async () => {
        if (!user) return;
        setError(null);
        setSuccess(null);

        try {
            await updateUserMutation.mutateAsync(user);
            setSuccess("Utilizador guardado com sucesso!");
        } catch (err: any) {
            setError(err.message);
        }
    }, [user, updateUserMutation]);

    return {
        user: user || data || initialUser, // Fallback chain
        setUser,
        saving: updateUserMutation.isPending,
        setSaving: () => { }, // No-op, managed by mutation isPending
        error: error || (queryError ? queryError.message : null),
        success,
        setError,
        setSuccess,
        fetchUser: async () => { await refetch(); },
        handleSaveUser
    };
}

