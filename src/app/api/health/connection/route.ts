import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { requestIdMiddleware } from '@/lib/api/middleware/RequestIdMiddleware';
import { timeoutMiddleware } from '@/lib/api/middleware/TimeoutMiddleware';
import { compressionMiddleware } from '@/lib/api/middleware/CompressionMiddleware';
import { authMiddleware } from '@/lib/api/middleware/AuthMiddleware';
import { HealthService } from '@/lib/api/services/HealthService';

/**
 * Health check endpoint for Google Sheets connection
 * Protected: Requires authentication to prevent unauthorized access
 */
const healthCheckHandler = new BaseRouteHandler()
  .use(requestIdMiddleware)
  .use(timeoutMiddleware(10000)) // 10 seconds for health check
  .use(compressionMiddleware)
  .use(authMiddleware({ required: true }))
  .handle(async (context) => {
    const result = await HealthService.testConnection();

    if (result.success) {
      return ApiResponse.success(result, 200);
    } else {
      return ApiResponse.error(
        result.message || 'Connection test failed',
        500,
        result.error
      );
    }
  });

export const GET = healthCheckHandler.toNextHandler();

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
