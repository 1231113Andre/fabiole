"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import MainContent from './MainContent';
import NavbarClientScripts from '@/components/navbar/NavbarClientScripts';

interface MainLayoutProps {
  children: React.ReactNode;
  navbar: React.ReactNode;
}

// List of valid routes (pages that should show navbar)
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
  
  // Dashboard and admin routes don't use navbar
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) return false;
  
  // Check if it's a valid page route
  if (VALID_ROUTES.includes(pathname)) return true;
  
  // If pathname doesn't match any valid route, it's likely a 404
  return false;
}

/**
 * Client Component for main layout to handle route changes correctly
 * Accepts navbar as a prop (Slot Pattern) to allow Server Component navbar usage
 */
export default function MainLayout({ children, navbar }: MainLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isValidRoute = isValidPageRoute(pathname);

  // Don't render navbar on dashboard, admin pages, or 404 page (invalid routes)
  if (isDashboard || pathname?.startsWith('/admin') || !isValidRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-[var(--background)]">
      {navbar}

      <NavbarClientScripts />

      <MainContent>
        {children}
      </MainContent>
    </div>
  );
}

