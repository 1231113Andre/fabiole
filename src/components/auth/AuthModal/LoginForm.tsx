"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './Input';
import NewButton from '@/app/components/newButton';
import { LoadingSpinner } from '@/components/ui/spinner';
import { useLogin } from '@/lib/react-query/hooks/useAuth';
import { useNotification } from '@/components/NotificationContext';
import { cn } from '@/lib/utils';

// Import schemas
import { loginSchema, type LoginSchema } from './LoginForm/schemas/loginSchema';

// Import hooks
import { useLockoutTimer } from './LoginForm/hooks/useLockoutTimer';

// Import components
import { PasswordField } from './LoginForm/components/PasswordField';
import { RememberMeCheckbox } from './LoginForm/components/RememberMeCheckbox';

// Import utils
import { formatTime } from './LoginForm/utils/formatTime';

interface LoginFormProps {
    onClose: () => void;
    onForgotPassword?: () => void;
}

/**
 * Main login form component
 */
export const LoginForm = ({ onClose, onForgotPassword }: LoginFormProps) => {
    const router = useRouter();
    const { notify } = useNotification();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const loginMutation = useLogin();

    const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    });

    const [lockoutSeconds, setLockoutSeconds] = useLockoutTimer(setError, clearErrors);

    // Handle form submission
    const onSubmit: SubmitHandler<LoginSchema> = useCallback(async (data) => {
        setIsLoading(true);

        try {
            await loginMutation.mutateAsync({
                email: data.email,
                password: data.password,
                rememberMe: data.rememberMe || false,
            });

            // Close modal immediately
            onClose();

            // Brief notification then redirect
            notify("A redirecionar para o teu painel...", "loading");
            setTimeout(() => {
                router.push("/dashboard");
            }, 800);
        } catch (error: any) {
            // Check if this is a lockout error with countdown
            if (error.lockoutSeconds) {
                setLockoutSeconds(error.lockoutSeconds);
                setError('root.serverError', {
                    type: 'custom',
                    message: `Conta bloqueada. Tenta novamente em ${formatTime(error.lockoutSeconds)}.`
                });
            } else {
                setError('root.serverError', {
                    type: 'custom',
                    message: error.message || 'Login failed'
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [loginMutation, onClose, setError, setLockoutSeconds]);

    // Toggle password visibility
    const togglePasswordVisibility = useCallback(() => {
        setIsPasswordVisible(prev => !prev);
    }, []);

    const isSubmitting = isLoading || loginMutation.isPending;
    const isLocked = lockoutSeconds !== null && lockoutSeconds > 0;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Input
                id="email"
                label="Email"
                type="email"
                registration={register('email')}
                placeholder="mail@example.com"
                error={errors.email}
                disabled={isSubmitting || isLocked}
                autoComplete="email"
            />
            <PasswordField
                register={register}
                errors={errors}
                isPasswordVisible={isPasswordVisible}
                onToggleVisibility={togglePasswordVisibility}
                disabled={isSubmitting || isLocked}
            />

            <div className="flex justify-between items-center text-sm">
                <RememberMeCheckbox
                    register={register}
                    disabled={isSubmitting || isLocked}
                />
                {onForgotPassword && (
                    <button
                        type="button"
                        onClick={onForgotPassword}
                        disabled={isSubmitting || isLocked}
                        className="font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] cursor-pointer bg-transparent border-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Esqueceste a password?
                    </button>
                )}
            </div>
            {errors.root?.serverError && (
                <div className={cn(
                    "text-sm text-center font-medium p-3 rounded-lg whitespace-pre-line",
                    isLocked
                        ? "bg-amber-950/50 border border-amber-500/30 text-amber-300"
                        : "text-destructive"
                )}>
                    {isLocked && <i className="fa-duotone fa-clock mr-2" />}
                    {errors.root.serverError.message}
                </div>
            )}
            <NewButton
                type="submit"
                className="w-full !py-3 !text-base !font-semibold"
                h="12"
                variant="new_primary_rounded"
                disabled={isSubmitting || isLocked}
            >
                {isSubmitting ? (
                    <LoadingSpinner size="h-6 w-6" color="text-primary-foreground" />
                ) : isLocked ? (
                    <>
                        <i className="fa-duotone fa-lock mr-2" />
                        Bloqueado ({formatTime(lockoutSeconds!)})
                    </>
                ) : (
                    <>
                        <i className="fa-duotone fa-right-to-bracket mr-2" />
                        Sign In
                    </>
                )}
            </NewButton>
        </form>
    );
};
