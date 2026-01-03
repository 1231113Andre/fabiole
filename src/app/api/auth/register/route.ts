import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { requestIdMiddleware } from '@/lib/api/middleware/RequestIdMiddleware';
import { timeoutMiddleware } from '@/lib/api/middleware/TimeoutMiddleware';
import { compressionMiddleware } from '@/lib/api/middleware/CompressionMiddleware';
import { rateLimitMiddleware } from '@/lib/api/middleware/RateLimitMiddleware';
import { csrfMiddleware } from '@/lib/api/middleware/CsrfMiddleware';
import { validationMiddleware } from '@/lib/api/middleware/ValidationMiddleware';
import { sanitizationMiddleware } from '@/lib/api/middleware/SanitizationMiddleware';
import { registerSchema } from '@/lib/api/validators/auth.validator';
import { AuthService } from '@/lib/api/services/AuthService';
import { RATE_LIMITS } from '@/lib/security/rateLimit';
import { createOptionsHandler } from '@/lib/api/utils/cors';

const registerHandler = new BaseRouteHandler()
  .use(requestIdMiddleware)
  .use(timeoutMiddleware(30000))
  .use(compressionMiddleware)
  .use(rateLimitMiddleware(RATE_LIMITS.AUTH)) // Strict rate limiting for auth
  .use(csrfMiddleware)
  .use(validationMiddleware(registerSchema))
  .use(sanitizationMiddleware)
  .handle(async (context) => {
    try {
      const userData = context.validatedData as {
        name: string;
        surname: string;
        email: string;
        password: string;
        birth: string;
        gender: 'Masculino' | 'Feminino' | 'Outro';
      };

      const user = await AuthService.register(userData);
      const sessionCookies = await AuthService.createSessionCookie(user);

      const response = ApiResponse.success(
        {
          message: 'User registered successfully',
          user,
        },
        201
      );

      // Add session cookies (auto-login after registration)
      response.cookies = sessionCookies;

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return ApiResponse.conflict('Este email já está registado. Tenta iniciar sessão.');
      }
      throw error; // Re-throw to be handled by BaseRouteHandler
    }
  });

export const POST = registerHandler.toNextHandler();

// Handle CORS preflight requests
export const OPTIONS = createOptionsHandler({
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
});
