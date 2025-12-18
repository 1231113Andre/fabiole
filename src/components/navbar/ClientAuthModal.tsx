"use client";

import React, { useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';

interface ClientAuthModalProps {
    triggerId: string;
}

/**
 * Client Auth Modal - Only handles modal state
 * - Listens for clicks on SSR-rendered buttons
 * - No button rendering (prevents hydration mismatch)
 */
export default function ClientAuthModal({ triggerId }: ClientAuthModalProps) {
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login');

    React.useEffect(() => {
        const handleLoginClick = () => {
            setAuthModalView('login');
            setAuthModalOpen(true);
        };

        const handleRegisterClick = () => {
            setAuthModalView('register');
            setAuthModalOpen(true);
        };

        const loginBtn = document.getElementById(`${triggerId}-login-btn`);
        const registerBtn = document.getElementById(`${triggerId}-register-btn`);

        if (loginBtn) loginBtn.addEventListener('click', handleLoginClick);
        if (registerBtn) registerBtn.addEventListener('click', handleRegisterClick);

        return () => {
            if (loginBtn) loginBtn.removeEventListener('click', handleLoginClick);
            if (registerBtn) registerBtn.removeEventListener('click', handleRegisterClick);
        };
    }, [triggerId]);

    return (
        <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setAuthModalOpen(false)}
            initialView={authModalView}
        />
    );
}
