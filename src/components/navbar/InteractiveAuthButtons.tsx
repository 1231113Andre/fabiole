"use client";

import React, { useState } from 'react';
import NewButton from '@/app/components/newButton';
import AuthModal from '@/components/auth/AuthModal';
import { useSession } from '@/lib/react-query/hooks/useAuth';

interface User {
    name?: string;
    surname?: string;
    email?: string;
}

interface InteractiveAuthButtonsProps {
    initialUser?: User | null;
    mobile?: boolean;
}

export default function InteractiveAuthButtons({ initialUser, mobile = false }: InteractiveAuthButtonsProps) {
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login');

    // Use initialUser from SSR if available, otherwise fetch client-side
    // This ensures no loading spinner is shown if SSR data is present
    const { data: sessionData, isLoading } = useSession({
        enabled: !initialUser // Only fetch if no initial user
    });

    const user = sessionData?.user || initialUser;
    const isAuthenticated = !!user;

    const openAuthModal = (view: 'login' | 'register') => {
        setAuthModalView(view);
        setAuthModalOpen(true);
        if (mobile) {
            const event = new CustomEvent('close-mobile-menu');
            window.dispatchEvent(event);
        }
    };

    // Build user display name
    const fullName = user ? `${user.name || ''} ${user.surname || ''}`.trim().toUpperCase() : 'USER';

    // Show loading state only if no initial user AND fetching
    if (isLoading && initialUser === undefined) {
        // Return placeholder or nothing instead of spinner to match "immediate" requirement
        return null;
    }

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
            )
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
