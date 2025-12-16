import { Middleware } from '../core/types';
import { addResponseHeader } from '../core/RouteContext';

/**
 * Compression middleware
 * Adds compression headers (Next.js handles actual compression)
 * This middleware just signals that compression is acceptable
 */
export const compressionMiddleware: Middleware = async (context) => {
  // Next.js automatically compresses responses
  // We just ensure proper headers are set
  const acceptEncoding = context.request.headers.get('accept-encoding') || '';
  
  if (acceptEncoding.includes('br')) {
    return addResponseHeader(context, 'Content-Encoding', 'br');
  } else if (acceptEncoding.includes('gzip')) {
    return addResponseHeader(context, 'Content-Encoding', 'gzip');
  }

  return context;
};



