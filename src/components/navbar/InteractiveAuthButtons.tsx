"use client";

import React, { useState, useEffect } from 'react';
import NewButton from '@/app/components/newButton';
import AuthModal from '@/components/auth/AuthModal';
import { useQueryClient } from '@tanstack/react-query';

interface User {
    name?: string;
    surname?: string;
    email?: string;
}

interface SessionData {
    authenticated?: boolean;
    user?: User;
}

interface InteractiveAuthButtonsProps {
    initialUser?: User | null;
    mobile?: boolean;
}

/**
 * Interactive Auth Buttons - handles login/register modal and session state
 * Uses session-updated custom event for instant navbar updates after login/logout
 */
export default function InteractiveAuthButtons({ initialUser, mobile = false }: InteractiveAuthButtonsProps) {
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login');
    const queryClient = useQueryClient();

    // Session state - initialized from cache, updated via event
    const [session, setSession] = useState<SessionData | undefined>(() =>
        queryClient.getQueryData(['session'])
    );

    // Single event listener for session updates - most efficient approach
    useEffect(() => {
        const handleSessionUpdated = (event: Event) => {
            const { detail } = event as CustomEvent<SessionData>;
            if (detail) {
                setSession(detail);
            }
        };

        window.addEventListener('session-updated', handleSessionUpdated);
        return () => window.removeEventListener('session-updated', handleSessionUpdated);
    }, []);

    // Derive user from session or initial SSR data
    const user = session?.user || initialUser;
    const isAuthenticated = session?.authenticated || !!user;
    const fullName = user ? `${user.name || ''} ${user.surname || ''}`.trim().toUpperCase() : 'USER';

    const openAuthModal = (view: 'login' | 'register') => {
        setAuthModalView(view);
        setAuthModalOpen(true);
        if (mobile) {
            window.dispatchEvent(new CustomEvent('close-mobile-menu'));
        }
    };

    // Mobile View
    if (mobile) {
        if (isAuthenticated) {
            return (
                <NewButton
                    href="/dashboard"
                    variant="new_primary_rounded"
                    className="w-full uppercase font-bold text-lg"
                    icon={<i className="fa-duotone fa-user-circle"></i>}
                >
                    {fullName}
                </NewButton>
            );
        }

        return (
            <>
                <div className="flex flex-col gap-2 w-full">
                    <NewButton
                        onClick={() => openAuthModal('login')}
                        variant="new_secondary_no_border_on_idle"
                        className="w-full uppercase font-bold text-lg"
                        icon={<i className="fa-duotone fa-right-to-bracket"></i>}
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
                iconPosition="right"
                className="min-w-[180px] uppercase font-bold text-lg"
                icon={<i className="fa-duotone fa-user-circle text-xl"></i>}
            >
                {fullName}
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
                    icon={<i className="fa-duotone fa-right-to-bracket text-xl"></i>}
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
