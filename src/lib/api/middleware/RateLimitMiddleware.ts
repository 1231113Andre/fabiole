import { Middleware } from '../core/types';
import { ApiResponse as ApiResponseBuilder } from '../core/ApiResponse';
import { checkRateLimit, RATE_LIMITS } from '@/lib/security/rateLimit';
import { SettingsService } from "@/lib/api/services/SettingsService";

/**
 * Create rate limit middleware
 * Uses dynamic settings from DB with optional static fallback/override
 */
export function rateLimitMiddleware(staticConfig?: any): Middleware {
  return async (context) => {
    let config;

    if (staticConfig) {
      config = staticConfig;
    } else {
      // Fetch dynamic settings
      const settings = await SettingsService.getSettings();
      config = {
        maxRequests: Number(settings.rateLimitMax),
        windowMs: Number(settings.rateLimitWindow) * 60 * 1000,
        message: String(settings.rateLimitMessage)
      };
    }

    const result = checkRateLimit(context.request, config);

    if (!result.allowed) {
      return ApiResponseBuilder.rateLimit(result.retryAfter);
    }

    return context;
  };
}












