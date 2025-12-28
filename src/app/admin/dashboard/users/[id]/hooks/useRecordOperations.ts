import { useState, useCallback } from "react";
import { UserData } from "../types";

interface UseRecordOperationsProps {
    userId: string;
    fetchUser: () => Promise<void>;
    setSuccess: (message: string | null) => void;
    setError: (message: string | null) => void;
    setSaving: (saving: boolean) => void;
}

export function useRecordOperations({ userId, fetchUser, setSuccess, setError, setSaving }: UseRecordOperationsProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSaveRecord = useCallback(async (endpoint: string, e: React.FormEvent<HTMLFormElement>, editingId?: number) => {
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Simple numeric conversion for all fields that look like numbers
        const payload: any = { ...data };
        Object.keys(payload).forEach(key => {
            if (key !== 'date' && key !== 'notas' && key !== 'notes' && key !== 'mile' && key !== 'mileResult' && payload[key]) {
                const val = parseFloat(payload[key].toString());
                if (!isNaN(val)) payload[key] = val;
            }
        });

        const url = editingId
            ? `/api/admin/${endpoint}/${editingId}`
            : `/api/admin/users/${userId}/${endpoint}`;

        const method = editingId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || "Erro ao guardar registo");
            }

            await fetchUser();

            // Show success message
            const endpointNames: Record<string, string> = {
                pesagens: 'Pesagem',
                perimetros: 'Perímetro',
                avaliacoes: 'Avaliação'
            };
            const name = endpointNames[endpoint] || 'Registo';
            setSuccess(editingId ? `${name} atualizado com sucesso` : `${name} adicionado com sucesso`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message);
        }
    }, [userId, fetchUser, setSuccess, setError]);

    const handleBulkSave = useCallback(async (endpoint: string, data: any[]) => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Process sequentially to be safe
            for (const record of data) {
                const payload: any = { ...record };
                // Remove temp id
                if (typeof payload.id === 'string') delete payload.id;

                Object.keys(payload).forEach(key => {
                    if (key !== 'date' && key !== 'notas' && key !== 'notes' && key !== 'mile' && key !== 'mileResult' && payload[key]) {
                        const val = parseFloat(payload[key].toString());
                        if (!isNaN(val)) payload[key] = val;
                    }
                });

                const response = await fetch(`/api/admin/users/${userId}/${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error || "Erro ao guardar um dos registos");
                }
            }

            await fetchUser();
            setSuccess(`${data.length} registos adicionados com sucesso!`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [userId, fetchUser, setSuccess, setError, setSaving]);

    const executeDelete = useCallback(async (endpoint: string, id: number) => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/${endpoint}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                // Ignore P2025 (Record to delete does not exist) - treat as success
                if (errData.code !== 'P2025') {
                    throw new Error(errData.error || "Erro ao eliminar");
                }
            }

            await fetchUser();
            setSuccess("Registo eliminado com sucesso");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError("Erro: " + err.message);
        } finally {
            setIsDeleting(false);
        }
    }, [fetchUser, setSuccess, setError]);

    return {
        isDeleting,
        handleSaveRecord,
        handleBulkSave,
        executeDelete
    };
}

