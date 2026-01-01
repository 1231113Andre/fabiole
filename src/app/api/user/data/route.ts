import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { requestIdMiddleware } from '@/lib/api/middleware/RequestIdMiddleware';
import { timeoutMiddleware } from '@/lib/api/middleware/TimeoutMiddleware';
import { compressionMiddleware } from '@/lib/api/middleware/CompressionMiddleware';
import { authMiddleware } from '@/lib/api/middleware/AuthMiddleware';
import { UserService } from '@/lib/api/services/UserService';
import { Logger } from '@/lib/utils/logger';

// No static caching - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getUserDataHandler = new BaseRouteHandler()
  .use(requestIdMiddleware)
  .use(timeoutMiddleware(60000)) // 60 seconds for data fetching
  .use(compressionMiddleware)
  .use(authMiddleware({ required: true }))
  .handle(async (context) => {
    if (!context.user) {
      return ApiResponse.unauthorized('Authentication required');
    }

    try {
      const { searchParams } = new URL(context.request.url);
      const forceRefresh = searchParams.get('refresh') === 'true';

      Logger.info('UserData API', `Incoming request: Commencing data retrieval process for user profile: ${context.user.email}.`);

      // forceRefresh is handled by UserService.getUserData
      // Cache invalidation for route handlers is handled via forceRefresh parameter
      const data = await UserService.getUserData(context.user.email, {
        forceRefresh,
      });

      Logger.success('UserData API', `Request completed: Comprehensive profile data successfully compiled for ${context.user.email}.`);

      // Use private cache with short TTL for client-side caching
      // Server-side cache is handled by UserService
      return ApiResponse.custom(
        200,
        data,
        {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
          'Content-Type': 'application/json',
        }
      );
    } catch (error) {
      Logger.error('UserData API', `Request failed: Critical error encountered during data assembly for ${context.user.email}.`, error);

      if (error instanceof Error) {
        if (error.message.includes('USER_NOT_MIGRATED')) {
          Logger.info('UserData API', `Flow Control: User ${context.user.email} is flagged for mandatory Google Sheets to PostgreSQL migration.`);
          return ApiResponse.custom(
            503,
            {
              success: false,
              error: 'User data migration required',
              message: 'Your account exists in Google Sheets but needs to be migrated to the database. Please contact support or wait for automatic migration.',
              requiresMigration: true
            },
            {
              'Content-Type': 'application/json',
            }
          );
        }

        if (error.message === 'User sheet not found' || error.message.includes('not found')) {
          Logger.info('UserData API', `Lookup Refused: No database record or legacy spreadsheet found for candidate: ${context.user.email}.`);
          return ApiResponse.notFound('User not found in database. Please ensure your account has been migrated.');
        }
      }

      throw error; // Re-throw to be handled by BaseRouteHandler
    }
  });

export const GET = getUserDataHandler.toNextHandler();

// Handle CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
      'Access-Control-Max-Age': '86400',
    },
  });
}
