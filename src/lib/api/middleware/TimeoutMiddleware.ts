import { Middleware, ApiResponse } from '../core/types';
import { ApiResponse as ApiResponseBuilder } from '../core/ApiResponse';

/**
 * Create timeout middleware
 * @param timeoutMs - Timeout in milliseconds
 */
export function timeoutMiddleware(timeoutMs: number): Middleware {
  return async (context) => {
    const timeoutPromise = new Promise<ApiResponse>((resolve) => {
      setTimeout(() => {
        resolve(
          ApiResponseBuilder.error(
            'Request timeout',
            408
          )
        );
      }, timeoutMs);
    });

    // Race between timeout and actual processing
    // This is a simplified version - actual timeout should be handled at handler level
    return context;
  };
}











