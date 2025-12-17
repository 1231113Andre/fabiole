// Plik: components/auth/AuthModal/index.tsx
"use client";

import React, { useState } from 'react';
import { AuthModalHeader } from './AuthModalHeader';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { SocialLogins } from './SocialLogins';
import { ModalBase } from '@/components/common/ModalBase';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'login' | 'register';
}

const AuthModal = ({ isOpen, onClose, initialView = 'login' }: AuthModalProps) => {
    const [authType, setAuthType] = useState<'login' | 'register'>(initialView);

    React.useEffect(() => {
        if (isOpen) {
            setAuthType(initialView);
        }
    }, [isOpen, initialView]);

    const title =
        authType === 'login' ? (
            <span className="flex items-center">
                <i className="fa-duotone fa-right-to-bracket mr-3"></i> Sign In
            </span>
        ) : (
            <span className="flex items-center">
                <i className="fa-duotone fa-user-plus mr-3"></i> Sign Up
            </span>
        );

    return (
        <ModalBase
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            titleId="auth-modal-title"
            size="lg"
            zIndex="z-[9999]"
            className="[&_.p-6]:!py-4"
        >
            <AuthModalHeader authType={authType} setAuthType={setAuthType} />
            {authType === 'login' ? <LoginForm onClose={onClose} /> : <RegisterForm onClose={onClose} />}
            <SocialLogins />
        </ModalBase>
    );
};

export default AuthModal;
