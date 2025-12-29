import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserData } from "../types";

export function useUserEdit(userId: string, initialUser: UserData) {
    const router = useRouter();
    const [user, setUser] = useState<UserData>(initialUser);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [success, setSuccess] = useState<React.ReactNode | null>(null);

    const fetchUser = useCallback(async () => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`);
            if (response.status === 403) {
                router.push("/admin/dashboard");
                return;
            }
            if (!response.ok) throw new Error("Erro ao carregar utilizador");
            const data = await response.json();
            setUser(data);
        } catch (err: any) {
            setError(err.message);
        }
    }, [userId, router]);

    const handleSaveUser = useCallback(async () => {
        if (!user) return;
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            if (!response.ok) throw new Error("Erro ao guardar");
            setSuccess("Utilizador guardado com sucesso!");
            await fetchUser();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [user, userId, fetchUser]);

    return {
        user,
        setUser,
        saving,
        setSaving,
        error,
        success,
        setError,
        setSuccess,
        fetchUser,
        handleSaveUser
    };
}

