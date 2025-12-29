import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/security/session';
import { getServerPathname } from '@/lib/utils/pathname';
import ClientAuthButtons from './ClientAuthButtons';
import ClientMobileMenu from './ClientMobileMenu';
import { ASSETS } from '@/lib/constants/assets';

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
    // Get current path from headers (server-side) - Next.js 16 compatible
    const pathname = await getServerPathname();
    const isTransparentBase = pathname === '/' || pathname === '/sobre';

    // SSR Auth Check - for instant render without loading spinner
    let initialUser: User | null = null;
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('auth_session');

        console.log('[ServerNavbar] Cookie found:', !!sessionCookie?.value);

        if (sessionCookie?.value) {
            const payload = await verifySession(sessionCookie.value);
            console.log('[ServerNavbar] Payload verified:', !!payload);
            if (payload) {
                initialUser = {
                    name: payload.name as string,
                    surname: payload.surname as string,
                    email: payload.email as string
                };
            }
        }
    } catch (error) {
        console.error('[ServerNavbar] Error verifying session:', error);
        // Fail silently - user will be treated as guest
    }

    return (
        <>
            <header
                id="main-header"
                className="absolute top-0 left-0 w-full z-[1000] flex justify-center px-4 ui-flex-center transition-all duration-300 mt-2"
            >
                <div className="ui-container relative mx-auto flex h-20 w-full max-w-7xl items-center justify-center px-4 sm:px-8 lg:px-12">
                    {/* Mobile Menu Button - Client Component for interactivity */}
                    <ClientMobileMenu navItems={navItems} initialUser={initialUser} />

                    {/* Desktop: Centered group with logo, nav, and login */}
                    <div className="hidden w-full items-center justify-center gap-[5rem] lg:flex xl:gap-[6rem] 2xl:gap-[7rem]">
                        {/* Logo */}
                        <Link
                            href="/"
                            id="main-logo-link"
                            className="group flex items-center gap-0.75 transition-opacity duration-200 hover:opacity-90 py-2"
                            prefetch={true}
                        >
                            <div className="relative flex h-20 w-24 flex-shrink-0 items-center justify-center">
                                <Image
                                    id="main-logo-image"
                                    src={ASSETS.logo}
                                    alt="Fábio Lé Logo"
                                    width={600}
                                    height={600}
                                    quality={100}
                                    priority
                                    className="absolute left-1/2 top-[65%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-md max-w-none"
                                />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="font-montserrat text-2xl font-bold leading-none tracking-wide text-white drop-shadow-md whitespace-nowrap">
                                    FÁBIO LÉ
                                </span>
                                <span className="font-montserrat text-xs font-bold leading-none tracking-[0.35em] text-primary drop-shadow-sm mt-1 whitespace-nowrap">
                                    PERSONAL TRAINER
                                </span>
                            </div>
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
                        className="relative mx-auto flex h-12 w-12 items-center justify-center lg:hidden"
                        prefetch={true}
                    >
                        <Image
                            src={ASSETS.logo}
                            alt="Fábio Lé Logo"
                            width={64}
                            height={64}
                            quality={100}
                            priority
                            className="h-12 w-12 object-contain drop-shadow-md"
                        />
                        <div className="ml-3 flex flex-col justify-center">
                            <span className="font-montserrat text-lg font-bold leading-none tracking-wide text-white whitespace-nowrap">
                                FÁBIO LÉ
                            </span>
                        </div>
                    </Link>
                </div>
            </header>
        </>
    );
}
