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
import {
  invalidatePesagemUserCache,
  invalidatePerimetroUserCache,
  invalidateAvaliacaoUserCache
} from '@/lib/cache/repositoryCache';
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
  // Build array of parallel invalidation promises
  const invalidationPromises: Promise<void>[] = [];

  // Invalidate specific measurement caches (only if explicitly requested)
  if (cacheTypes.pesagens === true) {
    invalidationPromises.push(
      invalidatePesagensCache(), // Admin-level cache (recent pesagens)
      invalidatePesagemUserCache(userUuid) // User-specific repository cache
    );
  }
  if (cacheTypes.perimetros === true) {
    invalidationPromises.push(
      invalidatePerimetrosCache(), // Admin-level cache
      invalidatePerimetroUserCache(userUuid) // User-specific repository cache
    );
  }
  if (cacheTypes.avaliacoes === true) {
    invalidationPromises.push(
      invalidateAvaliacoesCache(), // Admin-level cache
      invalidateAvaliacaoUserCache(userUuid) // User-specific repository cache
    );
  }

  // Always invalidate admin user detail when any measurement changes
  if (cacheTypes.adminUserDetail !== false) {
    invalidationPromises.push(invalidateAdminUserDetail(userUuid));
  }

  // Always invalidate user's client-side cache when any measurement changes (requires email)
  if (cacheTypes.userData !== false) {
    // Fetch user email first, then add to promises
    const userPromise = db.user.findUnique({
      where: { id: userUuid },
      select: { email: true }
    }).then(user => {
      if (user?.email) {
        return clearUserData(user.email);
      }
    });
    invalidationPromises.push(userPromise);
  }

  // Execute all invalidations in parallel
  await Promise.all(invalidationPromises);
}

/**
 * Batch invalidate caches for multiple users
 * More efficient than calling invalidateUserCaches multiple times
 * @param userIds - Array of user UUIDs
 * @param cacheTypes - Types of caches to invalidate
 */
export async function batchInvalidateUserCaches(
  userIds: string[],
  cacheTypes: {
    pesagens?: boolean;
    perimetros?: boolean;
    avaliacoes?: boolean;
    adminUserDetail?: boolean;
    userData?: boolean;
  }
): Promise<void> {
  if (userIds.length === 0) return;

  // Build array of parallel invalidation promises for all users
  const invalidationPromises: Promise<void>[] = [];

  // Batch invalidate admin-level caches (only once, not per user)
  if (cacheTypes.pesagens === true) {
    invalidationPromises.push(invalidatePesagensCache());
  }
  if (cacheTypes.perimetros === true) {
    invalidationPromises.push(invalidatePerimetrosCache());
  }
  if (cacheTypes.avaliacoes === true) {
    invalidationPromises.push(invalidateAvaliacoesCache());
  }

  // Per-user invalidations
  for (const userUuid of userIds) {
    if (cacheTypes.pesagens === true) {
      invalidationPromises.push(invalidatePesagemUserCache(userUuid));
    }
    if (cacheTypes.perimetros === true) {
      invalidationPromises.push(invalidatePerimetroUserCache(userUuid));
    }
    if (cacheTypes.avaliacoes === true) {
      invalidationPromises.push(invalidateAvaliacaoUserCache(userUuid));
    }
    if (cacheTypes.adminUserDetail !== false) {
      invalidationPromises.push(invalidateAdminUserDetail(userUuid));
    }
  }

  // Batch fetch user emails for userData invalidation
  if (cacheTypes.userData !== false) {
    const userEmails = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true }
    });

    for (const user of userEmails) {
      if (user.email) {
        invalidationPromises.push(clearUserData(user.email));
      }
    }
  }

  // Execute all invalidations in parallel
  await Promise.all(invalidationPromises);
}

