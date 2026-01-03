/**
 * @fileoverview Route validation utilities
 * @description Shared utilities for checking valid routes and 404 detection
 */

// List of valid routes (pages that should show navbar/footer)
export const VALID_ROUTES = [
  '/',
  '/contacto',
  '/servicos',
  '/sobre',
] as const;

/**
 * Check if pathname is a valid page route (not 404)
 * @param pathname - Current pathname
 * @returns true if pathname is a valid page route
 */
export function isValidPageRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  
  // API routes are not pages
  if (pathname.startsWith('/api')) return false;
  
  // Dashboard and admin routes don't use navbar/footer
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) return false;
  
  // Check if it's a valid page route
  return VALID_ROUTES.includes(pathname as typeof VALID_ROUTES[number]);
}

