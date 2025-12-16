import { Middleware, ApiResponse } from '../core/types';
import { ApiResponse as ApiResponseBuilder } from '../core/ApiResponse';

/**
 * Error handling middleware
 * Catches and formats errors from handlers
 * This is the last middleware in the pipeline
 */
export const errorMiddleware: Middleware = async (context) => {
  // This middleware is applied at the handler level in BaseRouteHandler
  // It's here for consistency and potential future use
  return context;
};

/**
 * Handle errors from handlers
 */
export function handleError(error: unknown, requestId: string): ApiResponse {
  console.error(`[${requestId}] Handler error:`, error);

  const isProduction = process.env.NODE_ENV === 'production';

  if (error instanceof Error) {
    return ApiResponseBuilder.error(
      isProduction ? 'Internal server error' : error.message,
      500,
      isProduction ? undefined : { stack: error.stack }
    );
  }

  return ApiResponseBuilder.error(
    'Internal server error',
    500
  );
}



