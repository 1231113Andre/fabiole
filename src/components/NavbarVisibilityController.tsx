'use client';

import { useLayoutEffect } from 'react';

/**
 * Optimized Client Component that hides navbar when 404 page is rendered
 */
export default function NavbarVisibilityController() {
  useLayoutEffect(() => {
    const supportsHas = CSS.supports('selector(:has(*))');
    
    if (supportsHas) {
      return;
    }

    const navbar = document.getElementById('main-header');
    if (!navbar) return;

    const checkAndHide = () => {
      const notFoundElement = document.querySelector('.not-found-container, [data-page="not-found"]');
      if (notFoundElement) {
        navbar.style.display = 'none';
      } else {
        navbar.style.display = '';
      }
    };

    checkAndHide();

    const observer = new MutationObserver(checkAndHide);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}

