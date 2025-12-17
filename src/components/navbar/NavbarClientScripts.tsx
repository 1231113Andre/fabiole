'use client';

/**
 * Client Component wrapper dla wszystkich interaktywnych funkcji navbaru
 * Zoptymalizowane - wszystkie CSR komponenty w jednym miejscu
 * 
 * Architektura:
 * - StaticNavbar: SSR - renderuje strukturę HTML
 * - NavbarClientScripts: CSR - dodaje interaktywność
 */
import NavbarScrollHandler from '../NavbarScrollHandler';
import NavbarVisibilityController from '../NavbarVisibilityController';
import NavbarAnimations from './NavbarAnimations';
import MobileMenuToggle from './MobileMenuToggle';
import MobileMenuThemeSwitcher from './MobileMenuThemeSwitcher';
import MobileMenuLogoAnimation from './MobileMenuLogoAnimation';
import NavbarAuthButton from './NavbarAuthButton';
import NavbarPositionHandler from './NavbarPositionHandler';

export default function NavbarClientScripts() {
  return (
    <>
      <NavbarScrollHandler />
      <NavbarVisibilityController />
      <NavbarPositionHandler />
      <NavbarAnimations />
      <MobileMenuToggle />
      <MobileMenuThemeSwitcher />
      <MobileMenuLogoAnimation />
      <NavbarAuthButton />
    </>
  );
}

