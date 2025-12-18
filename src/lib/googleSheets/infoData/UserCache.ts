import { apiCache, CacheKeys } from '../cache';
import { InfoDataRow } from '@/types/user';

/**
 * Encapsulates caching strategies for User Data.
 * Provides typed methods for accessing and mutating the cache.
 */
export class UserCache {
    private static readonly TTL_USERS = 2 * 60 * 1000; // 2 minutes
    private static readonly TTL_EMPTY = 30 * 1000;     // 30 seconds
    private static readonly TTL_HEADERS = 60 * 60 * 1000; // 1 hour

    /**
     * Retrieves all users from cache.
     */
    static getUsers(): InfoDataRow[] | null {
        const key = CacheKeys.infoDataUsers();
        return apiCache.get<InfoDataRow[]>(key);
    }

    /**
     * Caches the list of users.
     * Adjusts TTL based on whether the list is empty (shorter TTL for empty results).
     */
    static setUsers(users: InfoDataRow[]): void {
        const key = CacheKeys.infoDataUsers();
        const ttl = users.length === 0 ? this.TTL_EMPTY : this.TTL_USERS;
        apiCache.set(key, users, ttl);
    }

    /**
     * Invalidates the users list cache.
     */
    static invalidateUsers(): void {
        const key = CacheKeys.infoDataUsers();
        apiCache.delete(key);
    }

    /**
     * Checks if user existence is cached.
     */
    static getUserExistence(email: string): boolean | null {
        const key = CacheKeys.userExists(email);
        return apiCache.get<boolean>(key);
    }

    /**
     * Caches user existence result.
     */
    static setUserExistence(email: string, exists: boolean): void {
        const key = CacheKeys.userExists(email);
        apiCache.set(key, exists, 30 * 1000); // 30s TTL
    }

    /**
     * Invalidates user existence cache for a specific email.
     */
    static invalidateUserExistence(email: string): void {
        const key = CacheKeys.userExists(email);
        apiCache.delete(key);
    }

    /**
     * Checks if headers initialization is cached.
     */
    static isInitialized(): boolean {
        const key = CacheKeys.infoDataInitialized();
        return !!apiCache.get<boolean>(key);
    }

    /**
     * Helper to perform global invalidation for infoData.
     */
    static invalidateAll(): void {
        // Reuse existing utility if needed, or manually delete known keys
        this.invalidateUsers();
        // Cannot easily iterate specific email keys without wildcard support in simple map, 
        // but typically only the main list is critical to clear.
        // 'clearInfoDataCache' from parent module does this.
    }

    static setInitialized(): void {
        const key = CacheKeys.infoDataInitialized();
        apiCache.set(key, true, this.TTL_HEADERS);
    }
}
