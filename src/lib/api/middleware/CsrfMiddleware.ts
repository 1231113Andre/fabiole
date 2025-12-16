import { Middleware, ApiResponse } from '../core/types';
import { ApiResponse as ApiResponseBuilder } from '../core/ApiResponse';
import { validateCsrfToken, requiresCsrfProtection } from '@/lib/csrf/validate';

/**
 * CSRF protection middleware
 * Only applies to state-changing methods (POST, PUT, PATCH, DELETE)
 */
export const csrfMiddleware: Middleware = async (context) => {
  const method = context.request.method;

  // Skip CSRF check for safe methods
  if (!requiresCsrfProtection(method)) {
    return context;
  }

  const validation = await validateCsrfToken(context.request);

  if (!validation.valid) {
    return ApiResponseBuilder.forbidden(
      `CSRF token validation failed: ${validation.error || 'Unknown error'}`
    );
  }

  return context;
};



