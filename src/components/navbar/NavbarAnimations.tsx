'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function NavbarAnimations() {
  const pathname = usePathname();
  const cleanupFnsRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    const logo = document.getElementById('main-logo-image');
    const logoLink = document.getElementById('main-logo-link');

    if (!logo) return;

    // Simple fade-in animation
    logo.style.opacity = '0';
    logo.style.transform = 'translateY(20px) scale(0.9)';
    
    requestAnimationFrame(() => {
      logo.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      logo.style.opacity = '1';
      logo.style.transform = 'translateY(0) scale(1)';
    });

    // Hover effect jest teraz obsługiwany przez CSS klasę .navbar-logo-link:hover
    // Usunięto duplikację - nie manipulujemy już transformem przez JS

    return () => {
      cleanupFnsRef.current.forEach((fn) => fn());
      cleanupFnsRef.current = [];
    };
  }, [pathname]);

  return null;
}

