import { Middleware, RouteHandler } from '../core/types';

/**
 * Compose multiple middlewares into a single middleware
 * @param middlewares - Array of middlewares to compose
 * @returns Composed middleware
 */
export function compose(...middlewares: Middleware[]): Middleware {
  return async (context) => {
    let currentContext = context;

    for (const middleware of middlewares) {
      const result = await middleware(currentContext);
      
      // If middleware returns ApiResponse, short-circuit
      if ('status' in result && 'body' in result) {
        return result;
      }
      
      currentContext = result;
    }

    return currentContext;
  };
}

/**
 * Compose middlewares with a final handler
 * @param middlewares - Array of middlewares
 * @param handler - Final handler
 * @returns Composed handler
 */
export function composeWithHandler(
  middlewares: Middleware[],
  handler: RouteHandler
): RouteHandler {
  return async (context) => {
    let currentContext = context;

    // Execute all middlewares
    for (const middleware of middlewares) {
      const result = await middleware(currentContext);
      
      // If middleware returns ApiResponse, short-circuit
      if ('status' in result && 'body' in result) {
        return result;
      }
      
      currentContext = result;
    }

    // Execute final handler
    return handler(currentContext);
  };
}












