'use client';

import { useEffect, useRef } from 'react';

/**
 * Client component that adds logo animation to mobile menu
 */
export default function MobileMenuLogoAnimation() {
  const cleanupRef = useRef<(() => void)[]>([]);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const logoImage = document.querySelector('#mobile-menu-logo-link img') as HTMLImageElement;
    const logoLink = document.getElementById('mobile-menu-logo-link');
    const menu = document.getElementById('mobile-menu');

    if (!logoImage || !logoLink || !menu) return;

    // Set initial state
    logoImage.style.opacity = '0';
    logoImage.style.transform = 'translateY(20px) scale(0.9)';

    const animateLogo = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;
      
      requestAnimationFrame(() => {
        logoImage.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        logoImage.style.opacity = '1';
        logoImage.style.transform = 'translateY(0) scale(1)';
      });
    };

    // Hover effect jest obsługiwany przez CSS - usunięto duplikację JS
    const observer = new MutationObserver(() => {
      const isVisible = menu.classList.contains('translate-x-0') && !menu.classList.contains('hidden');
      
      if (isVisible && !hasAnimatedRef.current) {
        requestAnimationFrame(() => {
          setTimeout(animateLogo, 100);
        });
      } else if (!isVisible) {
        hasAnimatedRef.current = false;
        logoImage.style.opacity = '0';
        logoImage.style.transform = 'translateY(20px) scale(0.9)';
      }
    });

    observer.observe(menu, { attributes: true, attributeFilter: ['class'] });

    cleanupRef.current.push(
      () => observer.disconnect()
    );

    if (menu.classList.contains('translate-x-0') && !menu.classList.contains('hidden')) {
      requestAnimationFrame(() => {
        setTimeout(animateLogo, 100);
      });
    }

    return () => {
      cleanupRef.current.forEach((fn) => fn());
      cleanupRef.current = [];
      hasAnimatedRef.current = false;
    };
  }, []);

  return null;
}

