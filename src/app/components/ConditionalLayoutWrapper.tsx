"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

// List of valid routes (pages that should show footer)
const VALID_ROUTES = [
  '/',
  '/contacto',
  '/servicos',
  '/sobre',
];

/**
 * Check if pathname is a valid page route (not 404)
 */
function isValidPageRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  
  // API routes are not pages
  if (pathname.startsWith('/api')) return false;
  
  // Dashboard and admin routes don't use footer
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) return false;
  
  // Check if it's a valid page route
  if (VALID_ROUTES.includes(pathname)) return true;
  
  // If pathname doesn't match any valid route, it's likely a 404
  return false;
}

/**
 * Conditional Layout Wrapper - Client Component
 * Handles layout conditionally based on route (CSR) to ensure updates on navigation
 */
export default function ConditionalLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isValidRoute = isValidPageRoute(pathname);

  if (isDashboard || pathname?.startsWith("/admin") || !isValidRoute) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Footer />
    </>
  );
}

