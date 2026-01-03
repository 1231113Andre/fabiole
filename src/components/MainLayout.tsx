"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import MainContent from './MainContent';
import NavbarClientScripts from '@/components/navbar/NavbarClientScripts';
import { isValidPageRoute } from '@/lib/utils/routes';

interface MainLayoutProps {
  children: React.ReactNode;
  navbar: React.ReactNode;
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

