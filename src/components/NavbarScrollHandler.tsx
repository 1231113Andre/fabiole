'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Client component that manages navbar styling based on scroll position and current route.
 * Replaces static Server Component logic which failed on client-side navigation.
 */
export default function NavbarScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    const navbar = document.getElementById('main-header');
    if (!navbar) return;

    // Define styles
    // Define styles
    const transparentStyle = ['bg-transparent'];
    // Navbar changed to always transparent as per user request
    const darkStyle = ['bg-transparent'];

    // Scrolled style - also transparent
    const scrolledStyle = ['bg-transparent'];

    // Pages that start transparent
    const isTransparentPage = pathname === '/' || pathname === '/sobre';

    const updateNavbarStyle = () => {
      const scrollY = window.scrollY;
      const isScrolled = scrollY > 20;

      // Reset classes first (remove all potential styles)
      navbar.classList.remove(...transparentStyle, ...darkStyle, ...scrolledStyle, 'navbar-scrolled');

      if (isScrolled) {
        // Scrolled state: Always dark background
        navbar.classList.add(...scrolledStyle, 'navbar-scrolled');
      } else {
        // Top state: depends on page
        if (isTransparentPage) {
          navbar.classList.add(...transparentStyle);
        } else {
          navbar.classList.add(...darkStyle);
        }
      }
    };

    // Initial update
    updateNavbarStyle();

    // Listeners
    window.addEventListener('scroll', updateNavbarStyle, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', updateNavbarStyle);
    };
  }, [pathname]); // Re-run when route changes

  return null;
}

