// Plik: components/auth/AuthModal/SocialLogins.tsx
"use client";

import React from 'react';
import NewButton from '@/app/components/newButton';

const SocialLoginsComponent = () => {
    return (
        <>
            <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-900/10"></div>
                <span className="flex-shrink mx-4 text-xs font-bold uppercase text-[var(--muted-foreground)]">Or</span>
                <div className="flex-grow border-t border-gray-900/10"></div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
                <NewButton variant="login_google" className="w-full !py-3">
                    <i className="fa-brands fa-google mr-2"></i> Login with Google
                </NewButton>
                <NewButton variant="login_discord" className="w-full !py-3">
                    <i className="fa-brands fa-discord mr-2"></i> Login with Discord
                </NewButton>
            </div>
        </>
    );
};

export const SocialLogins = React.memo(SocialLoginsComponent);
