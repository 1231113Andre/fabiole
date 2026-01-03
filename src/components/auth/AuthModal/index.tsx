// Plik: components/auth/AuthModal/index.tsx
"use client";

import React, { useState } from 'react';
import { AuthModalHeader } from './AuthModalHeader';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { SocialLogins } from './SocialLogins';
import { ModalBase } from '@/components/common/ModalBase';

type AuthView = 'login' | 'register' | 'forgot-password';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'login' | 'register';
}

const AuthModal = ({ isOpen, onClose, initialView = 'login' }: AuthModalProps) => {
    const [authType, setAuthType] = useState<AuthView>(initialView);

    React.useEffect(() => {
        if (isOpen) {
            setAuthType(initialView);
        }
    }, [isOpen, initialView]);

    const getTitle = () => {
        switch (authType) {
            case 'login':
                return (
                    <span className="flex items-center">
                        <i className="fa-duotone fa-right-to-bracket mr-3"></i> Sign In
                    </span>
                );
            case 'register':
                return (
                    <span className="flex items-center">
                        <i className="fa-duotone fa-user-plus mr-3"></i> Sign Up
                    </span>
                );
            case 'forgot-password':
                return (
                    <span className="flex items-center">
                        <i className="fa-duotone fa-key mr-3"></i> Recuperar Password
                    </span>
                );
        }
    };

    const handleForgotPassword = () => {
        setAuthType('forgot-password');
    };

    const handleBackToLogin = () => {
        setAuthType('login');
    };

    return (
        <ModalBase
            isOpen={isOpen}
            onClose={onClose}
            title={getTitle()}
            titleId="auth-modal-title"
            size="lg"
            zIndex="z-[9999]"
            className="[&_.p-6]:!py-4 !bg-[#1c2434] !text-white !border-[#2E3A47] !shadow-2xl"
        >
            {authType !== 'forgot-password' && (
                <AuthModalHeader 
                    authType={authType as 'login' | 'register'} 
                    setAuthType={(type) => setAuthType(type)} 
                />
            )}
            
            {authType === 'login' && (
                <LoginForm onClose={onClose} onForgotPassword={handleForgotPassword} />
            )}
            {authType === 'register' && (
                <RegisterForm onClose={onClose} />
            )}
            {authType === 'forgot-password' && (
                <ForgotPasswordForm onBack={handleBackToLogin} onClose={onClose} />
            )}
            
            {authType !== 'forgot-password' && <SocialLogins />}
        </ModalBase>
    );
};

export default AuthModal;
