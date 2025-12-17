// Plik: components/auth/AuthModal/AuthModalHeader.tsx
"use client";

import React from 'react';
import NewButton from '@/app/components/newButton';
import { cn } from '@/lib/utils';

type AuthModalHeaderProps = {
    authType: 'login' | 'register';
    setAuthType: (type: 'login' | 'register') => void;
};

const AuthModalHeaderComponent = ({ authType, setAuthType }: AuthModalHeaderProps) => {
    return (
        <>
            <header className="relative flex justify-center items-center mb-6 font-montserrat">
                <div className="flex items-center gap-4 w-full">
                    <NewButton
                        variant={authType === 'login' ? 'new_primary_rounded' : 'new_primary_no_bg_rounded'}
                        onClick={() => setAuthType('login')}
                        className={cn(
                            "flex-1 justify-center text-lg font-bold uppercase",
                            authType === 'login' ? "!text-white" : "!text-gray-100"
                        )}
                    >
                        <i className="fa-duotone fa-lock-keyhole-open cursor-pointer mr-2"></i> Login
                    </NewButton>
                    <NewButton
                        variant={authType === 'register' ? 'new_primary_rounded' : 'new_primary_no_bg_rounded'}
                        onClick={() => setAuthType('register')}
                        className={cn(
                            "flex-1 justify-center text-lg font-bold uppercase",
                            authType === 'register' ? "!text-white" : "!text-gray-100"
                        )}
                    >
                        <i className="fa-duotone fa-user-plus cursor-pointer mr-2"></i> Register
                    </NewButton>
                </div>
            </header>
            <div className="w-full mb-6 border-t border-gray-900/10" />
        </>
    );
};
export const AuthModalHeader = React.memo(AuthModalHeaderComponent);
