/**
 * @fileoverview Input sanitization middleware
 * @description Sanitizes user inputs to prevent XSS attacks
 */

import { Middleware } from '../core/types';

/**
 * Sanitize a string value (Simple Regex version to avoid jsdom/Vercel issues)
 */
function sanitizeString(value: unknown): string {
  if (typeof value !== 'string') {
    return String(value);
  }

  // Remove HTML tags (basic sanitization)
  return value.replace(/<[^>]*>?/gm, '');
}

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize both key and value
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }

  // For numbers, booleans, etc., return as-is
  return obj;
}

/**
 * Input sanitization middleware
 * Sanitizes validated data to prevent XSS attacks
 */
export const sanitizationMiddleware: Middleware = async (context) => {
  // Sanitize validated data if it exists
  if (context.validatedData) {
    context.validatedData = sanitizeObject(context.validatedData);
  }

  return context;
};

