"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { queryKeys } from "../queryKeys";
import { apiPost, apiPut, apiDelete, ApiError } from "../apiClient";
import type { AdminUserData } from "./useAdminUser";

// ============================================================================
// TYPES
// ============================================================================

interface SaveRecordParams {
    userId: string;
    endpoint: 'pesagens' | 'perimetros' | 'avaliacoes';
    payload: Record<string, unknown>;
    editingId?: number;
}

interface BulkSaveParams {
    userId: string;
    endpoint: 'pesagens' | 'perimetros' | 'avaliacoes';
    records: Record<string, unknown>[];
}

interface DeleteRecordParams {
    userId: string;
    endpoint: 'pesagens' | 'perimetros' | 'avaliacoes';
    id: number;
}

interface UpdateUserParams {
    userId: string;
    userData: Partial<AdminUserData>;
}

interface SaveRecordResponse {
    id: number;
    [key: string]: unknown;
}

interface BulkSaveResponse {
    created: number;
    updated: number;
}

interface MutationContext {
    previousUser?: AdminUserData;
}

// ============================================================================
// CACHE HELPERS
// ============================================================================

/**
 * Helper to update local cache list optimistically
 */
function updateListInCache(
    oldData: AdminUserData | undefined,
    endpoint: 'pesagens' | 'perimetros' | 'avaliacoes',
    record: { id: number;[key: string]: unknown },
    isDelete: boolean = false
): AdminUserData | undefined {
    if (!oldData) return oldData;

    const list = oldData[endpoint] as Array<{ id: number;[key: string]: unknown }>;
    if (!list) return oldData;

    let newList: Array<{ id: number;[key: string]: unknown }>;

    if (isDelete) {
        newList = list.filter((item) => item.id !== record.id);
    } else {
        const index = list.findIndex((item) => item.id === record.id);
        if (index >= 0) {
            newList = [...list];
            newList[index] = { ...newList[index], ...record };
        } else {
            // Add new record at start
            newList = [record, ...list];
        }
    }

    return {
        ...oldData,
        [endpoint]: newList
    } as AdminUserData;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Consolidated admin mutations hook
 * 
 * Provides all mutation operations for admin user management:
 * - saveRecord: Create or update a single record
 * - bulkSave: Create multiple records at once
 * - deleteRecord: Delete a single record
 * - updateUser: Update user profile data
 * 
 * All mutations automatically invalidate the adminUser query on success.
 * 
 * @param userId - The user ID for cache invalidation
 * @param options - Optional configuration
 * @returns Object containing all mutation functions
 * 
 * @example
 * ```tsx
 * const { saveRecord, bulkSave, deleteRecord } = useAdminMutations(userId);
 * 
 * // Save a single record
 * saveRecord.mutate({ userId, endpoint: 'pesagens', payload: { peso: 75 } });
 * 
 * // Bulk save
 * bulkSave.mutate({ userId, endpoint: 'pesagens', records: [...] });
 * ```
 */
export function useAdminMutations(userId: string, options?: {
    /** Navigate to user page after bulk save */
    navigateOnBulkSave?: boolean;
    /** Show toast notifications */
    showToasts?: boolean;
}) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const queryKey = queryKeys.adminUser(userId);

    const { navigateOnBulkSave = false, showToasts = true } = options || {};

    // ========================================================================
    // Save Single Record
    // ========================================================================
    const saveRecord = useMutation<SaveRecordResponse, ApiError, SaveRecordParams, MutationContext>({
        mutationFn: async ({ userId: uid, endpoint, payload, editingId }) => {
            const url = editingId
                ? `/api/admin/${endpoint}/${editingId}`
                : `/api/admin/users/${uid}/${endpoint}`;

            return editingId
                ? apiPut<SaveRecordResponse>(url, payload)
                : apiPost<SaveRecordResponse>(url, payload);
        },
        onMutate: async ({ endpoint, payload, editingId }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot previous value
            const previousUser = queryClient.getQueryData<AdminUserData>(queryKey);

            // Optimistic update for edits only (new records need server ID)
            if (previousUser && editingId) {
                queryClient.setQueryData<AdminUserData>(queryKey, (old) =>
                    updateListInCache(old, endpoint, { ...payload, id: editingId } as { id: number }) as AdminUserData
                );
            }

            return { previousUser };
        },
        onError: (err, _vars, context) => {
            // Rollback on error
            if (context?.previousUser) {
                queryClient.setQueryData(queryKey, context.previousUser);
            }
            if (showToasts) {
                toast.error(err.message || "Erro ao guardar registo");
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    });

    // ========================================================================
    // Bulk Save Records
    // ========================================================================
    const bulkSave = useMutation<BulkSaveResponse, ApiError, BulkSaveParams>({
        mutationFn: async ({ userId: uid, endpoint, records }) => {
            return apiPost<BulkSaveResponse>(
                `/api/admin/users/${uid}/${endpoint}/bulk`,
                records
            );
        },
        onSuccess: (_, { userId: uid }) => {
            if (showToasts) {
                toast.success("Registos guardados com sucesso!");
            }
            // Invalidate user query to refetch fresh data
            queryClient.invalidateQueries({ queryKey: queryKeys.adminUser(uid) });

            if (navigateOnBulkSave) {
                router.push(`/admin/dashboard/users/${uid}`);
            }
        },
        onError: (error) => {
            console.error(error);
            if (showToasts) {
                toast.error(error.message || "Erro ao guardar registos.");
            }
        }
    });

    // ========================================================================
    // Delete Record
    // ========================================================================
    const deleteRecord = useMutation<{ id: number }, ApiError, DeleteRecordParams, MutationContext>({
        mutationFn: async ({ endpoint, id }) => {
            await apiDelete(`/api/admin/${endpoint}/${id}`);
            return { id };
        },
        onMutate: async ({ endpoint, id }) => {
            await queryClient.cancelQueries({ queryKey });
            const previousUser = queryClient.getQueryData<AdminUserData>(queryKey);

            // Optimistic delete
            if (previousUser) {
                queryClient.setQueryData<AdminUserData>(queryKey, (old) =>
                    updateListInCache(old, endpoint, { id }, true) as AdminUserData
                );
            }

            return { previousUser };
        },
        onError: (err, _vars, context) => {
            // Rollback on error
            if (context?.previousUser) {
                queryClient.setQueryData(queryKey, context.previousUser);
            }
            if (showToasts) {
                toast.error(err.message || "Erro ao eliminar");
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    });

    // ========================================================================
    // Update User Profile
    // ========================================================================
    const updateUser = useMutation<void, ApiError, UpdateUserParams, MutationContext>({
        mutationFn: async ({ userId: uid, userData }) => {
            await apiPut(`/api/admin/users/${uid}`, userData);
        },
        onMutate: async ({ userData }) => {
            await queryClient.cancelQueries({ queryKey });
            const previousUser = queryClient.getQueryData<AdminUserData>(queryKey);

            // Optimistic update
            if (previousUser) {
                queryClient.setQueryData<AdminUserData>(queryKey, {
                    ...previousUser,
                    ...userData
                } as AdminUserData);
            }

            return { previousUser };
        },
        onError: (err, _vars, context) => {
            // Rollback on error
            if (context?.previousUser) {
                queryClient.setQueryData(queryKey, context.previousUser);
            }
            if (showToasts) {
                toast.error(err.message || "Erro ao guardar utilizador");
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    });

    return {
        saveRecord,
        bulkSave,
        deleteRecord,
        updateUser,
    };
}
