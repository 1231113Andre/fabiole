import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { requestIdMiddleware } from '@/lib/api/middleware/RequestIdMiddleware';
import { timeoutMiddleware } from '@/lib/api/middleware/TimeoutMiddleware';
import { compressionMiddleware } from '@/lib/api/middleware/CompressionMiddleware';
import { csrfMiddleware } from '@/lib/api/middleware/CsrfMiddleware';
import { validationMiddleware } from '@/lib/api/middleware/ValidationMiddleware';
import { sanitizationMiddleware } from '@/lib/api/middleware/SanitizationMiddleware';
import { loginSchema } from '@/lib/api/validators/auth.validator';
import { AuthService } from '@/lib/api/services/AuthService';
import {
  checkAccountLockout,
  recordFailedAttempt,
  clearFailedAttempts,
  getClientIp,
} from '@/lib/security/accountLockout';

const loginHandler = new BaseRouteHandler()
  .use(requestIdMiddleware)
  .use(timeoutMiddleware(30000))
  .use(compressionMiddleware)
  .use(csrfMiddleware)
  .use(validationMiddleware(loginSchema))
  .use(sanitizationMiddleware)
  .handle(async (context) => {
    try {
      const { email, password } = context.validatedData as { email: string; password: string };
      const ip = getClientIp(context.request);

      // Check if account is locked
      const lockoutCheck = checkAccountLockout(email, ip);
      if (lockoutCheck.isLocked) {
        return ApiResponse.unauthorized(
          `Account temporarily locked due to too many failed login attempts. Please try again in ${lockoutCheck.remainingSeconds} seconds.`
        );
      }

      try {
        const user = await AuthService.login(email, password);

        // Clear failed attempts on successful login
        clearFailedAttempts(email, ip);

        const sessionCookie = await AuthService.createSessionCookie(user);

        const response = ApiResponse.success(
          {
            message: 'Login successful',
            user,
          },
          200
        );

        // Add session cookie
        response.cookies = [sessionCookie];

        return response;
      } catch (loginError) {
        // Record failed attempt
        const lockoutResult = recordFailedAttempt(email, ip);

        if (lockoutResult.isLocked) {
          return ApiResponse.unauthorized(
            `Too many failed login attempts. Account locked for ${lockoutResult.remainingSeconds} seconds.`
          );
        }

        // Return generic error to prevent user enumeration
        return ApiResponse.unauthorized('Invalid email or password');
      }
    } catch (error) {
      throw error; // Re-throw to be handled by BaseRouteHandler
    }
  });

export const POST = loginHandler.toNextHandler();

// Handle CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
      'Access-Control-Max-Age': '86400',
    },
  });
}
