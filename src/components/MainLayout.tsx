import React from 'react';
import { headers } from 'next/headers';
import MainContent from './MainContent';
import StaticNavbar from '@/components/navbar/StaticNavbar';
import NavbarClientScripts from '@/components/navbar/NavbarClientScripts';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Server Component dla głównego layoutu stron
 */
export default async function MainLayout({ children }: MainLayoutProps) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';
  const isHomePage = pathname === '/';
  const isDashboard = pathname.startsWith('/dashboard');
  const hasBanner = isHomePage;

  // Don't render navbar on dashboard pages (like pairly)
  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <div className={`main-layout ${hasBanner ? 'has-banner' : ''}`}>
        {/* SSR: Statyczna struktura navbaru */}
        <StaticNavbar />
        
        {/* CSR: Wszystkie interaktywne funkcje navbaru w jednym komponencie */}
        <NavbarClientScripts />
        
        <MainContent>
          {children}
        </MainContent>
      </div>
    </>
  );
}

