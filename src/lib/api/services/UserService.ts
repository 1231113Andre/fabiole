import { getUserSheetData, clearUserCache, getReferenceTableData } from '@/lib/googleSheets';
import {
  getUserData as getCachedUserData,
  setUserData as setCachedUserData,
  clearUserData as clearCachedUserData,
  getReferenceTables as getCachedReferenceTables,
  setReferenceTables as setCachedReferenceTables,
} from '@/lib/cache/userCache';
import { deduplicateRequest } from '@/lib/cache/requestDeduplication';

export interface GetUserDataOptions {
  /** Force refresh (bypass cache) */
  forceRefresh?: boolean;
}

/**
 * User service
 * Handles user data operations with caching and request deduplication
 */
export class UserService {
  /**
   * Get user sheet data with caching and request deduplication
   */
  static async getUserData(email: string, options: GetUserDataOptions = {}) {
    const { forceRefresh = false } = options;

    // If force refresh, clear cache
    if (forceRefresh) {
      clearUserCache(email);
      clearCachedUserData(email);
      console.log(`🔄 [UserService] Force refresh requested for: ${email}`);
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = getCachedUserData(email);
      if (cached) {
        // Return cached data, but refresh in background (stale-while-revalidate)
        // Fire and forget - don't await to avoid blocking response
        this.refreshUserDataInBackground(email).catch(() => {
          // Silently fail - we already have cached data
        });
        return cached;
      }
    }

    // Use request deduplication to prevent duplicate API calls
    const cacheKey = `user:data:${email.toLowerCase()}`;
    return deduplicateRequest(cacheKey, async () => {
      // Fetch sheet data and reference tables in parallel for better performance
      const [sheetData, referenceTables] = await Promise.all([
        getUserSheetData(email, !forceRefresh),
        (async () => {
          // Get reference tables (from cache or fetch)
          let tables = getCachedReferenceTables();
          if (!tables) {
            tables = await getReferenceTableData(!forceRefresh);
            if (tables) {
              setCachedReferenceTables(tables);
            }
          }
          return tables;
        })(),
      ]);

      if (!sheetData) {
        throw new Error('User sheet not found');
      }

      const result = {
        ...sheetData,
        referenceTables: referenceTables || {},
      };

      // Cache the result
      setCachedUserData(email, result);

      return result;
    });
  }

  /**
   * Refresh user data in background (for stale-while-revalidate)
   * Only refreshes sheet data, reference tables are refreshed separately with longer TTL
   */
  private static async refreshUserDataInBackground(email: string): Promise<void> {
    try {
      // Only refresh sheet data - reference tables have longer TTL and don't need frequent refresh
      const sheetData = await getUserSheetData(email, true);
      
      if (sheetData) {
        // Get existing reference tables from cache (don't fetch again)
        const referenceTables = getCachedReferenceTables() || {};
        
        const result = {
          ...sheetData,
          referenceTables,
        };
        setCachedUserData(email, result);
        // Removed console.log from hot path for better performance
      }
    } catch (error) {
      // Silently fail - we already have cached data
      // Removed console.error from hot path
    }
  }
}





