import { revalidatePath } from 'next/cache';
import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { requestIdMiddleware } from '@/lib/api/middleware/RequestIdMiddleware';
import { timeoutMiddleware } from '@/lib/api/middleware/TimeoutMiddleware';
import { compressionMiddleware } from '@/lib/api/middleware/CompressionMiddleware';
import { csrfMiddleware } from '@/lib/api/middleware/CsrfMiddleware';
import { validationMiddleware } from '@/lib/api/middleware/ValidationMiddleware';
// import { sanitizationMiddleware } from '@/lib/api/middleware/SanitizationMiddleware'; // Removed - causes jsdom issue on Vercel
import { registerSchema } from '@/lib/api/validators/auth.validator';
import { AuthService } from '@/lib/api/services/AuthService';

const registerHandler = new BaseRouteHandler()
  .use(requestIdMiddleware)
  .use(timeoutMiddleware(30000))
  .use(compressionMiddleware)
  // .use(csrfMiddleware) // Temporarily disabled for debugging 405 on Vercel
  .use(validationMiddleware(registerSchema))
  // .use(sanitizationMiddleware) // Removed - causes jsdom issue on Vercel
  .handle(async (context) => {
    try {
      const userData = context.validatedData as {
        name: string;
        surname: string;
        email: string;
        password: string;
        birth: string;
      };

      const user = await AuthService.register(userData);
      const sessionCookie = await AuthService.createSessionCookie(user);

      const response = ApiResponse.success(
        {
          message: 'User registered successfully',
          user,
        },
        201
      );

      // Add session cookie (auto-login after registration)
      response.cookies = [sessionCookie];

      // Force re-render of SSR components (navbar)
      revalidatePath('/', 'layout');

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return ApiResponse.conflict('User with this email already exists');
      }
      throw error; // Re-throw to be handled by BaseRouteHandler
    }
  });

export const POST = registerHandler.toNextHandler();

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
