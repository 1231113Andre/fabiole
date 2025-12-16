import { Middleware } from '../core/types';
import { addResponseHeader } from '../core/RouteContext';

/**
 * Middleware to add request ID to response headers
 */
export const requestIdMiddleware: Middleware = async (context) => {
  return addResponseHeader(
    context,
    'X-Request-ID',
    context.requestId
  );
};










