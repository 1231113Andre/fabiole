/**
 * @fileoverview Pathname utilities for server components
 * @description Helper to get pathname in server components
 * Uses Next.js 16 compatible approach without middleware
 */

import { headers } from "next/headers";

/**
 * Get current pathname from headers (server-side)
 * Extracts from referer header (most reliable method in Next.js 16)
 */
export async function getServerPathname(): Promise<string> {
  const headersList = await headers();
  
  // Try to extract from referer (most reliable in Next.js 16)
  const referer = headersList.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      const pathname = url.pathname;
      // Normalize pathname (remove trailing slash except for root)
      if (pathname && pathname !== "/" && pathname.endsWith("/")) {
        return pathname.slice(0, -1);
      }
      return pathname || "/";
    } catch {
      // Invalid URL, continue to default
    }
  }
  
  // Default fallback (for initial page load or when referer is not available)
  return "/";
}



