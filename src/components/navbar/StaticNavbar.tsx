
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { validateAuth } from '@/lib/auth/validate';
import { getServerPathname } from '@/lib/utils/pathname';
import NavbarButton from './NavbarButton';

// Nav items for fabiole
const navItems = [
  { href: "/", label: "Home", icon: "fa-duotone fa-house-chimney" },
  { href: "/sobre", label: "Sobre", icon: "fa-duotone fa-user-graduate" },
  { href: "/servicos", label: "Serviços", icon: "fa-duotone fa-dumbbell" },
  { href: "/contacto", label: "Contacto", icon: "fa-duotone fa-envelope-open-text" },
] as const;

export default async function StaticNavbar() {
  const authResult = await validateAuth();
  const isAuthenticated = authResult.authenticated && !!authResult.user;
  const pathname = await getServerPathname();

  const hasBanner = pathname === '/';

  return (
    <header
      id="main-header"
      suppressHydrationWarning
      data-is-home={hasBanner.toString()}
    >
      <div className="navbar-container">
        {/* Mobile Menu Button - positioned absolutely on mobile */}
        <button
          id="mobile-menu-btn"
          className="lg:hidden p-2 touch-manipulation absolute right-3 sm:right-4 z-10"
          aria-label="Toggle menu"
        >
          <i id="mobile-menu-icon" className="fa-solid fa-bars text-xl"></i>
        </button>

        {/* Desktop: Centered group with logo, nav, and login */}
        <div className="hidden lg:flex items-center navbar-desktop-container">
          {/* Logo */}
          <Link
            href="/"
            id="main-logo-link"
            className="navbar-logo-link"
            prefetch={true}
          >
            <Image
              id="main-logo-image"
              src="/images/logo.png"
              alt="Fábio Lé Logo"
              width={80}
              height={80}
              className="w-20 h-20 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center">
            {navItems.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className="navbar-nav-link"
              >
                {link.icon && <i className={link.icon}></i>}
                <span className="text-base">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Login Button */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <NavbarButton
                  href="/login"
                  iconPosition="right"
                  className="w-[140px] min-w-[140px] hero-cta-btn"
                  icon={<i className="fa-duotone fa-right-to-bracket text-xl"></i>}
                >
                  Login
                </NavbarButton>
                <span className="text-white font-bold text-lg">|</span>
                <NavbarButton
                  href="/registar"
                  iconPosition="right"
                  className="w-[140px] min-w-[140px] hero-cta-btn"
                  icon={<i className="fa-duotone fa-user-plus text-xl"></i>}
                >
                  Register
                </NavbarButton>
              </>
            ) : (
              <div id="navbar-auth-btn" data-authenticated={String(isAuthenticated)} suppressHydrationWarning>
                <NavbarButton
                  href="/dashboard"
                  iconPosition="right"
                  className="w-[180px] min-w-[180px] hero-cta-btn"
                  icon={<i className="fa-duotone fa-chart-line text-xl"></i>}
                >
                  Dashboard
                </NavbarButton>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Centered logo */}
        <Link
          href="/"
          id="main-logo-link-mobile"
          className="lg:hidden navbar-logo-link mx-auto"
          prefetch={true}
        >

        </Link>
      </div>

      {/* Mobile Menu Backdrop */}
      <div id="mobile-menu-backdrop" className="hidden lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 opacity-0"></div>

      {/* Mobile Menu */}
      <div id="mobile-menu" className="hidden lg:hidden fixed top-0 left-0 h-full w-full shadow-2xl z-50 transform translate-x-full transition-transform duration-300 ease-out overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-end p-5 border-b border-border bg-gradient-to-r from-background to-muted/20">
            <button
              id="mobile-menu-close-btn"
              className="p-2.5 hover:bg-muted rounded-lg transition-all duration-200 active:scale-95"
              aria-label="Close menu"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          {/* Mobile Menu Navigation */}
          <nav className="flex flex-col p-4 gap-2 flex-1 overflow-y-auto">
            {navItems.map((link) => {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                >
                  {link.icon && (
                    <i className={`${link.icon} text-lg`}></i>
                  )}
                  <span className="text-base">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-border bg-muted/20 space-y-3">
            {/* Auth Button */}
            <div id="mobile-auth-btn" data-authenticated={String(isAuthenticated)} suppressHydrationWarning>
              <NavbarButton
                href={isAuthenticated ? "/dashboard" : "/login"}
                className="w-full"
                icon={
                  isAuthenticated ? (
                    <i className="fa-duotone fa-chart-line"></i>
                  ) : (
                    <i className="fa-duotone fa-right-to-bracket"></i>
                  )
                }
              >
                {isAuthenticated ? "Dashboard" : "Login"}
              </NavbarButton>
            </div>

            {/* Separator */}
            <div className="h-px bg-border/50 my-2"></div>

            {/* Social Media Icons */}
            <div className="flex items-center justify-center gap-3 py-2">
              <a
                href="https://discord.com"
                aria-label="Discord"
                className="navbar-social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-discord text-lg"></i>
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="navbar-social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-instagram text-lg"></i>
              </a>
              <a
                href="https://x.com"
                aria-label="X / Twitter"
                className="navbar-social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-x-twitter text-lg"></i>
              </a>
              <a
                href="https://www.tiktok.com"
                aria-label="TikTok"
                className="navbar-social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-tiktok text-lg"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
