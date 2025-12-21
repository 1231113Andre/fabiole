// Plik: components/auth/AuthModal/RegisterForm.tsx
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useNotification } from '@/components/NotificationContext';
import { useRegister } from '@/lib/react-query/hooks/useAuth';
import NewButton from '@/app/components/newButton';
import { cn } from '@/lib/utils';
import { Input } from './Input';
import { LoadingSpinner } from '@/components/ui/spinner';
import { VerificationCodeInput } from './VerificationCodeInput';

// Adapted Schema for Fabiole: firstName, lastName, email, password, birthDate
const registerSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters long.')
        .refine((password) => /[A-Z]/.test(password), 'Password must contain at least one uppercase letter.')
        .refine((password) => /[a-z]/.test(password), 'Password must contain at least one lowercase letter.')
        .refine((password) => /[0-9]/.test(password), 'Password must contain at least one number.'),
    birthDate: z.string().min(1, "Birth date is required"),
    terms: z.boolean().refine(val => val === true, {
        message: 'You must agree to the terms of service.',
    }),
});
type RegisterSchema = z.infer<typeof registerSchema>;

type Step = 'form' | 'verify';

export const RegisterForm = ({ onClose }: { onClose: () => void }) => {
    const router = useRouter();
    const { notify } = useNotification();
    const registerMutation = useRegister();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [step, setStep] = useState<Step>('form');
    const [isLoading, setIsLoading] = useState(false);
    const [verifyError, setVerifyError] = useState<string | undefined>();
    const [formData, setFormData] = useState<RegisterSchema | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);

    // Timer logic
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    const { register, handleSubmit, formState: { errors }, setError, getValues } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
    });

    // Helper to get cookie by name
    const getCookie = (name: string): string | null => {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
    };

    // Step 1: Send verification code
    const onSubmit: SubmitHandler<RegisterSchema> = async (data) => {
        setIsLoading(true);
        setFormData(data);

        try {
            const csrfToken = getCookie('csrf-token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            if (csrfToken) {
                headers['X-CSRF-Token'] = csrfToken;
            }

            const response = await fetch('/api/auth/send-verification', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    email: data.email,
                    firstName: data.firstName,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to send verification code');
            }

            // Move to verification step
            setStep('verify');
            setTimeLeft(60);
            notify('Verification code sent to your email!', 'success');
        } catch (error: any) {
            setError('root.serverError', {
                type: 'custom',
                message: error.message || 'Failed to send verification code'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify code and complete registration
    const handleVerifyCode = useCallback(async (code: string) => {
        if (!formData) return;

        setIsLoading(true);
        setVerifyError(undefined);

        try {
            const csrfToken = getCookie('csrf-token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            if (csrfToken) {
                headers['X-CSRF-Token'] = csrfToken;
            }

            // First verify the code
            const verifyResponse = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    email: formData.email,
                    code,
                }),
            });

            const verifyResult = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyResult.success) {
                throw new Error(verifyResult.error || 'Invalid verification code');
            }

            // Code verified! Now complete registration
            await registerMutation.mutateAsync({
                name: formData.firstName,
                surname: formData.lastName,
                email: formData.email,
                password: formData.password,
                birth: formData.birthDate,
            });

            // Success handled by hook (session update, notification)
            onClose();

            // Redirect after brief delay
            setTimeout(() => {
                notify("Redirecting to your dashboard...", "loading");
                setTimeout(() => {
                    router.push("/dashboard");
                }, 2000);
            }, 1500);

        } catch (error: any) {
            setVerifyError(error.message || 'Verification failed');
            setIsLoading(false);
        }
    }, [formData, notify, onClose, router]);

    // Go back to form
    const handleBack = () => {
        setStep('form');
        setVerifyError(undefined);
    };

    // Resend code
    const handleResend = async () => {
        if (!formData) return;

        setIsLoading(true);
        setVerifyError(undefined);

        try {
            const csrfToken = getCookie('csrf-token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            if (csrfToken) {
                headers['X-CSRF-Token'] = csrfToken;
            }

            const response = await fetch('/api/auth/send-verification', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    email: formData.email,
                    firstName: formData.firstName,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to resend code');
            }

            notify('New code sent!', 'success');
            setTimeLeft(60);
        } catch (error: any) {
            setVerifyError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const passwordIcon = (
        <button type="button" onClick={() => setIsPasswordVisible(p => !p)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer border-none bg-transparent">
            <i className={cn("fa-solid fa-fw", isPasswordVisible ? "fa-eye-slash" : "fa-eye")} style={{ fontSize: 14 }}></i>
        </button>
    );

    // Verification Step UI
    if (step === 'verify') {
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
                        <span className="font-medium text-white">{formData?.email}</span>
                    </p>
                </div>

                {/* Code Input */}
                <VerificationCodeInput
                    onComplete={handleVerifyCode}
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
                            onClick={handleResend}
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
                        onClick={handleBack}
                        disabled={isLoading}
                        className="text-sm text-[var(--muted-foreground)] hover:text-white disabled:opacity-50"
                    >
                        <i className="fa-solid fa-arrow-left mr-2" />
                        Back to form
                    </button>
                </div>
            </div>
        );
    }

    // Registration Form UI
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div className="flex gap-2">
                <Input
                    id="firstName" label="First Name" type="text"
                    registration={register('firstName')}
                    placeholder="John"
                    error={errors.firstName}
                    disabled={isLoading} autoComplete="given-name"
                    className="flex-1"
                />
                <Input
                    id="lastName" label="Last Name" type="text"
                    registration={register('lastName')}
                    placeholder="Doe"
                    error={errors.lastName}
                    disabled={isLoading} autoComplete="family-name"
                    className="flex-1"
                />
            </div>

            <Input
                id="email" label="Email address" type="email"
                registration={register('email')}
                placeholder="mail@example.com"
                error={errors.email}
                disabled={isLoading} autoComplete="email"
            />
            <Input
                id="password" label="Password"
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder="********"
                registration={register('password')}
                error={errors.password}
                disabled={isLoading}
                autoComplete="new-password"
                icon={passwordIcon}
            />
            <Input
                id="birthDate" label="Birth Date" type="date"
                registration={register('birthDate')}
                error={errors.birthDate}
                disabled={isLoading}
            />

            <div>
                <div className="flex items-start gap-3 mt-2">
                    <input id="terms" type="checkbox" {...register('terms')} className="w-4 h-4 flex-shrink-0 mt-0.5 rounded border-[var(--border)] bg-[var(--muted)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-[var(--background)] cursor-pointer" disabled={isLoading} />
                    <label htmlFor="terms" className="text-sm select-none text-[var(--muted-foreground)] cursor-pointer">
                        I agree to the <a href="/terms" className="font-medium text-[var(--primary)] hover:underline">terms of service</a> and <a href="/privacy" className="font-medium text-[var(--primary)] hover:underline">privacy policy</a>.
                    </label>
                </div>
                {errors.terms && <p className="mt-1 text-xs text-destructive">{errors.terms.message}</p>}
            </div>
            {errors.root?.serverError && (
                <p className="text-sm text-center text-destructive font-medium">
                    {errors.root.serverError.message}
                </p>
            )}
            <NewButton type="submit" h='12' variant='new_primary_rounded' className="w-full !py-3 !text-base !font-semibold" disabled={isLoading}>
                {isLoading ? (
                    <LoadingSpinner size="h-6 w-6" color="text-primary-foreground" />
                ) : (
                    'Sign Up'
                )}
            </NewButton>
        </form>
    );
};
