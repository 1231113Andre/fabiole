
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { validateAuth } from '@/lib/auth/validate';
import { getServerPathname } from '@/lib/utils/pathname';
import InteractiveAuthButtons from './InteractiveAuthButtons';

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
  const userName = authResult.user?.name || '';
  const userSurname = authResult.user?.surname || '';
  const pathname = await getServerPathname();

  const hasBanner = pathname === '/';

  return (
    <header
      id="main-header"
      className={`${hasBanner ? 'absolute left-0 right-0 top-[19px]' : 'relative mt-[19px]'} z-[1000] w-full bg-transparent flex justify-center px-4 ui-flex-center`}
      suppressHydrationWarning
      data-is-home={hasBanner.toString()}
    >
      <div className="ui-container relative mx-auto flex h-[var(--navbar-height)] w-full max-w-7xl items-center justify-center px-4 sm:px-8 lg:px-12">
        {/* Mobile Menu Button - positioned absolutely on mobile */}
        <button
          id="mobile-menu-btn"
          className="absolute right-3 z-10 p-2 touch-manipulation rounded-lg text-white transition-colors duration-200 hover:bg-white/10 sm:right-4 lg:hidden"
          aria-label="Toggle menu"
        >
          <i id="mobile-menu-icon" className="fa-solid fa-bars text-xl"></i>
        </button>

        {/* Desktop: Centered group with logo, nav, and login */}
        <div className="hidden w-full items-center justify-center gap-[5rem] lg:flex xl:gap-[6rem] 2xl:gap-[7rem]">
          {/* Logo */}
          <Link
            href="/"
            id="main-logo-link"
            className="flex shrink-0 items-center transition-transform duration-200 hover:scale-105 active:scale-95"
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
          <nav className="flex items-center gap-[3rem] xl:gap-[3.5rem] 2xl:gap-[4rem]">
            {navItems.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className="flex items-center gap-2 py-2 text-lg font-bold text-white transition-all duration-200 hover:text-[var(--primary)] active:scale-95"
              >
                {link.icon && <i className={link.icon}></i>}
                <span className="text-base">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Login Button */}
          <InteractiveAuthButtons isAuthenticated={isAuthenticated} userName={userName} userSurname={userSurname} />
        </div>

        {/* Mobile: Centered logo */}
        <Link
          href="/"
          id="main-logo-link-mobile"
          className="mx-auto flex items-center lg:hidden"
          prefetch={true}
        >
          <Image
            src="/images/logo.png"
            alt="Fábio Lé Logo"
            width={64}
            height={64}
            className="h-12 w-12 object-contain"
          />
        </Link>
      </div>

      {/* Mobile Menu Backdrop */}
      <div
        id="mobile-menu-backdrop"
        className="hidden fixed inset-0 z-40 bg-black/50 opacity-0 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
      ></div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className="hidden fixed left-0 top-0 z-50 h-full w-full translate-x-full transform overflow-y-auto shadow-2xl transition-transform duration-300 ease-out lg:hidden"
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-end border-b border-[var(--border)] bg-gradient-to-r from-[var(--background)] to-[color-mix(in oklab, var(--muted) 20%, transparent)] p-5">
            <button
              id="mobile-menu-close-btn"
              className="rounded-lg p-2.5 transition-all duration-200 hover:bg-[var(--muted)] active:scale-95"
              aria-label="Close menu"
            >
              <i className="fa-solid fa-xmark text-xl text-[var(--foreground)]"></i>
            </button>
          </div>

          {/* Mobile Menu Navigation */}
          <nav className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
            {navItems.map((link) => {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 text-base font-semibold text-[var(--foreground)] transition-all duration-200 hover:translate-x-1 hover:bg-[var(--muted)] hover:text-[var(--primary)] active:scale-95"
                >
                  {link.icon && (
                    <i className={`${link.icon} text-lg text-[var(--muted-foreground)] transition-colors duration-200`}></i>
                  )}
                  <span className="text-base">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Footer */}
          <div className="space-y-3 border-t border-[var(--border)] bg-[color-mix(in oklab, var(--muted) 20%, transparent)] p-4">
            {/* Auth Button */}
            <div id="mobile-auth-btn" data-authenticated={String(isAuthenticated)} suppressHydrationWarning>
              <InteractiveAuthButtons isAuthenticated={isAuthenticated} userName={userName} userSurname={userSurname} mobile={true} />
            </div>

            {/* Separator */}
            <div className="my-2 h-px bg-[color-mix(in oklab, var(--border) 50%, transparent)]"></div>

            {/* Social Media Icons */}
            <div className="flex items-center justify-center gap-3 py-2">
              <a
                href="https://discord.com"
                aria-label="Discord"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:border-[#5865F2] hover:bg-[#5865F2] hover:text-white hover:shadow-[0_6px_20px_rgba(88,101,242,0.5)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-discord text-lg"></i>
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:border-[#E4405F] hover:bg-[#E4405F] hover:text-white hover:shadow-[0_6px_20px_rgba(228,64,95,0.5)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-instagram text-lg"></i>
              </a>
              <a
                href="https://x.com"
                aria-label="X / Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:border-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white hover:shadow-[0_6px_20px_rgba(29,161,242,0.5)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-x-twitter text-lg"></i>
              </a>
              <a
                href="https://www.tiktok.com"
                aria-label="TikTok"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:border-[#EE1D52] hover:bg-[#EE1D52] hover:text-white hover:shadow-[0_6px_20px_rgba(238,29,82,0.5)]"
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
