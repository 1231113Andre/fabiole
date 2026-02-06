"use client";

import { useEffect, useState } from "react";

/**
 * Get cookie value by name (optimized)
 * @param name - Cookie name
 * @returns Cookie value or null
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  // Optimized cookie parsing - check if cookie exists first
  const cookieString = document.cookie;
  const nameEQ = `${name}=`;
  const startIndex = cookieString.indexOf(nameEQ);
  
  if (startIndex === -1) {
    return null;
  }
  
  const valueStart = startIndex + nameEQ.length;
  const valueEnd = cookieString.indexOf(';', valueStart);
  const value = valueEnd === -1 
    ? cookieString.substring(valueStart)
    : cookieString.substring(valueStart, valueEnd);
  
  return value || null;
}

/**
 * Fetch CSRF token from API endpoint and set cookie
 * This replaces middleware-based token generation for Next.js 16 compatibility
 * Exported so callers can ensure token is available before mutations (e.g. register after verification).
 */
export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/csrf', {
      method: 'GET',
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      return data.token || null;
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
  return null;
}

/**
 * Hook to get CSRF token from cookie (reactive)
 * Token is set by /api/csrf endpoint and accessible via document.cookie
 * Automatically fetches token if not present
 * @returns {string | null} CSRF token or null if not available
 */
export function useCsrfToken(): string | null {
  const [token, setToken] = useState<string | null>(() => getCookie('csrf-token'));

  useEffect(() => {
    // Initial check
    const currentToken = getCookie('csrf-token');
    if (currentToken !== token) {
      setToken(currentToken);
    }

    // If no token, fetch it from API
    if (!currentToken) {
      fetchCsrfToken().then(newToken => {
        if (newToken) {
          setToken(newToken);
        }
      });
    }

    // Poll for token changes (token is session-based, 24h)
    const interval = setInterval(() => {
      const newToken = getCookie('csrf-token');
      if (newToken !== token) {
        setToken(newToken);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [token]);

  return token;
}

/**
 * Get CSRF token synchronously (for use in fetch calls)
 * Optimized for performance - minimal string operations
 * @returns {string | null} CSRF token or null if not available
 */
export function getCsrfToken(): string | null {
  return getCookie('csrf-token');
}

/**
 * Wait for CSRF token to become available (with timeout)
 * Uses exponential backoff for efficiency
 * @param maxWaitMs - Maximum time to wait in milliseconds (default: 2000ms)
 * @returns {Promise<string | null>} CSRF token or null if timeout
 */
export async function waitForCsrfToken(maxWaitMs: number = 2000): Promise<string | null> {
  if (typeof document === 'undefined') {
    return null;
  }

  const startTime = Date.now();
  let checkInterval = 10; // Start with 10ms
  const maxInterval = 100; // Cap at 100ms

  return new Promise((resolve) => {
    const checkToken = () => {
      const token = getCsrfToken();
      if (token) {
        resolve(token);
        return;
      }

      const elapsed = Date.now() - startTime;
      if (elapsed >= maxWaitMs) {
        resolve(null);
        return;
      }

      // Exponential backoff - check less frequently over time
      setTimeout(checkToken, Math.min(checkInterval, maxInterval));
      checkInterval = Math.min(checkInterval * 1.5, maxInterval);
    };

    checkToken();
  });
}

