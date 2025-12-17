'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Client Component that manages navbar positioning based on current route
 * Ensures banner extends behind navbar on home page even after client-side navigation
 */
export default function NavbarPositionHandler() {
    const pathname = usePathname();

    useLayoutEffect(() => {
        const navbar = document.getElementById('main-header');
        if (!navbar) return;

        const isHome = pathname === '/';

        if (isHome) {
            // On home page - navbar should be absolute so banner extends behind it
            navbar.classList.remove('relative', 'mt-[19px]');
            navbar.classList.add('absolute', 'left-0', 'right-0', 'top-[19px]');
            navbar.setAttribute('data-is-home', 'true');
        } else {
            // On other pages - navbar should be relative
            navbar.classList.remove('absolute', 'left-0', 'right-0', 'top-[19px]');
            navbar.classList.add('relative', 'mt-[19px]');
            navbar.setAttribute('data-is-home', 'false');
        }
    }, [pathname]);

    return null;
}
