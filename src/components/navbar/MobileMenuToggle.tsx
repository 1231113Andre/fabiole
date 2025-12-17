'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const ANIMATION_DURATION = 300;

/**
 * Optimized client component that handles mobile menu toggle functionality
 */
export default function MobileMenuToggle() {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const isOpenRef = useRef(false);
  const elementsRef = useRef<{
    menuBtn: HTMLElement | null;
    mobileMenu: HTMLElement | null;
    menuIcon: HTMLElement | null;
    backdrop: HTMLElement | null;
    closeBtn: HTMLElement | null;
    navLinks: NodeListOf<HTMLElement> | null;
  }>({
    menuBtn: null,
    mobileMenu: null,
    menuIcon: null,
    backdrop: null,
    closeBtn: null,
    navLinks: null,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const elements = {
      menuBtn: document.getElementById('mobile-menu-btn'),
      mobileMenu: document.getElementById('mobile-menu'),
      menuIcon: document.getElementById('mobile-menu-icon'),
      backdrop: document.getElementById('mobile-menu-backdrop'),
      closeBtn: document.getElementById('mobile-menu-close-btn'),
      navLinks: null as NodeListOf<HTMLElement> | null,
    };

    if (!elements.menuBtn || !elements.mobileMenu || !elements.menuIcon) {
      return;
    }

    elements.navLinks = elements.mobileMenu.querySelectorAll('a');
    elementsRef.current = elements;

    const showMenu = () => {
      requestAnimationFrame(() => {
        const { mobileMenu, backdrop, menuIcon } = elements;
        if (!mobileMenu || !menuIcon) return;

        mobileMenu.classList.remove('hidden');
        mobileMenu.style.transform = 'translate3d(0, 0, 0)';
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');

        if (backdrop) {
          backdrop.classList.remove('hidden', 'opacity-0');
          backdrop.classList.add('opacity-100');
        }

        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-xmark');
        document.body.style.overflow = 'hidden';
        isOpenRef.current = true;
      });
    };

    const hideMenu = () => {
      const { mobileMenu, backdrop, menuIcon } = elements;
      if (!mobileMenu || !menuIcon) return;

      mobileMenu.classList.remove('translate-x-0');
      mobileMenu.classList.add('translate-x-full');
      mobileMenu.style.transform = 'translate3d(100vw, 0, 0)';

      if (backdrop) {
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0');
        setTimeout(() => backdrop?.classList.add('hidden'), ANIMATION_DURATION);
      }

      menuIcon.classList.remove('fa-xmark');
      menuIcon.classList.add('fa-bars');
      document.body.style.overflow = '';

      setTimeout(() => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('translate-x-0', 'translate-x-full');
        mobileMenu.style.transform = '';
      }, ANIMATION_DURATION);

      isOpenRef.current = false;
    };

    const toggleMenu = () => {
      if (isOpenRef.current) {
        hideMenu();
      } else {
        showMenu();
      }
    };

    const closeMenu = () => {
      if (isOpenRef.current) {
        hideMenu();
      }
    };

    const handleBackdropClick = (e: MouseEvent) => {
      if (isOpenRef.current && elements.backdrop && e.target === elements.backdrop) {
        closeMenu();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (isOpenRef.current && e.key === 'Escape') {
        closeMenu();
      }
    };

    const linkClickHandler = () => closeMenu();

    elements.menuBtn.addEventListener('click', toggleMenu);
    elements.closeBtn?.addEventListener('click', closeMenu);
    elements.backdrop?.addEventListener('click', handleBackdropClick);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('close-mobile-menu', closeMenu);
    elements.navLinks.forEach(link => link.addEventListener('click', linkClickHandler));

    return () => {
      elements.menuBtn?.removeEventListener('click', toggleMenu);
      elements.closeBtn?.removeEventListener('click', closeMenu);
      elements.backdrop?.removeEventListener('click', handleBackdropClick);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('close-mobile-menu', closeMenu);
      elements.navLinks?.forEach(link => link.removeEventListener('click', linkClickHandler));
      document.body.style.overflow = '';
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || !isOpenRef.current) return;

    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('mobile-menu-icon');

    if (mobileMenu && menuIcon) {
      requestAnimationFrame(() => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('translate-x-0', 'translate-x-full');
        mobileMenu.style.transform = '';
        menuIcon.classList.remove('fa-xmark');
        menuIcon.classList.add('fa-bars');
        document.body.style.overflow = '';
        isOpenRef.current = false;
      });
    }
  }, [pathname, isMounted]);

  return null;
}

