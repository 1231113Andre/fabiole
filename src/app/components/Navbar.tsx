"use client";

import { memo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSession } from "@/lib/react-query/hooks/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import NewButton from "@/app/components/newButton";

// Move navItems outside component to prevent recreation on each render
const navItems = [
  { href: "/", label: "Home", icon: "fa-duotone fa-house-chimney" },
  { href: "/sobre", label: "Sobre", icon: "fa-duotone fa-user-graduate" },
  { href: "/servicos", label: "Serviços", icon: "fa-duotone fa-dumbbell" },
  { href: "/contacto", label: "Contacto", icon: "fa-duotone fa-envelope-open-text" },
] as const;

const socialLinks = [
  { href: "https://discord.com", icon: "fa-brands fa-discord", label: "Discord" },
  { href: "https://instagram.com", icon: "fa-brands fa-instagram", label: "Instagram" },
  { href: "https://x.com", icon: "fa-brands fa-x-twitter", label: "X / Twitter" },
  { href: "https://www.tiktok.com", icon: "fa-brands fa-tiktok", label: "TikTok" },
] as const;

interface NavbarProps {
  initialSession?: unknown;
}

const Navbar = memo(function Navbar({ initialSession }: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { data: session } = useSession(initialSession as any);

  // Auth Modal State
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login');

  const openAuthModal = (view: 'login' | 'register') => {
    setAuthModalView(view);
    setAuthModalOpen(true);
    setMobileMenuOpen(false); // Close mobile menu if open
  };

  // Prevent hydration mismatch by only checking auth after mount
  // Also clean up any dashboard CSS variables
  useEffect(() => {
    setIsMounted(true);
    // Clean up any dashboard CSS variables that might have persisted
    if (typeof window !== "undefined") {
      document.documentElement.style.removeProperty("--sidebar-width");
    }
  }, []);

  const isAuthenticated = isMounted && (session as any)?.authenticated && (session as any)?.user;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("no-scroll", isMobileMenuOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Hide navbar on dashboard pages
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <>
      {/* Fixed Navbar - stays at top on scroll */}
      <header className="fixed inset-x-0 top-0 z-[1000] bg-transparent ui-flex-center px-4">
        <nav className="ui-container relative mx-auto flex h-[var(--navbar-height)] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <Image src="/images/logo.png" alt="Logo" width={44} height={44} priority />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-base font-semibold text-white transition-all duration-200 hover:text-[var(--primary)] ${isActive ? "text-[var(--primary)]" : ""}`}
                >
                  <i className={item.icon} aria-hidden="true"></i>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* User Profile Link - only render after mount to prevent hydration mismatch */}
            {isMounted && (() => {
              if (isAuthenticated) {
                const user = (session as any)?.user;
                const userName = user?.name || '';
                const userSurname = user?.surname || '';
                const fullName = `${userName} ${userSurname}`.trim().toUpperCase() || 'USER';
                const isActive = pathname === "/dashboard";
                return (
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-2 text-base font-semibold text-white transition-all duration-200 hover:text-[var(--primary)] ${isActive ? "text-[var(--primary)]" : ""}`}
                  >
                    <i className="fa-duotone fa-user-circle" aria-hidden="true"></i>
                    <span>{fullName}</span>
                  </Link>
                );
              } else {
                return (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => openAuthModal('login')}
                      className="flex items-center gap-2 text-base font-semibold text-white transition-all duration-200 hover:text-[var(--primary)] bg-transparent border-none cursor-pointer"
                    >
                      <i className="fa-duotone fa-right-to-bracket" aria-hidden="true"></i>
                      <span>Login</span>
                    </button>
                    <NewButton
                      variant="new_primary_rounded"
                      h="10"
                      onClick={() => openAuthModal('register')}
                      className="!px-6 !text-sm"
                    >
                      Register
                    </NewButton>
                  </div>
                );
              }
            })()}
          </div>

          {/* Mobile Toggle Button */}
          <button
            className="inline-flex items-center justify-center rounded-lg p-2 text-white transition-colors duration-200 hover:bg-white/10 md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <i className={isMobileMenuOpen ? "fas fa-xmark" : "fas fa-bars"} aria-hidden="true"></i>
          </button>
        </nav>
      </header>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 max-w-[80vw] translate-x-full transform bg-[var(--background)] shadow-2xl transition-transform duration-300 ease-out ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
            <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
              <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
            </Link>
            <button
              className="rounded-lg p-2 text-[var(--foreground)] transition-colors duration-200 hover:bg-[var(--muted)]"
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              <i className="fas fa-xmark" aria-hidden="true"></i>
            </button>
          </div>

          <nav className="flex flex-col gap-2 overflow-y-auto px-4 py-4">
            {navItems.map((item) => {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold text-[var(--foreground)] transition-all duration-200 hover:bg-[var(--muted)] hover:text-[var(--primary)]"
                  onClick={closeMobileMenu}
                >
                  <i className={item.icon} aria-hidden="true"></i>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4 border-t border-[var(--border)] px-4 py-4">
            {isMounted && (
              isAuthenticated ? (() => {
                const user = (session as any)?.user;
                const userName = user?.name || '';
                const userSurname = user?.surname || '';
                const fullName = `${userName} ${userSurname}`.trim().toUpperCase() || 'USER';
                return (
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white transition-all duration-200 hover:brightness-110"
                    onClick={closeMobileMenu}
                  >
                    <i className="fa-duotone fa-user-circle" aria-hidden="true"></i>
                    <span>{fullName}</span>
                  </Link>
                );
              })() : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="block w-full rounded-lg bg-[var(--primary)] px-4 py-3 text-center text-base font-semibold text-white transition-all duration-200 hover:brightness-110 border-none cursor-pointer"
                  >
                    Sign Up | Sign In
                  </button>
                </div>
              )
            )}

            <div className="flex items-center justify-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:bg-[var(--muted)]"
                >
                  <i className={link.icon}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialView={authModalView}
      />
    </>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;
