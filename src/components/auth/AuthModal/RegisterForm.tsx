"use client";

import React, { useState, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './Input';
import NewButton from '@/app/components/newButton';
import { LoadingSpinner } from '@/components/ui/spinner';
import { useNotification } from '@/components/NotificationContext';
import { useCsrfToken, getCsrfToken } from '@/lib/react-query/hooks/useCsrfToken';

// Import schemas
import { registerSchema, type RegisterSchema } from './RegisterForm/schemas/registerSchema';

// Import hooks
import { useCodeTimer } from './RegisterForm/hooks/useCodeTimer';
import { useVerificationCode } from './RegisterForm/hooks/useVerificationCode';

// Import components
import { VerificationStep } from './RegisterForm/components/VerificationStep';
import { PersonalInfoFields } from './RegisterForm/components/PersonalInfoFields';
import { PasswordField } from './RegisterForm/components/PasswordField';
import { BirthDateGenderFields } from './RegisterForm/components/BirthDateGenderFields';
import { TermsCheckbox } from './RegisterForm/components/TermsCheckbox';

type Step = 'form' | 'verify';

interface RegisterFormProps {
    onClose: () => void;
}

/**
 * Create headers with CSRF token
 */
function createHeaders(): HeadersInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };
    const csrfToken = getCsrfToken();
    if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
    }
    return headers;
}

/**
 * Main registration form component
 * Orchestrates the registration flow with form and verification steps
 */
export const RegisterForm = ({ onClose }: RegisterFormProps) => {
    const { notify } = useNotification();
    // Ensure CSRF token is fetched when modal opens (so it's ready for verify step and register call)
    useCsrfToken();
    const [step, setStep] = useState<Step>('form');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<RegisterSchema | null>(null);
    const [timeLeft, startTimer] = useCodeTimer(60);

    const { register, handleSubmit, formState: { errors }, setError } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
    });

    // Verification code hook
    const {
        isLoading: isVerificationLoading,
        verifyError,
        handleVerifyCode,
        handleResend,
    } = useVerificationCode({ formData, onClose });

    // Handle form submission - send verification code
    const onSubmit: SubmitHandler<RegisterSchema> = useCallback(async (data) => {
        setIsLoading(true);
        setFormData(data);

        try {
            const response = await fetch('/api/auth/send-verification', {
                method: 'POST',
                headers: createHeaders(),
                body: JSON.stringify({
                    email: data.email,
                    firstName: data.firstName,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to send verification code');
            }

            setStep('verify');
            startTimer(60);
            notify('Código de verificação enviado para o seu e-mail!', 'success');
        } catch (error: any) {
            setError('root.serverError', {
                type: 'custom',
                message: error.message || 'Falha ao enviar o código de verificação'
            });
        } finally {
            setIsLoading(false);
        }
    }, [setError, notify, startTimer]);

    // Handle verification code
    const onVerifyCode = useCallback(async (code: string) => {
        await handleVerifyCode(code);
    }, [handleVerifyCode]);

    // Handle resend code
    const onResend = useCallback(async () => {
        await handleResend();
        startTimer(60);
    }, [handleResend, startTimer]);

    // Handle back to form
    const handleBack = useCallback(() => {
        setStep('form');
        // Clear server errors when going back
        setError('root.serverError', { message: '' });
    }, [setError]);

    // Toggle password visibility
    const togglePasswordVisibility = useCallback(() => {
        setIsPasswordVisible(prev => !prev);
    }, []);

    // Combined loading state
    const isFormLoading = isLoading || isVerificationLoading;

    // Verification Step UI
    if (step === 'verify' && formData) {
        return (
            <VerificationStep
                email={formData.email}
                isLoading={isVerificationLoading}
                verifyError={verifyError}
                timeLeft={timeLeft}
                onVerifyCode={onVerifyCode}
                onResend={onResend}
                onBack={handleBack}
            />
        );
    }

    // Registration Form UI
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <PersonalInfoFields
                register={register}
                errors={errors}
                disabled={isFormLoading}
            />

            <Input
                id="email"
                label="Endereço de e-mail"
                type="email"
                registration={register('email')}
                placeholder="email@exemplo.com"
                error={errors.email}
                disabled={isFormLoading}
                autoComplete="email"
            />

            <PasswordField
                register={register}
                errors={errors}
                isPasswordVisible={isPasswordVisible}
                onToggleVisibility={togglePasswordVisibility}
                disabled={isFormLoading}
            />

            <BirthDateGenderFields
                register={register}
                errors={errors}
                disabled={isFormLoading}
            />

            <TermsCheckbox
                register={register}
                errors={errors}
                disabled={isFormLoading}
            />

            {errors.root?.serverError && (
                <p className="text-sm text-center text-destructive font-medium whitespace-pre-line">
                    {errors.root.serverError.message}
                </p>
            )}

            <NewButton
                type="submit"
                h="12"
                variant="new_primary_rounded"
                className="w-full !py-3 !text-base !font-semibold"
                disabled={isFormLoading}
            >
                {isFormLoading ? (
                    <LoadingSpinner size="h-6 w-6" color="text-primary-foreground" />
                ) : (
                    <>
                        <i className="fa-duotone fa-user-plus mr-2" />
                        Criar conta
                    </>
                )}
            </NewButton>
        </form>
    );
};
