"use client";

import React, { useCallback } from 'react';
import { VerificationCodeInput } from '../../VerificationCodeInput';
import { LoadingSpinner } from '@/components/ui/spinner';
import NewButton from '@/app/components/newButton';
import type { RegisterSchema } from '../schemas/registerSchema';

interface VerificationStepProps {
    email: string;
    isLoading: boolean;
    verifyError?: string;
    timeLeft: number;
    onVerifyCode: (code: string) => Promise<void>;
    onResend: () => Promise<void>;
    onBack: () => void;
}

/**
 * Verification step component for email code verification
 */
export const VerificationStep = React.memo<VerificationStepProps>(({
    email,
    isLoading,
    verifyError,
    timeLeft,
    onVerifyCode,
    onResend,
    onBack,
}) => {
    const handleResendClick = useCallback(() => {
        if (timeLeft > 0 || isLoading) return;
        onResend();
    }, [timeLeft, isLoading, onResend]);

    return (
        <div className="space-y-6 py-4">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-envelope text-2xl text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                    Check your email
                </h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                    We sent a 6-digit code to<br />
                    <span className="font-medium text-white">{email}</span>
                </p>
            </div>

            {/* Code Input */}
            <VerificationCodeInput
                onComplete={onVerifyCode}
                disabled={isLoading}
                error={verifyError}
            />

            {/* Loading indicator */}
            {isLoading && (
                <div className="flex justify-center">
                    <LoadingSpinner size="h-6 w-6" color="text-primary" />
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
                <div className="flex justify-center">
                    <NewButton
                        onClick={handleResendClick}
                        disabled={isLoading || timeLeft > 0}
                        variant="new_destructive_no_bg_rounded"
                        className="bg-transparent"
                        h="10"
                    >
                        {timeLeft > 0 ? (
                            `Resend code in ${timeLeft}s`
                        ) : (
                            "Didn't receive the code? Resend"
                        )}
                    </NewButton>
                </div>
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="text-sm text-[var(--muted-foreground)] hover:text-white disabled:opacity-50"
                >
                    <i className="fa-solid fa-arrow-left mr-2" />
                    Back to form
                </button>
            </div>
        </div>
    );
});

VerificationStep.displayName = 'VerificationStep';

