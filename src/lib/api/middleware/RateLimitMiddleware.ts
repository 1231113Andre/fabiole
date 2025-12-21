import { Middleware, ApiResponse } from '../core/types';
import { ApiResponse as ApiResponseBuilder } from '../core/ApiResponse';
import { checkRateLimit, RATE_LIMITS, RateLimitConfig } from '@/lib/security/rateLimit';

/**
 * Create rate limit middleware
 * @param config - Rate limit configuration (defaults to API limits)
 */
export function rateLimitMiddleware(
  config: RateLimitConfig = RATE_LIMITS.API
): Middleware {
  return async (context) => {
    const result = checkRateLimit(context.request, config);
    
    if (!result.allowed) {
      return ApiResponseBuilder.rateLimit(result.retryAfter);
    }

    return context;
  };
}











