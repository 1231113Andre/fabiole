import { Middleware, ApiResponse } from '../core/types';
import { ApiResponse as ApiResponseBuilder } from '../core/ApiResponse';
import { setValidatedData } from '../core/RouteContext';
import { ZodSchema, ZodError } from 'zod';

/**
 * Create validation middleware
 * @param schema - Zod schema for validation
 */
export function validationMiddleware<T>(schema: ZodSchema<T>): Middleware {
  return async (context) => {
    try {
      // Parse request body
      let body: unknown;
      
      try {
        body = await context.request.json();
      } catch (error) {
        return ApiResponseBuilder.badRequest('Invalid JSON in request body');
      }

      // Validate with schema
      const validatedData = schema.parse(body);

      // Set validated data in context
      return setValidatedData(context, validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        return ApiResponseBuilder.badRequest(
          'Validation failed',
          error.issues.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          }))
        );
      }

      return ApiResponseBuilder.badRequest(
        error instanceof Error ? error.message : 'Validation error'
      );
    }
  };
}

