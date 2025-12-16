/**
 * @fileoverview Pathname utilities for server components
 * @description Helper to get pathname in server components
 */

import { headers } from "next/headers";

/**
 * Get current pathname from headers (server-side)
 * Uses x-pathname header set by middleware, or extracts from referer
 */
export async function getServerPathname(): Promise<string> {
  const headersList = await headers();
  
  // Try to get from custom header set by middleware
  const pathnameHeader = headersList.get("x-pathname");
  if (pathnameHeader) {
    return pathnameHeader;
  }
  
  // Fallback: try to extract from referer
  const referer = headersList.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      return url.pathname;
    } catch {
      // Invalid URL, return default
    }
  }
  
  // Default fallback
  return "/";
}

