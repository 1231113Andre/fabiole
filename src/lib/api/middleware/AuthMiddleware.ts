import { Middleware, ApiResponse } from '../core/types';
import { ApiResponse as ApiResponseBuilder } from '../core/ApiResponse';
import { setUser } from '../core/RouteContext';
import { validateAuth } from '@/lib/auth/validate';

export interface AuthMiddlewareOptions {
  /** Whether authentication is required */
  required?: boolean;
}

/**
 * Create authentication middleware
 * @param options - Middleware options
 */
export function authMiddleware(
  options: AuthMiddlewareOptions = { required: false }
): Middleware {
  return async (context) => {
    const authResult = await validateAuth(context.request);

    if (options.required && !authResult.authenticated) {
      return ApiResponseBuilder.unauthorized(
        authResult.error || 'Authentication required'
      );
    }

    // If authenticated, add user to context
    if (authResult.authenticated && authResult.user) {
      return setUser(context, authResult.user);
    }

    return context;
  };
}




