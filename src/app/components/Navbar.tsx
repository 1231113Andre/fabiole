"use client";

import { memo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSession } from "@/lib/react-query/hooks/useAuth";

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

  // Prevent hydration mismatch by only checking auth after mount
  useEffect(() => {
    setIsMounted(true);
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
      <header className="navbar-fixed">
        <nav className="navbar-container">
          {/* Logo */}
          <Link href="/" className="navbar-logo">
            <Image src="/images/logo.png" alt="Logo" width={44} height={44} priority />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="navbar-links">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`navbar-link ${isActive ? "navbar-link-active" : ""}`}
                >
                  <i className={item.icon} aria-hidden="true"></i>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Dashboard/Login Link - only render after mount to prevent hydration mismatch */}
            {isMounted && (() => {
              const dashboardHref = isAuthenticated ? "/dashboard" : "/login";
              const isActive = pathname === dashboardHref;
              return (
                <Link
                  href={dashboardHref}
                  className={`navbar-link ${isActive ? "navbar-link-active" : ""}`}
                >
                  <i className={isAuthenticated ? "fa-duotone fa-chart-line" : "fa-duotone fa-right-to-bracket"} aria-hidden="true"></i>
                  <span>{isAuthenticated ? "Dashboard" : "Login"}</span>
                </Link>
              );
            })()}
          </div>

          {/* Mobile Toggle Button */}
          <button
            className="navbar-toggle"
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
        className={`mobile-overlay ${isMobileMenuOpen ? "open" : ""}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Mobile Sidebar */}
      <aside className={`mobile-sidebar ${isMobileMenuOpen ? "open" : ""}`} aria-hidden={!isMobileMenuOpen}>
        <div className="mobile-header">
          <Link href="/" className="mobile-logo" onClick={closeMobileMenu}>
            <Image src="/images/logo.png" alt="Logo" width={44} height={44} />
          </Link>
          <button className="mobile-close" onClick={closeMobileMenu} aria-label="Close menu">
            <i className="fas fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <nav className="mobile-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-link ${isActive ? "mobile-link-active" : ""}`}
                onClick={closeMobileMenu}
              >
                <i className={item.icon} aria-hidden="true"></i>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mobile-footer">
          {isMounted && (
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="mobile-cta"
              onClick={closeMobileMenu}
            >
              {isAuthenticated ? "Dashboard" : "Login"}
            </Link>
          )}

          <div className="mobile-socials">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
              >
                <i className={link.icon}></i>
              </a>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;
