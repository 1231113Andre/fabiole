import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { requestIdMiddleware } from '@/lib/api/middleware/RequestIdMiddleware';
import { timeoutMiddleware } from '@/lib/api/middleware/TimeoutMiddleware';
import { compressionMiddleware } from '@/lib/api/middleware/CompressionMiddleware';
import { rateLimitMiddleware } from '@/lib/api/middleware/RateLimitMiddleware';
import { validationMiddleware } from '@/lib/api/middleware/ValidationMiddleware';
import { sanitizationMiddleware } from '@/lib/api/middleware/SanitizationMiddleware';
import { loginSchema } from '@/lib/api/validators/auth.validator';
import { AuthService } from '@/lib/api/services/AuthService';
import { RATE_LIMITS } from '@/lib/security/rateLimit';
import {
  checkAccountLockout,
  recordFailedAttempt,
  clearFailedAttempts,
  getClientIp,
  checkIpRateLimit,
  recordIpAttempt,
  formatLockoutDuration,
} from '@/lib/security/accountLockout';
import { createOptionsHandler } from '@/lib/api/utils/cors';

// Login handler - CSRF not required as this is anonymous endpoint
// Protected by: rate limiting, IP rate limiting, account lockout, password hashing
const loginHandler = new BaseRouteHandler()
  .use(requestIdMiddleware)
  .use(timeoutMiddleware(30000))
  .use(compressionMiddleware)
  .use(rateLimitMiddleware(RATE_LIMITS.AUTH)) // Strict rate limiting for auth
  .use(validationMiddleware(loginSchema))
  .use(sanitizationMiddleware)
  .handle(async (context) => {
    try {
      const { email, password, rememberMe } = context.validatedData as { email: string; password: string; rememberMe?: boolean };
      const ip = getClientIp(context.request);

      // Check IP-level rate limit first (protects against distributed attacks)
      if (ip) {
        const ipCheck = await checkIpRateLimit(ip);
        if (ipCheck.isBlocked) {
          return ApiResponse.error(
            'Demasiadas tentativas de login deste endereço IP. Tente novamente mais tarde.',
            429,
            { retryAfterSeconds: 900 }
          );
        }
      }

      // Check if account is locked
      const lockoutCheck = await checkAccountLockout(email, ip);
      if (lockoutCheck.isLocked) {
        const remainingMinutes = Math.ceil((lockoutCheck.remainingSeconds || 0) / 60);
        return ApiResponse.error(
          `Conta temporariamente bloqueada. Tente novamente em ${remainingMinutes} minuto${remainingMinutes === 1 ? '' : 's'}.`,
          401,
          { lockoutSeconds: lockoutCheck.remainingSeconds }
        );
      }

      try {
        const user = await AuthService.login(email, password);

        // Clear failed attempts on successful login
        await clearFailedAttempts(email, ip);

        // Get user agent for session tracking
        const userAgent = context.request.headers.get('user-agent') || undefined;

        // Create session with client info for Redis tracking
        const sessionCookies = await AuthService.createSessionCookie(user, userAgent, ip, rememberMe);

        const response = ApiResponse.success(
          {
            message: 'Login successful',
            user,
          },
          200
        );

        // Add session cookies
        response.cookies = sessionCookies;

        return response;
      } catch (loginError) {
        // Check for account status errors first
        if (loginError instanceof Error) {
          if (loginError.message.startsWith('ACCOUNT_SUSPENDED')) {
            const parts = loginError.message.split('|');
            // Fallback for types or legacy
            const adminEmail = parts.length > 1 ? parts[1] : (loginError.message.split(':')[1] || 'administrator');
            const dateStr = parts[2];

            let dateMsg = '';
            if (dateStr) {
              try {
                const date = new Date(dateStr);
                const formatted = date.toLocaleString('pt-PT', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                  timeZone: 'Europe/Lisbon' // FabioLe implies PT context
                });
                dateMsg = ` dia ${formatted}`; // "dnia ... CET" -> "dia ..."? User text was Polish in request "dnia", but asked for "Wszystko ma byc po portugalsku".
                // PT: "dia DD.MM.YYYY HH:mm"
              } catch (e) { }
            }

            return ApiResponse.error(
              `A sua conta foi suspensa pelo administrador ${adminEmail}${dateMsg}.`,
              403,
              { reason: 'ACCOUNT_SUSPENDED' }
            );
          }
          if (loginError.message.startsWith('ACCOUNT_BANNED')) {
            const parts = loginError.message.split('|');
            const adminEmail = parts.length > 1 ? parts[1] : (loginError.message.split(':')[1] || 'administrator');
            const dateStr = parts[2];
            const reason = parts[3];

            let dateMsg = '';
            if (dateStr) {
              try {
                const date = new Date(dateStr);
                const formatted = date.toLocaleString('pt-PT', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                  timeZone: 'Europe/Lisbon'
                });
                dateMsg = ` dia ${formatted}`;
              } catch (e) { }
            }

            let msg = `A sua conta foi banida pelo administrador ${adminEmail}${dateMsg}.`;
            if (reason) {
              msg += `\nMotivo do bloqueio: ${reason}`;
            }

            return ApiResponse.error(
              msg,
              403,
              { reason: 'ACCOUNT_BANNED' }
            );
          }
        }

        // Record failed attempt (both account-level and IP-level)
        if (ip) {
          await recordIpAttempt(ip);
        }
        const lockoutResult = await recordFailedAttempt(email, ip);

        if (lockoutResult.isLocked) {
          const lockoutDuration = formatLockoutDuration(lockoutResult.lockoutCount ?? 1);
          return ApiResponse.error(
            `Demasiadas tentativas falhadas. Conta bloqueada por ${lockoutDuration}.`,
            401,
            { lockoutSeconds: lockoutResult.remainingSeconds }
          );
        }

        // Return generic error to prevent user enumeration
        return ApiResponse.unauthorized('Email ou password incorretos');
      }
    } catch (error) {
      throw error; // Re-throw to be handled by BaseRouteHandler
    }
  });

export const POST = loginHandler.toNextHandler();

// Handle CORS preflight requests
export const OPTIONS = createOptionsHandler({
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
});
