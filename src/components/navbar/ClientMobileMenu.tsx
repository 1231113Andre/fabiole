"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ClientAuthModal from './ClientAuthModal';
import { useSession } from '@/lib/react-query/hooks/useAuth';

interface NavItem {
    href: string;
    label: string;
    icon: string;
}

interface User {
    name?: string;
    surname?: string;
    email?: string;
}

interface ClientMobileMenuProps {
    navItems: readonly NavItem[];
    initialUser?: User | null;
}

/**
 * Client Mobile Menu - Hybrid SSR + Client-side reactivity
 * - SSR: Uses initialUser for instant render (no loading spinner)
 * - Client: useSession hook reacts to login/logout instantly
 */
export default function ClientMobileMenu({ navItems, initialUser }: ClientMobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Use reactive session hook with SSR data as placeholder
    const { data: session } = useSession(
        initialUser ? { authenticated: true, user: initialUser as any } : { authenticated: false }
    );
    const user = session?.user;
    const isAuthenticated = session?.authenticated && !!user;

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    // Listen for close event from auth modal
    useEffect(() => {
        const handleClose = () => setIsOpen(false);
        window.addEventListener('close-mobile-menu', handleClose);
        return () => window.removeEventListener('close-mobile-menu', handleClose);
    }, []);

    const fullName = user
        ? `${user.name || ''} ${user.surname || ''}`.trim().toUpperCase()
        : 'USER';

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                id="mobile-menu-btn"
                onClick={toggleMenu}
                className="absolute right-3 z-10 p-2 touch-manipulation rounded-lg text-white transition-colors duration-200 hover:bg-white/10 sm:right-4 lg:hidden"
                aria-label="Toggle menu"
            >
                <i id="mobile-menu-icon" className="fa-solid fa-bars text-xl"></i>
            </button>

            {/* Mobile Menu Backdrop */}
            <div
                id="mobile-menu-backdrop"
                className={`${isOpen ? 'block' : 'hidden'} fixed inset-0 z-40 bg-black/50 ${isOpen ? 'opacity-100' : 'opacity-0'} backdrop-blur-sm transition-opacity duration-300 lg:hidden`}
                onClick={closeMenu}
            ></div>

            {/* Mobile Menu */}
            <div
                id="mobile-menu"
                className={`${isOpen ? 'block' : 'hidden'} fixed left-0 top-0 z-50 h-full w-full ${isOpen ? 'translate-x-0' : 'translate-x-full'} transform overflow-y-auto shadow-2xl transition-transform duration-300 ease-out lg:hidden`}
            >
                <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-end border-b border-[var(--border)] bg-gradient-to-r from-[var(--background)] to-[color-mix(in oklab, var(--muted) 20%, transparent)] p-5">
                        <button
                            id="mobile-menu-close-btn"
                            onClick={closeMenu}
                            className="rounded-lg p-2.5 transition-all duration-200 hover:bg-[var(--muted)] active:scale-95"
                            aria-label="Close menu"
                        >
                            <i className="fa-solid fa-xmark text-xl text-[var(--foreground)]"></i>
                        </button>
                    </div>

                    {/* Mobile Menu Navigation */}
                    <nav className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
                        {navItems.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                prefetch={true}
                                onClick={closeMenu}
                                className="flex items-center gap-4 rounded-xl px-4 py-3 text-base font-semibold text-[var(--foreground)] transition-all duration-200 hover:translate-x-1 hover:bg-[var(--muted)] hover:text-[var(--primary)] active:scale-95"
                            >
                                {link.icon && (
                                    <i className={`${link.icon} text-lg text-[var(--muted-foreground)] transition-colors duration-200`}></i>
                                )}
                                <span className="text-base">{link.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile Menu Footer */}
                    <div className="space-y-3 border-t border-[var(--border)] bg-[color-mix(in oklab, var(--muted) 20%, transparent)] p-4">
                        {/* Auth Buttons - SSR initial + client reactivity */}
                        <div id="mobile-auth-btn">
                            {isAuthenticated ? (
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center justify-center px-4 text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-out active:scale-95 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary cursor-pointer bg-primary text-white rounded-lg shadow-md font-medium text-base px-6 disabled:opacity-60 hover:!bg-transparent hover:border-orange-400 hover:!text-white hover:shadow-[0_10px_24px_rgba(230,145,91,0.35)] active:shadow-lg transition-all duration-200 ease-out border-2 border-orange-400 h-12 w-full uppercase font-bold text-lg"
                                >
                                    <i className="fa-duotone fa-user-circle mr-2"></i>
                                    {fullName}
                                </Link>
                            ) : (
                                <div className="flex flex-col gap-2 w-full">
                                    <button
                                        id="mobile-login-btn"
                                        type="button"
                                        className="inline-flex items-center justify-center px-4 text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-out active:scale-95 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary cursor-pointer bg-transparent text-popover-foreground rounded-lg shadow-md font-medium text-base px-6 disabled:opacity-60 hover:bg-primary-hover hover:backdrop-blur-sm hover:shadow-2xl hover:bg-primary hover:border-orange-400 active:shadow-lg transition-all duration-200 ease-out border-2 border-transparent h-12 w-full uppercase font-bold text-lg"
                                    >
                                        <i className="fa-duotone fa-right-to-bracket mr-2"></i>
                                        LOGIN
                                    </button>
                                    <button
                                        id="mobile-register-btn"
                                        type="button"
                                        className="inline-flex items-center justify-center px-4 text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-out active:scale-95 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary cursor-pointer bg-primary text-white rounded-lg shadow-md font-medium text-base px-6 disabled:opacity-60 hover:!bg-transparent hover:border-orange-400 hover:!text-white hover:shadow-[0_10px_24px_rgba(230,145,91,0.35)] active:shadow-lg transition-all duration-200 ease-out border-2 border-orange-400 h-12 w-full uppercase font-bold text-lg"
                                    >
                                        <i className="fa-duotone fa-user-plus mr-2"></i>
                                        REGISTER
                                    </button>
                                </div>
                            )}
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

            {/* Client Component for Modal Only */}
            <ClientAuthModal triggerId="mobile" />
        </>
    );
}
