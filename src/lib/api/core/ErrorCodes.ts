/**
 * @fileoverview Standardized error codes
 * @description Error codes for consistent error handling across the API
 */

export enum ErrorCode {
  // Authentication errors (1000-1099)
  AUTH_REQUIRED = 'AUTH_1000',
  AUTH_INVALID_CREDENTIALS = 'AUTH_1001',
  AUTH_SESSION_EXPIRED = 'AUTH_1002',
  AUTH_SESSION_INVALID = 'AUTH_1003',
  AUTH_ACCOUNT_LOCKED = 'AUTH_1004',

  // Validation errors (2000-2099)
  VALIDATION_ERROR = 'VAL_2000',
  VALIDATION_INVALID_EMAIL = 'VAL_2001',
  VALIDATION_INVALID_PASSWORD = 'VAL_2002',
  VALIDATION_MISSING_FIELD = 'VAL_2003',

  // Resource errors (3000-3099)
  RESOURCE_NOT_FOUND = 'RES_3000',
  RESOURCE_ALREADY_EXISTS = 'RES_3001',
  RESOURCE_CONFLICT = 'RES_3002',

  // Rate limiting errors (4000-4099)
  RATE_LIMIT_EXCEEDED = 'RATE_4000',

  // Server errors (5000-5099)
  INTERNAL_ERROR = 'SRV_5000',
  TIMEOUT_ERROR = 'SRV_5001',
  DATABASE_ERROR = 'SRV_5002',
  EXTERNAL_SERVICE_ERROR = 'SRV_5003',

  // CSRF errors (6000-6099)
  CSRF_TOKEN_INVALID = 'CSRF_6000',
  CSRF_TOKEN_MISSING = 'CSRF_6001',
}

/**
 * Get error message for error code
 */
export function getErrorMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.AUTH_REQUIRED]: 'Authentication required',
    [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
    [ErrorCode.AUTH_SESSION_EXPIRED]: 'Session expired',
    [ErrorCode.AUTH_SESSION_INVALID]: 'Invalid session',
    [ErrorCode.AUTH_ACCOUNT_LOCKED]: 'Account temporarily locked',
    [ErrorCode.VALIDATION_ERROR]: 'Validation error',
    [ErrorCode.VALIDATION_INVALID_EMAIL]: 'Invalid email format',
    [ErrorCode.VALIDATION_INVALID_PASSWORD]: 'Invalid password',
    [ErrorCode.VALIDATION_MISSING_FIELD]: 'Required field is missing',
    [ErrorCode.RESOURCE_NOT_FOUND]: 'Resource not found',
    [ErrorCode.RESOURCE_ALREADY_EXISTS]: 'Resource already exists',
    [ErrorCode.RESOURCE_CONFLICT]: 'Resource conflict',
    [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
    [ErrorCode.INTERNAL_ERROR]: 'Internal server error',
    [ErrorCode.TIMEOUT_ERROR]: 'Request timeout',
    [ErrorCode.DATABASE_ERROR]: 'Database error',
    [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'External service error',
    [ErrorCode.CSRF_TOKEN_INVALID]: 'Invalid CSRF token',
    [ErrorCode.CSRF_TOKEN_MISSING]: 'CSRF token missing',
  };

  return messages[code] || 'Unknown error';
}

