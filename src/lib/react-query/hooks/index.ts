/**
 * React Query Hooks - Barrel Export
 * 
 * Central export point for all React Query hooks.
 * Import from here to ensure consistent usage across the codebase.
 * 
 * @example
 * ```tsx
 * import { useSession, useAdminUser, useAdminMutations } from '@/lib/react-query/hooks';
 * ```
 */

// Query Keys
export { queryKeys } from '../queryKeys';
export type {
    QueryKeys,
    SessionKey,
    UserDataKey,
    AdminUsersKey,
    AdminUserKey
} from '../queryKeys';

// API Client
export { apiGet, apiPost, apiPut, apiDelete, apiMutate, ApiError } from '../apiClient';

// Authentication Hooks
export { useSession, useLogin, useRegister, useLogout } from './useAuth';

// CSRF Token
export { useCsrfToken, getCsrfToken, waitForCsrfToken, fetchCsrfToken } from './useCsrfToken';

// User Data (Client Dashboard)
export { useUserData, useRefreshData } from './useUserData';

// Admin Hooks
export { useAdminUsers, useInvalidateAdminUsers } from './useAdminUsers';
export { useAdminUser } from './useAdminUser';
export type { AdminUserData } from './useAdminUser';
export { useAdminMutations } from './useAdminMutations';
