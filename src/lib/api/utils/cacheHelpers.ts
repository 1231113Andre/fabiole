/**
 * @fileoverview Cache invalidation helpers
 * @description Shared utilities for invalidating caches after data mutations
 */

import { db } from '@/lib/db/client';
import { 
  invalidatePesagensCache, 
  invalidatePerimetrosCache, 
  invalidateAvaliacoesCache,
  invalidateAdminUserDetail 
} from '@/lib/cache/adminCache';
import { clearUserData } from '@/lib/cache/userCache';

/**
 * Invalidate all caches related to a user after data mutation
 * @param userUuid - User UUID
 * @param cacheTypes - Types of caches to invalidate (only specified types will be invalidated)
 */
export async function invalidateUserCaches(
  userUuid: string,
  cacheTypes: {
    pesagens?: boolean;
    perimetros?: boolean;
    avaliacoes?: boolean;
    adminUserDetail?: boolean;
    userData?: boolean;
  }
): Promise<void> {
  // Invalidate specific measurement caches (only if explicitly requested)
  if (cacheTypes.pesagens === true) {
    invalidatePesagensCache();
  }
  if (cacheTypes.perimetros === true) {
    invalidatePerimetrosCache();
  }
  if (cacheTypes.avaliacoes === true) {
    invalidateAvaliacoesCache();
  }
  
  // Always invalidate admin user detail when any measurement changes
  if (cacheTypes.adminUserDetail !== false) {
    invalidateAdminUserDetail(userUuid);
  }

  // Always invalidate user's client-side cache when any measurement changes (requires email)
  if (cacheTypes.userData !== false) {
    const user = await db.user.findUnique({
      where: { id: userUuid },
      select: { email: true }
    });
    if (user?.email) {
      clearUserData(user.email);
    }
  }
}

