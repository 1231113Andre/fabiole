import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { headers, cookies } from 'next/headers';
import { verifySession } from '@/lib/security/session';
import ClientAuthButtons from './ClientAuthButtons';
import ClientMobileMenu from './ClientMobileMenu';

// Nav items for fabiole
const navItems = [
    { href: "/", label: "Home", icon: "fa-duotone fa-house-chimney" },
    { href: "/sobre", label: "Sobre", icon: "fa-duotone fa-user-graduate" },
    { href: "/servicos", label: "Serviços", icon: "fa-duotone fa-dumbbell" },
    { href: "/contacto", label: "Contacto", icon: "fa-duotone fa-envelope-open-text" },
] as const;

interface User {
    name?: string;
    surname?: string;
    email?: string;
}

/**
 * Server Navbar - Hybrid SSR + Client-side reactivity
 * - SSR: Fetches user session for instant render (no loading spinner)
 * - Client: useSession hook reacts to login/logout instantly
 */
export default async function ServerNavbar() {
    // Get current path from headers (server-side)
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '/';
    const isTransparentBase = pathname === '/' || pathname === '/sobre';

    // SSR Auth Check - for instant render without loading spinner
    let initialUser: User | null = null;
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('auth_session');

        if (sessionCookie?.value) {
            const payload = await verifySession(sessionCookie.value);
            if (payload) {
                initialUser = {
                    name: payload.name as string,
                    surname: payload.surname as string,
                    email: payload.email as string
                };
            }
        }
    } catch (error) {
        // Fail silently - user will be treated as guest
    }

    return (
        <>
            <header
                id="main-header"
                className="absolute top-0 left-0 w-full z-[1000] flex justify-center px-4 ui-flex-center transition-all duration-300 mt-[19px]"
            >
                <div className="ui-container relative mx-auto flex h-[var(--navbar-height)] w-full max-w-7xl items-center justify-center px-4 sm:px-8 lg:px-12">
                    {/* Mobile Menu Button - Client Component for interactivity */}
                    <ClientMobileMenu navItems={navItems} initialUser={initialUser} />

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

                        {/* Desktop Auth Buttons - SSR initial + client reactivity */}
                        <ClientAuthButtons initialUser={initialUser} />
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
            </header>
        </>
    );
}
