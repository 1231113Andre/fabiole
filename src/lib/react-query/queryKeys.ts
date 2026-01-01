/**
 * Centralized Query Keys Factory
 * 
 * Type-safe query key generation for all React Query hooks.
 * Single source of truth for query keys makes refactoring safe and predictable.
 * 
 * Usage:
 * - queryKeys.session -> ['session']
 * - queryKeys.adminUser('123') -> ['adminUser', '123']
 */

export const queryKeys = {
    // Authentication
    session: ['session'] as const,

    // User data (client-side dashboard)
    userData: (userId: string, variant: string = 'default') =>
        ['userData', userId, variant] as const,

    // Admin panel
    adminUsers: ['adminUsers'] as const,
    adminUser: (userId: string) => ['adminUser', userId] as const,
} as const;

// Type exports for consumers that need query key types
export type QueryKeys = typeof queryKeys;
export type SessionKey = typeof queryKeys.session;
export type UserDataKey = ReturnType<typeof queryKeys.userData>;
export type AdminUsersKey = typeof queryKeys.adminUsers;
export type AdminUserKey = ReturnType<typeof queryKeys.adminUser>;
