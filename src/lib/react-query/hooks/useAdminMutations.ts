"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationContext";
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

interface UpdateStatusParams {
    userId: string;
    status: string;
    sendNotification: boolean;
    reason?: string;
}

interface SaveRecordResponse {
    id: number;
    [key: string]: unknown;
}

interface BulkSaveResponse {
    success: boolean;
    count: number;
    message?: string;
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
    const { notify } = useNotification();
    const queryKey = queryKeys.adminUser(userId);

    const { navigateOnBulkSave = false, showToasts = true } = options || {};

    // ========================================================================
    // Save Single Record
    // ========================================================================
    const saveRecord = useMutation<SaveRecordResponse, ApiError, SaveRecordParams>({
        mutationFn: async ({ userId: uid, endpoint, payload, editingId }) => {
            const url = editingId
                ? `/api/admin/${endpoint}/${editingId}`
                : `/api/admin/users/${uid}/${endpoint}`;

            return editingId
                ? apiPut<SaveRecordResponse>(url, payload)
                : apiPost<SaveRecordResponse>(url, payload);
        },
        // NOTE: No cache manipulation here!
        // The caller handles refetch after save to avoid race conditions.
        onError: (err) => {
            if (showToasts) {
                notify(err.message || "Erro ao guardar registo.", 'error');
            }
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
                notify("Registos guardados com sucesso!", 'success');
            }
            // Invalidate both user and users list to ensure all views are updated
            queryClient.invalidateQueries({ queryKey: queryKeys.adminUser(uid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });

            if (navigateOnBulkSave) {
                router.push(`/admin/dashboard/users/${uid}`);
            }
        },
        onError: (error) => {
            console.error(error);
            if (showToasts) {
                notify(error.message || "Erro ao guardar registos.", 'error');
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
                notify(err.message || "Erro ao eliminar.", 'error');
            }
        },
        onSettled: () => {
            // Invalidate both to ensure consistency (same as saveRecord)
            queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
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
        onSuccess: (_, { userData }) => {
            // Immediately update cache with new user data
            queryClient.setQueryData<AdminUserData>(queryKey, (old) => {
                if (!old) return old;
                return { ...old, ...userData } as AdminUserData;
            });
        },
        onError: (err, _vars, context) => {
            // Rollback on error
            if (context?.previousUser) {
                queryClient.setQueryData(queryKey, context.previousUser);
            }
            if (showToasts) {
                notify(err.message || "Erro ao guardar utilizador.", 'error');
            }
        },
        onSettled: () => {
            // Invalidate both adminUsers list AND this specific user's cache
            // This ensures consistency between list view and detail view
            queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
            queryClient.invalidateQueries({ queryKey });
        }
    });

    // ========================================================================
    // Update User Status
    // ========================================================================
    const updateStatus = useMutation<void, ApiError, UpdateStatusParams, MutationContext>({
        mutationFn: async ({ userId: uid, status, sendNotification, reason }) => {
            await apiPut(`/api/admin/users/${uid}/status`, { status, sendNotification, reason });
        },
        onMutate: async ({ userId: uid, status, reason }) => {
            const userKey = queryKeys.adminUser(uid);
            await queryClient.cancelQueries({ queryKey: userKey });
            const previousUser = queryClient.getQueryData<AdminUserData>(userKey);

            // Optimistic update
            if (previousUser) {
                queryClient.setQueryData<AdminUserData>(userKey, {
                    ...previousUser,
                    status: status,
                    statusChangedAt: new Date().toISOString(),
                    statusReason: reason || null
                } as AdminUserData);
            }

            return { previousUser };
        },
        onError: (err, _vars, context) => {
            // Rollback on error
            if (context?.previousUser) {
                queryClient.setQueryData(queryKeys.adminUser(_vars.userId), context.previousUser);
            }
            if (showToasts) {
                notify(err.message || "Erro ao atualizar status.", 'error');
            }
        },
        onSettled: async (_, __, { userId: uid }) => {
            // Wait a bit for DB/Cache propagation
            await new Promise(resolve => setTimeout(resolve, 150));
            // Invalidate adminUsers list and user detail
            queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
            queryClient.invalidateQueries({ queryKey: queryKeys.adminUser(uid) });
        }
    });

    return {
        saveRecord,
        bulkSave,
        deleteRecord,
        updateUser,
        updateStatus,
    };
}
