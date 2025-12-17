"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import MainContent from './MainContent';
import NavbarClientScripts from '@/components/navbar/NavbarClientScripts';

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

  // Don't render navbar on dashboard pages
  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-[var(--background)]">
      {/* SSR: Static structure of navbar passed as prop */}
      {navbar}

      {/* CSR: All interactive navbar functions */}
      <NavbarClientScripts />

      <MainContent>
        {children}
      </MainContent>
    </div>
  );
}

