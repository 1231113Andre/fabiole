import { NextRequest, NextResponse } from 'next/server';
import { RouteContext, Middleware, RouteHandler, ApiResponse } from './types';
import { createRouteContext } from './RouteContext';
import { ApiResponse as ApiResponseBuilder } from './ApiResponse';
import { Logger } from '@/lib/utils/logger';

/**
 * Base route handler with middleware support
 */
export class BaseRouteHandler {
  private middlewares: Middleware[] = [];
  private handler?: RouteHandler;

  /**
   * Add middleware to the pipeline
   */
  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Set the final handler
   */
  handle(handler: RouteHandler): this {
    this.handler = handler;
    return this;
  }

  /**
   * Execute the middleware pipeline and handler
   */
  async execute(request: NextRequest): Promise<NextResponse> {
    let context = createRouteContext(request);

    try {
      // Execute middleware pipeline
      for (const middleware of this.middlewares) {
        const result = await middleware(context);

        // If middleware returns ApiResponse, short-circuit
        if (this.isApiResponse(result)) {
          return this.toNextResponse(result);
        }

        context = result;
      }

      // Execute handler
      if (!this.handler) {
        throw new Error('No handler set');
      }

      const response = await this.handler(context);
      return this.toNextResponse(response);
    } catch (error) {
      Logger.error('System', `Handler Execution Failure: Unhandled exception in route handler context for request [${context.requestId}].`, error);

      const errorResponse = ApiResponseBuilder.error(
        error instanceof Error ? error.message : 'Internal server error',
        500,
        process.env.NODE_ENV === 'development' ? error : undefined
      );

      // Add request ID to error response
      errorResponse.headers['X-Request-ID'] = context.requestId;

      return this.toNextResponse(errorResponse);
    }
  }

  /**
   * Convert to Next.js handler function
   */
  toNextHandler() {
    return async (request: NextRequest) => {
      return this.execute(request);
    };
  }

  /**
   * Check if result is ApiResponse
   */
  private isApiResponse(result: RouteContext | ApiResponse): result is ApiResponse {
    return 'status' in result && 'body' in result;
  }

  /**
   * Convert ApiResponse to NextResponse
   */
  private async toNextResponse(response: ApiResponse): Promise<NextResponse> {
    const nextResponse = NextResponse.json(
      response.body,
      {
        status: response.status,
        headers: response.headers,
      }
    );

    // Set response headers from context
    for (const [key, value] of Object.entries(response.headers)) {
      nextResponse.headers.set(key, value);
    }

    // Set cookies if provided - use NextResponse.cookies directly
    // This is the correct way to set cookies in Next.js App Router API routes
    if (response.cookies) {
      for (const cookie of response.cookies) {
        nextResponse.cookies.set(cookie.name, cookie.value, cookie.options);
      }
    }

    return nextResponse;
  }
}





