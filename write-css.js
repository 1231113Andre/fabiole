const fs = require('fs');

const css = `/* Tailwind CSS v4 */
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap");
@import "tailwindcss";

:root {
  /* Light mode palette (from pairly) */
  --background: oklch(0.99 0.002 95);
  --foreground: oklch(0.15 0.01 260);
  --muted: oklch(0.96 0.003 95);
  --muted-foreground: oklch(0.45 0.01 260);
  --card: oklch(1 0 0);
  --card-background: var(--background);
  --card-foreground: var(--foreground);
  --popover: var(--card);
  --popover-foreground: var(--foreground);
  --border: oklch(0.90 0.005 95);
  --input: oklch(0.98 0.003 95);
  --separator: oklch(0.95 0.002 95);
  --shadow: 0 8px 24px rgba(15, 23, 42, 0.06);

  /* Brand palette (from pairly) */
  --primary: #e6915b;
  --primary-hover: #d18251;
  --primary-foreground: oklch(1 0 0);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-secondary: #10b981;
  --color-success: #16a34a;
  --color-error: oklch(0.6 0.22 28);
  --color-warning: #f59e0b;
  --destructive: var(--color-error);
  --destructive-foreground: oklch(1 0 0);

  /* Neutrals */
  --color-gray-50: #f8fafc;
  --color-gray-100: #f1f5f9;
  --color-gray-200: #e2e8f0;
  --color-gray-300: #cbd5e1;
  --color-gray-600: #475569;
  --color-gray-800: #1e293b;
}

:root.dark {
  /* Dark mode palette (from pairly) */
  --background: oklch(0.10 0.02 265);
  --foreground: oklch(0.98 0.002 260);
  --card: oklch(0.14 0.025 265);
  --card-background: var(--background);
  --card-foreground: var(--foreground);
  --popover: oklch(0.08 0.02 265);
  --popover-foreground: var(--foreground);
  --primary: #e6915b;
  --primary-hover: #d18251;
  --primary-foreground: oklch(0.1 0.01 40);
  --secondary: oklch(0.18 0.025 265);
  --secondary-foreground: var(--primary);
  --muted: oklch(0.18 0.025 265);
  --muted-foreground: oklch(0.55 0.01 265);
  --accent: oklch(0.28 0.025 265);
  --accent-foreground: oklch(0.95 0.003 265);
  --destructive: oklch(0.58 0.2 28);
  --destructive-foreground: oklch(0.98 0.005 28);
  --border: oklch(0.25 0.02 265);
  --input: var(--border);
  --separator: oklch(0.22 0.01 265);
  --shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-error: var(--destructive);
}

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-success: var(--color-success);
  --color-error: var(--destructive);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-card: var(--card);
  --color-border: var(--border);
  --color-popover-foreground: var(--popover-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --font-sans: "Montserrat", var(--font-inter), system-ui, -apple-system, "Segoe UI", sans-serif;
}

/* Button color utilities */
.bg-primary { background-color: var(--primary) !important; }
.bg-primary-hover { background-color: var(--primary-hover) !important; }
.text-primary { color: var(--primary) !important; }
.border-primary { border-color: var(--primary) !important; }
.text-popover-foreground { color: var(--popover-foreground) !important; }
.text-foreground { color: var(--foreground) !important; }
.bg-card { background-color: var(--card) !important; }
.bg-muted { background-color: var(--muted) !important; }
.text-muted-foreground { color: var(--muted-foreground) !important; }
.text-destructive { color: var(--destructive) !important; }
.text-primary-foreground { color: var(--primary-foreground) !important; }

/* Button styles - ensure white text on primary buttons */
a.new_primary_rounded,
a.new_primary_full_rounded,
button.new_primary_rounded,
button.new_primary_full_rounded,
.new_primary_rounded,
.new_primary_full_rounded {
  color: white !important;
}

a.new_primary_rounded *,
a.new_primary_full_rounded *,
button.new_primary_rounded *,
button.new_primary_full_rounded *,
.new_primary_rounded *,
.new_primary_full_rounded * {
  color: white !important;
}

button:focus,
button:focus-visible {
  outline: none !important;
  box-shadow: none !important;
}

/* Base styles */
html {
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
}

body {
  min-height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  transition: background-color 0.2s ease, color 0.2s ease;
}

body.no-scroll {
  overflow: hidden;
}

#__next {
  min-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

/* ========================================================= */
/* NAVBAR - Pairly-inspired centered layout                  */
/* ========================================================= */

:root {
  --navbar-height: 80px;
  --navbar-text: #f8fafc;
  --navbar-text-hover: #ffffff;
  --navbar-cta-bg: var(--color-primary);
  --navbar-cta-hover: rgba(234, 88, 12, 0.2);
}

/* Fixed Navbar - Absolute positioning like Pairly */
.navbar-fixed {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--navbar-height);
  z-index: 1030;
  background: transparent;
  pointer-events: auto;
}

/* Inner container - 3-column layout: logo | nav | cta */
.navbar-inner {
  width: 100%;
  max-width: 1280px;
  height: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

/* Left section: Logo */
.navbar-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

/* Logo with hover scale effect */
.navbar-logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.navbar-logo:hover {
  transform: scale(1.05);
}

.navbar-logo img {
  display: block;
  width: 64px;
  height: 64px;
}

/* Center section: Navigation Links */
.navbar-nav {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .navbar-nav {
    display: flex;
    gap: 1.5rem;
  }
}

/* Individual Nav Link - Pairly style */
.navbar-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: var(--navbar-text);
  font-weight: 500;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.navbar-link i {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.navbar-link:hover {
  color: var(--navbar-text-hover);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.navbar-link:active {
  transform: scale(0.95);
}

.navbar-link.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Right section: CTA + Mobile Toggle */
.navbar-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* CTA Button - Pairly orange glow style */
.navbar-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  padding: 0 1.5rem;
  border-radius: 8px;
  border: 2px solid #fb923c;
  background: var(--navbar-cta-bg);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(251, 146, 60, 0.4);
  transition: all 0.2s ease;
}

.navbar-cta:hover {
  background: var(--navbar-cta-hover);
  color: #ffffff;
  box-shadow: 0 8px 32px rgba(251, 146, 60, 0.5);
}

.navbar-cta:active {
  transform: scale(0.95);
}

/* Mobile Toggle Button */
.navbar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  color: var(--navbar-text);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.navbar-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
}

.navbar-toggle:active {
  transform: scale(0.95);
}

@media (min-width: 1024px) {
  .navbar-toggle {
    display: none;
  }
}

/* ========================================================= */
/* MOBILE MENU                                               */
/* ========================================================= */

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 10000;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.mobile-overlay.open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

/* Mobile Sidebar */
.mobile-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(300px, 85vw);
  background: var(--card);
  border-left: 1px solid var(--border);
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.2);
  z-index: 10001;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  visibility: hidden;
  transition: transform 0.3s ease, visibility 0.3s ease;
}

.mobile-sidebar.open {
  transform: translateX(0);
  visibility: visible;
}

/* Mobile Header */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.mobile-logo {
  display: flex;
  align-items: center;
}

.mobile-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--foreground);
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.mobile-close:hover {
  background: rgba(230, 145, 91, 0.1);
  color: var(--color-primary);
}

/* Mobile Navigation Links */
.mobile-nav {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 0.25rem;
  flex: 1;
  overflow-y: auto;
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  color: var(--foreground);
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.mobile-link i {
  width: 24px;
  color: var(--muted-foreground);
  font-size: 1.1rem;
  text-align: center;
  transition: color 0.2s ease;
}

.mobile-link:hover {
  background: rgba(230, 145, 91, 0.08);
  color: var(--color-primary);
}

.mobile-link:hover i {
  color: var(--color-primary);
}

.mobile-link.active {
  background: rgba(230, 145, 91, 0.12);
  color: var(--color-primary);
  border-left: 3px solid var(--color-primary);
}

.mobile-link.active i {
  color: var(--color-primary);
}

/* Mobile Footer */
.mobile-footer {
  padding: 1.25rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  border: 2px solid #fb923c;
  background: var(--color-primary);
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(251, 146, 60, 0.3);
  transition: all 0.2s ease;
}

.mobile-cta:hover {
  background: rgba(234, 88, 12, 0.2);
  color: #ffffff;
  box-shadow: 0 8px 32px rgba(251, 146, 60, 0.4);
}

.mobile-cta:active {
  transform: scale(0.95);
}

/* Mobile Social Links */
.mobile-socials {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.mobile-socials a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--muted-foreground);
  font-size: 1.15rem;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.mobile-socials a:hover {
  background: rgba(230, 145, 91, 0.1);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

/* Links */
a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}
a:hover {
  color: color-mix(in srgb, var(--color-primary) 85%, white);
}

/* Cards & surfaces */
.surface {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  box-shadow: var(--shadow);
}

/* Tables */
.table-clean thead {
  background: var(--color-gray-50);
}
.table-clean th {
  color: var(--muted);
  font-weight: 600;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-success { background: #dcfce7; color: #15803d; }
.badge-info    { background: #dbeafe; color: #1d4ed8; }
.badge-warn    { background: #fef9c3; color: #92400e; }
.badge-error   { background: #fee2e2; color: #b91c1c; }


/* ========================================================= */
/* Flowbite-style buttons (rounded-md instead of pills)      */
/* ========================================================= */
:root {
  --btn-radius: 0.375rem;
  --btn-padding-y: 0.625rem;
  --btn-padding-x: 1rem;
  --btn-font-size: 0.875rem;
  --btn-line-height: 1.25rem;
  --btn-font-weight: 600;
  --btn-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
  --btn-focus-ring: 0 0 0 4px rgba(232, 92, 45, 0.25);

  --btn-primary-bg: #ff6b35;
  --btn-primary-hover: #e85c2d;
  --btn-secondary-bg: #e5e7eb;
  --btn-secondary-border: #d1d5db;
  --btn-tertiary-bg: #f8fafc;
  --btn-tertiary-border: #e5e7eb;
  --btn-success-bg: #16a34a;
  --btn-success-hover: #15803d;
  --btn-danger-bg: #ef4444;
  --btn-danger-hover: #dc2626;
  --btn-warning-bg: #f59e0b;
  --btn-warning-hover: #d97706;
  --btn-dark-bg: #111827;
  --btn-dark-hover: #0f172a;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: var(--btn-padding-y) var(--btn-padding-x);
  border-radius: var(--btn-radius);
  font-size: var(--btn-font-size);
  line-height: var(--btn-line-height);
  font-weight: var(--btn-font-weight);
  border: 1px solid transparent;
  box-shadow: var(--btn-shadow);
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease,
    box-shadow 0.2s ease, transform 0.15s ease;
  text-decoration: none;
  cursor: pointer;
}

.btn:focus-visible {
  outline: none;
  box-shadow: var(--btn-focus-ring);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background: var(--btn-primary-bg);
  color: #fff;
  border-color: transparent;
}
.btn-primary:hover { background: var(--btn-primary-hover); }

.btn-secondary {
  background: var(--btn-secondary-bg);
  color: #0f172a;
  border-color: var(--btn-secondary-border);
}
.btn-secondary:hover {
  background: color-mix(in srgb, var(--btn-secondary-bg) 85%, #ffffff);
}

.btn-tertiary {
  background: var(--btn-tertiary-bg);
  color: #0f172a;
  border-color: var(--btn-tertiary-border);
}
.btn-tertiary:hover {
  background: color-mix(in srgb, var(--btn-tertiary-bg) 85%, #ffffff);
}

.btn-success {
  background: var(--btn-success-bg);
  color: #fff;
  border-color: transparent;
}
.btn-success:hover { background: var(--btn-success-hover); }

.btn-danger {
  background: var(--btn-danger-bg);
  color: #fff;
  border-color: transparent;
}
.btn-danger:hover { background: var(--btn-danger-hover); }

.btn-warning {
  background: var(--btn-warning-bg);
  color: #fff;
  border-color: transparent;
}
.btn-warning:hover { background: var(--btn-warning-hover); }

.btn-dark {
  background: var(--btn-dark-bg);
  color: #fff;
  border-color: transparent;
}
.btn-dark:hover { background: var(--btn-dark-hover); }

.btn-ghost {
  background: transparent;
  color: #0f172a;
  border-color: transparent;
}
.btn-ghost:hover {
  background: rgba(148, 163, 184, 0.16);
}

.btn-outline-light {
  background: transparent;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.7);
  box-shadow: none;
}
.btn-outline-light:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #e5e7eb;
}

.btn-icon-left {
  gap: 0.45rem;
}
.btn-icon-left > i,
.btn-icon-left > svg {
  margin-right: 0.15rem;
}
.btn-icon-right {
  gap: 0.45rem;
}
.btn-icon-right > i,
.btn-icon-right > svg {
  margin-left: 0.15rem;
}

/* Topbar and sidebar helpers */
.topbar-blur {
  backdrop-filter: blur(10px);
  background: rgba(255,255,255,0.8);
}
.dark .topbar-blur {
  background: rgba(17,24,39,0.8);
}
`;

fs.writeFileSync('src/app/globals.css', css);
console.log('CSS written successfully');
