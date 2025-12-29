import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserData } from "../types";

interface SaveRecordParams {
    endpoint: string;
    payload: any;
    editingId?: number;
}

interface BulkSaveParams {
    endpoint: string;
    records: any[];
}

interface DeleteRecordParams {
    endpoint: string;
    id: number;
}

export function useRecordMutations(userId: string) {
    const queryClient = useQueryClient();
    const queryKey = ["adminUser", userId];

    // Helper to update local cache list
    const updateListInCache = (oldData: UserData | undefined, endpoint: string, record: any, isDelete: boolean = false) => {
        if (!oldData) return oldData;

        const listKey = endpoint as keyof Pick<UserData, 'pesagens' | 'perimetros' | 'avaliacoes'>;
        if (!oldData[listKey]) return oldData;

        let newList: any[] = [...(oldData[listKey] as any[])];

        if (isDelete) {
            newList = newList.filter(item => item.id !== record.id);
        } else {
            const index = newList.findIndex(item => item.id === record.id);
            if (index >= 0) {
                newList[index] = record;
            } else {
                // Add new record at start
                newList = [record, ...newList];
            }
        }

        return {
            ...oldData,
            [listKey]: newList
        };
    };

    const saveRecordMutation = useMutation({
        mutationFn: async ({ endpoint, payload, editingId }: SaveRecordParams) => {
            const url = editingId
                ? `/api/admin/${endpoint}/${editingId}`
                : `/api/admin/users/${userId}/${endpoint}`;

            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || "Erro ao guardar registo");
            }

            return response.json();
        },
        onMutate: async ({ endpoint, payload, editingId }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot previous value
            const previousUser = queryClient.getQueryData<UserData>(queryKey);

            // Optimistically update
            if (previousUser) {
                // For optimistic update of NEW records, we need a temp ID. 
                // However, without a real ID, key-based rendering might flake if relying on ID.
                // Assuming we can handle it or just wait for success for NEW records if complex.
                // For EDITs, it's easy.
                if (editingId) {
                    queryClient.setQueryData<UserData>(queryKey, (old) =>
                        updateListInCache(old, endpoint, { ...payload, id: editingId }) as UserData
                    );
                }
                // For NEW records, we generally wait for the server response ID, 
                // UNLESS we generate a temp ID. Let's stick to invalidation for NEW for safety,
                // or appending with temp ID if UI handles it.
                // "Senior" approach: If UX demands instant, use temp ID. If safety first, wait.
                // Given the prompt "High speed", let's attempt optimisitc add if possible, but
                // since we don't know the ID the server assigns, it complicates delete/edit immediately after.
                // Let's stick to standard invalidation for ADDs, but optimistic for EDITS.
            }

            return { previousUser };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousUser) {
                queryClient.setQueryData(queryKey, context.previousUser);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    });

    const bulkSaveMutation = useMutation({
        mutationFn: async ({ endpoint, records }: BulkSaveParams) => {
            const response = await fetch(`/api/admin/users/${userId}/${endpoint}/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(records)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || "Erro ao guardar registos");
            }

            return response.json();
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    });

    const deleteRecordMutation = useMutation({
        mutationFn: async ({ endpoint, id }: DeleteRecordParams) => {
            const response = await fetch(`/api/admin/${endpoint}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                if (errData.code !== 'P2025') {
                    throw new Error(errData.error || "Erro ao eliminar");
                }
            }
            return { id };
        },
        onMutate: async ({ endpoint, id }) => {
            await queryClient.cancelQueries({ queryKey });
            const previousUser = queryClient.getQueryData<UserData>(queryKey);

            if (previousUser) {
                queryClient.setQueryData<UserData>(queryKey, (old) =>
                    updateListInCache(old, endpoint, { id }, true) as UserData
                );
            }

            return { previousUser };
        },
        onError: (err, variables, context) => {
            if (context?.previousUser) {
                queryClient.setQueryData(queryKey, context.previousUser);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    });

    const updateUserMutation = useMutation({
        mutationFn: async (userData: UserData) => {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error("Erro ao guardar utilizador");
            }
            // Logic to refetch happens in onSettled
        },
        onMutate: async (userData) => {
            await queryClient.cancelQueries({ queryKey });
            const previousUser = queryClient.getQueryData<UserData>(queryKey);

            if (previousUser) {
                queryClient.setQueryData<UserData>(queryKey, { ...previousUser, ...userData });
            }

            return { previousUser };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousUser) {
                queryClient.setQueryData(queryKey, context.previousUser);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    });

    return {
        saveRecordMutation,
        bulkSaveMutation,
        deleteRecordMutation,
        updateUserMutation
    };
}
