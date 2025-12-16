'use client';

import { useEffect } from 'react';

/**
 * Client component that adds navbar-scrolled class on scroll
 */
export default function NavbarScrollHandler() {
  useEffect(() => {
    const navbar = document.getElementById('main-header');
    if (!navbar) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > 20) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null;
}

