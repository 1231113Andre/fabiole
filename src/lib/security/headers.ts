/**
 * @fileoverview Security headers configuration
 * @description Comprehensive security headers for Next.js application
 *              Based on OWASP security best practices and security headers recommendations
 *              PERFORMANCE: Headers are cached and reused for better performance
 */

import { NextResponse } from 'next/server';

// Cache security headers (they don't change between requests)
let cachedHeaders: Record<string, string> | null = null;
let cachedHeadersEnv: string | undefined = undefined;

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * CSP configuration from environment variables
 */
const CSP_CONFIG = {
  googleApis: process.env.CSP_GOOGLE_APIS || 'https://sheets.googleapis.com https://www.googleapis.com https://*.googleapis.com',
  additionalDomains: process.env.CSP_ADDITIONAL_DOMAINS ? process.env.CSP_ADDITIONAL_DOMAINS.split(',').map(d => d.trim()) : [],
};

/**
 * HSTS configuration from environment variables
 */
const HSTS_CONFIG = {
  maxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000', 10), // Default 1 year
  includeSubDomains: process.env.HSTS_INCLUDE_SUBDOMAINS !== 'false',
  preload: process.env.HSTS_PRELOAD !== 'false',
};

/**
 * Get Content Security Policy header
 * Strict CSP configuration based on application needs
 * @returns CSP header value
 */
function getContentSecurityPolicy(): string {
  // Build connect-src with Google APIs, CDNs, additional domains, and localhost for debugging
  const connectSrc = [
    "'self'",
    CSP_CONFIG.googleApis,
    "https://cdn.jsdelivr.net", // Bootstrap CDN (for source maps and resources)
    ...(isDevelopment ? ["http://localhost:*", "http://127.0.0.1:*"] : []), // Allow localhost in development for debugging
    ...CSP_CONFIG.additionalDomains,
  ].filter(Boolean).join(' ');

  // Build script-src with allowed CDNs
  // Note: Next.js requires 'unsafe-inline' for hydration scripts
  // In production, ideally use nonce-based CSP, but for now unsafe-inline is needed
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'", // Required for Next.js hydration
    ...(isDevelopment ? ["'unsafe-eval'"] : []), // Only eval in dev mode
    "https://cdn.jsdelivr.net", // Bootstrap CDN
  ].filter(Boolean).join(' ');

  return [
    "default-src 'self'",
    // Scripts: allow self, CDNs, and Next.js dev mode requirements
    `script-src ${scriptSrc}`,
    // Styles: allow self, CDNs, unsafe-inline, and Google Fonts (for Montserrat)
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
    // Images: allow self, data URIs, and HTTPS images
    "img-src 'self' data: https: blob:",
    // Fonts: allow self, data URIs, and Google Fonts static CDN
    "font-src 'self' data: https://fonts.gstatic.com",
    // Connections: allow self and Google APIs + additional domains
    `connect-src ${connectSrc}`,
    // Media: allow self
    "media-src 'self'",
    // Objects: deny all (prevent plugins like Flash)
    "object-src 'none'",
    // Base URI: restrict to self
    "base-uri 'self'",
    // Form actions: restrict to self
    "form-action 'self'",
    // Frame ancestors: deny all (prevent clickjacking)
    "frame-ancestors 'none'",
    // Frame sources: deny all by default
    "frame-src 'none'",
    // Upgrade insecure requests in production
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ].join('; ');
}

/**
 * Get HSTS header value
 * @returns HSTS header value
 */
function getHSTSHeader(): string {
  const parts = [`max-age=${HSTS_CONFIG.maxAge}`];
  if (HSTS_CONFIG.includeSubDomains) {
    parts.push('includeSubDomains');
  }
  if (HSTS_CONFIG.preload) {
    parts.push('preload');
  }
  return parts.join('; ');
}

/**
 * Get Permissions Policy header (cached, computed once)
 * Restricts access to browser features for security
 * Only includes features that are recognized by current browsers
 * @returns Permissions Policy header value
 */
const PERMISSIONS_POLICY = [
  'accelerometer=()',
  'autoplay=()',
  'camera=()',
  'cross-origin-isolated=()',
  'display-capture=()',
  'encrypted-media=()',
  'fullscreen=(self)', // Allow fullscreen for same origin
  'geolocation=()',
  'gyroscope=()',
  'magnetometer=()',
  'microphone=()',
  'midi=()',
  'payment=()',
  'picture-in-picture=()',
  'publickey-credentials-get=()',
  'screen-wake-lock=()',
  'sync-xhr=()',
  'usb=()',
  'web-share=()',
  'xr-spatial-tracking=()',
].join(', ');

/**
 * Security headers configuration (cached for performance)
 * @description Returns security headers object for Next.js middleware/API routes
 *              Headers are cached and regenerated only when NODE_ENV changes
 *              Based on OWASP security best practices
 * @returns Headers object with security headers
 */
export function getSecurityHeaders(): Record<string, string> {
  // Return cached headers if environment hasn't changed
  const currentEnv = process.env.NODE_ENV;
  if (cachedHeaders && cachedHeadersEnv === currentEnv) {
    return cachedHeaders;
  }

  const headers: Record<string, string> = {
    // Prevent clickjacking attacks
    'X-Frame-Options': 'DENY',

    // Prevent MIME type sniffing (prevents XSS via MIME confusion)
    'X-Content-Type-Options': 'nosniff',

    // Enable XSS protection (legacy, but still useful for older browsers)
    'X-XSS-Protection': '1; mode=block',

    // Control referrer information (privacy + security)
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy (cached constant)
    'Permissions-Policy': PERMISSIONS_POLICY,

    // Content Security Policy (computed once per environment)
    'Content-Security-Policy': getContentSecurityPolicy(),
  };

  // HTTP Strict Transport Security (HSTS)
  // Only in production with HTTPS
  if (isProduction) {
    headers['Strict-Transport-Security'] = getHSTSHeader();
  }

  // Cache headers
  cachedHeaders = headers;
  cachedHeadersEnv = currentEnv;

  return headers;
}

/**
 * Apply security headers to NextResponse (optimized)
 * @param response - NextResponse object
 * @returns NextResponse with security headers applied
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const securityHeaders = getSecurityHeaders();

  // Use forEach for better performance (native method)
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}
