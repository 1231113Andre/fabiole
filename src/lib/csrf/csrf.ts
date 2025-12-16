/**
 * @fileoverview CSRF token generation and validation utilities
 * @description Secure CSRF token implementation using Double Submit Cookie pattern
 *              with session-based tokens for optimal performance and security.
 *              Based on OWASP best practices.
 */

/**
 * Generate a cryptographically secure CSRF token using Web Crypto API
 * Compatible with Edge Runtime
 * @returns {Promise<string>} Base64-encoded random token (256 bits)
 */
export async function generateCsrfToken(): Promise<string> {
  // Generate 32 random bytes (256 bits) using Web Crypto API
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  
  // Convert to base64 URL-safe format (no padding, no special chars)
  return base64UrlEncode(array);
}

/**
 * Generate CSRF token synchronously (for middleware)
 * Uses Web Crypto API compatible with Edge Runtime
 * @returns {string} Base64 URL-safe encoded random token (256 bits)
 */
export function generateCsrfTokenSync(): string {
  // Generate 32 random bytes (256 bits) using Web Crypto API
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  
  // Convert to base64 URL-safe format
  return base64UrlEncode(array);
}

/**
 * Base64 URL-safe encode helper (Edge Runtime compatible)
 * Uses URL-safe base64 encoding: no padding, uses - and _ instead of + and /
 * This ensures token is safe to use in URLs and cookies
 */
function base64UrlEncode(bytes: Uint8Array): string {
  // Standard base64 characters, then replace + with - and / with _
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  
  while (i < bytes.length) {
    const a = bytes[i++];
    const b = i < bytes.length ? bytes[i++] : 0;
    const c = i < bytes.length ? bytes[i++] : 0;
    
    const bitmap = (a << 16) | (b << 8) | c;
    
    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    if (i - 2 < bytes.length) {
      result += chars.charAt((bitmap >> 6) & 63);
    }
    if (i - 1 < bytes.length) {
      result += chars.charAt(bitmap & 63);
    }
  }
  
  // Convert to URL-safe: replace + with - and / with _, remove padding =
  return result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Compare two tokens securely using constant-time comparison
 * Prevents timing attacks by ensuring comparison takes same time regardless of where difference occurs
 * @param token1 - First token
 * @param token2 - Second token
 * @returns {boolean} True if tokens match exactly
 */
export function compareTokens(token1: string, token2: string): boolean {
  // Quick length check (non-sensitive)
  if (token1.length !== token2.length) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  // XOR all characters and check if result is zero
  let result = 0;
  for (let i = 0; i < token1.length; i++) {
    result |= token1.charCodeAt(i) ^ token2.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Validate token format
 * Ensures token is valid base64 URL-safe format and has minimum length
 * @param token - Token to validate
 * @returns {boolean} True if token format is valid
 */
export function isValidTokenFormat(token: string): boolean {
  // Token should be base64 URL-safe (32 bytes = 43 chars base64, but we allow some variance)
  // Minimum 32 chars (256 bits / 8 * 4/3 ≈ 43, but we use URL-safe which may vary)
  if (!token || token.length < 32 || token.length > 64) {
    return false;
  }
  
  // Check if token contains only valid base64 URL-safe characters
  const validChars = /^[A-Za-z0-9\-_]+$/;
  return validChars.test(token);
}
