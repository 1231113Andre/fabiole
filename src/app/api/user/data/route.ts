import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { requestIdMiddleware } from '@/lib/api/middleware/RequestIdMiddleware';
import { timeoutMiddleware } from '@/lib/api/middleware/TimeoutMiddleware';
import { compressionMiddleware } from '@/lib/api/middleware/CompressionMiddleware';
import { authMiddleware } from '@/lib/api/middleware/AuthMiddleware';
import { UserService } from '@/lib/api/services/UserService';

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
      // Check if refresh is requested (query parameter ?refresh=true)
      const { searchParams } = new URL(context.request.url);
      const forceRefresh = searchParams.get('refresh') === 'true';

      const data = await UserService.getUserData(context.user.email, {
        forceRefresh,
      });

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
      if (error instanceof Error && error.message === 'User sheet not found') {
        return ApiResponse.notFound('User sheet not found');
      }
      throw error; // Re-throw to be handled by BaseRouteHandler
    }
  });

export const GET = getUserDataHandler.toNextHandler();
