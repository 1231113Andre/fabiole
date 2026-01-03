/**
 * Sanitize string input to prevent XSS and injection attacks
 * More comprehensive version that handles edge cases
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    return String(input || '').trim();
  }

  return input
    .trim()
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags (more comprehensive)
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/[<>]/g, ''); // Remove any remaining angle brackets
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  return sanitizeString(email).toLowerCase();
}

/**
 * Sanitize object recursively
 * Handles nested objects, arrays, and null values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => 
      typeof item === 'object' && item !== null 
        ? sanitizeObject(item as Record<string, unknown>)
        : typeof item === 'string' 
          ? sanitizeString(item) 
          : item
    ) as T;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const sanitized = { ...obj } as T;

  for (const key in sanitized) {
    const value = sanitized[key];
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value) as T[Extract<keyof T, string>];
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>) as T[Extract<keyof T, string>];
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => 
        typeof item === 'object' && item !== null
          ? sanitizeObject(item as Record<string, unknown>)
          : typeof item === 'string' 
            ? sanitizeString(item) 
            : item
      ) as T[Extract<keyof T, string>];
    }
  }

  return sanitized;
}












