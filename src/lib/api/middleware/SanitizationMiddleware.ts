/**
 * @fileoverview Input sanitization middleware
 * @description Sanitizes user inputs to prevent XSS attacks
 */

import { Middleware } from '../core/types';
import { sanitizeObject } from '@/lib/api/utils/sanitize';

/**
 * Input sanitization middleware
 * Sanitizes validated data to prevent XSS attacks
 */
export const sanitizationMiddleware: Middleware = async (context) => {
  // Sanitize validated data if it exists
  if (context.validatedData && typeof context.validatedData === 'object') {
    context.validatedData = sanitizeObject(context.validatedData as Record<string, unknown>);
  }

  return context;
};

