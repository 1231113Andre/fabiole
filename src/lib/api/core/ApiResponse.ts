import { ApiResponse as ApiResponseType } from './types';

/**
 * Standardized API response builder
 */
export class ApiResponse {
  /**
   * Create success response
   */
  static success<T>(data: T, status: number = 200): ApiResponseType {
    return {
      status,
      body: {
        success: true,
        data,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  /**
   * Create error response
   */
  static error(
    message: string,
    status: number = 500,
    details?: unknown
  ): ApiResponseType {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return {
      status,
      body: {
        success: false,
        error: message,
        ...(isProduction ? {} : { details }),
      },
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  /**
   * Create unauthorized response
   */
  static unauthorized(message: string = 'Unauthorized'): ApiResponseType {
    return this.error(message, 401);
  }

  /**
   * Create forbidden response
   */
  static forbidden(message: string = 'Forbidden'): ApiResponseType {
    return this.error(message, 403);
  }

  /**
   * Create bad request response
   */
  static badRequest(message: string, details?: unknown): ApiResponseType {
    return this.error(message, 400, details);
  }

  /**
   * Create not found response
   */
  static notFound(message: string = 'Not found'): ApiResponseType {
    return this.error(message, 404);
  }

  /**
   * Create conflict response
   */
  static conflict(message: string): ApiResponseType {
    return this.error(message, 409);
  }

  /**
   * Create rate limit response
   */
  static rateLimit(retryAfter?: number): ApiResponseType {
    return {
      status: 429,
      body: {
        success: false,
        error: 'Too many requests',
        retryAfter,
      },
      headers: {
        'Content-Type': 'application/json',
        ...(retryAfter ? { 'Retry-After': String(retryAfter) } : {}),
      },
    };
  }

  /**
   * Create response with custom status and body
   */
  static custom<T>(
    status: number,
    body: T,
    headers?: Record<string, string>
  ): ApiResponseType {
    return {
      status,
      body,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
  }
}











