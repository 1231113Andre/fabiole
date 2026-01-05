"use client";

import React, { useState } from 'react';
import NewButton from '@/app/components/newButton';
import AuthModal from '@/components/auth/AuthModal';
import { useSession } from '@/lib/react-query/hooks/useAuth';

interface User {
    name?: string;
    surname?: string;
    email?: string;
    avatarUrl?: string;
}

interface ClientAuthButtonsProps {
    initialUser?: User | null;
    mobile?: boolean;
}

/**
 * Client Auth Buttons - Hybrid SSR + Client-side reactivity
 * - SSR: Uses initialUser for instant render (no loading spinner)
 * - Client: useSession hook reacts to login/logout instantly
 */
export default function ClientAuthButtons({ initialUser, mobile = false }: ClientAuthButtonsProps) {
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login');

    // Use reactive session hook with SSR data as placeholder
    const { data: session } = useSession({
        initialData: initialUser ? { authenticated: true, user: initialUser as any } : { authenticated: false }
    });

    const user = session?.user;
    const isAuthenticated = session?.authenticated && !!user;

    const openAuthModal = (view: 'login' | 'register') => {
        setAuthModalView(view);
        setAuthModalOpen(true);
        if (mobile) {
            const event = new CustomEvent('close-mobile-menu');
            window.dispatchEvent(event);
        }
    };

    // Build user display name - PREFER EMAIL
    const displayName = user?.email || 'USER';

    if (mobile) {
        if (isAuthenticated) {
            return (
                <NewButton
                    href="/dashboard"
                    variant="new_primary_rounded"
                    className="w-full text-lg font-bold truncate"
                    icon={<i className="fa-duotone fa-user-tie text-xl"></i>}
                >
                    <span className="truncate">{displayName}</span>
                </NewButton>
            )
        }

        return (
            <>
                <div className="flex flex-col gap-2 w-full">
                    <NewButton
                        onClick={() => openAuthModal('login')}
                        variant="new_secondary_no_border_on_idle"
                        className="w-full uppercase font-bold text-lg"
                        icon={<i className="fa-duotone fa-lock-keyhole-open"></i>}
                    >
                        Login
                    </NewButton>
                    <NewButton
                        onClick={() => openAuthModal('register')}
                        variant="new_primary_rounded"
                        className="w-full uppercase font-bold text-lg"
                        icon={<i className="fa-duotone fa-user-plus"></i>}
                    >
                        Register
                    </NewButton>
                </div>
                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                    initialView={authModalView}
                />
            </>
        );
    }

    // Desktop View
    if (isAuthenticated) {
        return (
            <NewButton
                href="/dashboard"
                variant="new_primary_rounded"
                iconPosition="left"
                className="min-w-fit px-4 text-base font-bold"
                icon={<i className="fa-duotone fa-chart-user text-lg ml-2"></i>}
            >
                {displayName}
            </NewButton>
        );
    }

    return (
        <>
            <div className="flex items-center gap-3">
                <NewButton
                    onClick={() => openAuthModal('login')}
                    variant="new_primary_rounded"
                    iconPosition="right"
                    className="w-[140px] min-w-[140px] uppercase font-bold text-lg"
                    icon={<i className="fa-duotone fa-lock-keyhole-open"></i>}
                >
                    Login
                </NewButton>
                <span className="text-lg font-bold text-white">|</span>
                <NewButton
                    onClick={() => openAuthModal('register')}
                    variant="new_primary_rounded"
                    iconPosition="right"
                    className="w-[140px] min-w-[140px] uppercase font-bold text-lg"
                    icon={<i className="fa-duotone fa-user-plus"></i>}
                >
                    Register
                </NewButton>
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialView={authModalView}
            />
        </>
    );
}
