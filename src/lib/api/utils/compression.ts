/**
 * Compression utilities
 * Next.js handles compression automatically, these are helpers for headers
 */

/**
 * Check if client accepts compression
 */
export function acceptsCompression(acceptEncoding: string | null): boolean {
  if (!acceptEncoding) {
    return false;
  }

  return acceptEncoding.includes('br') || acceptEncoding.includes('gzip');
}

/**
 * Get preferred compression method
 */
export function getPreferredCompression(acceptEncoding: string | null): 'br' | 'gzip' | null {
  if (!acceptEncoding) {
    return null;
  }

  if (acceptEncoding.includes('br')) {
    return 'br';
  }

  if (acceptEncoding.includes('gzip')) {
    return 'gzip';
  }

  return null;
}











