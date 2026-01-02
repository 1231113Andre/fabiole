// Plik: components/auth/AuthModal/LoginForm.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useLogin } from '@/lib/react-query/hooks/useAuth';
import { useNotification } from '@/components/NotificationContext';
import NewButton from '@/app/components/newButton';
import { cn } from '@/lib/utils';
import { Input } from './Input';
import { LoadingSpinner } from '@/components/ui/spinner';

const loginSchema = z.object({
    email: z.string().email('Por favor, insere um email válido.'),
    password: z.string().min(1, 'Password é obrigatória.'),
});
type LoginSchema = z.infer<typeof loginSchema>;

// Format seconds as mm:ss
const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const LoginForm = ({ onClose }: { onClose: () => void }) => {
    const router = useRouter();
    const { notify } = useNotification();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false); // Instant loading state
    const loginMutation = useLogin();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    });

    // Countdown timer effect
    useEffect(() => {
        if (lockoutSeconds !== null && lockoutSeconds > 0) {
            timerRef.current = setInterval(() => {
                setLockoutSeconds(prev => {
                    if (prev === null || prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        clearErrors('root.serverError');
                        return null;
                    }
                    // Update error message with new countdown
                    setError('root.serverError', {
                        type: 'custom',
                        message: `Conta bloqueada. Tenta novamente em ${formatTime(prev - 1)}.`
                    });
                    return prev - 1;
                });
            }, 1000);

            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [lockoutSeconds, setError, clearErrors]);

    const onSubmit: SubmitHandler<LoginSchema> = (data) => {
        // Instant visual feedback
        setIsLoading(true);
        
        loginMutation.mutate(
            {
                email: data.email,
                password: data.password,
            },
            {
                onSuccess: () => {
                    // Close modal immediately
                    onClose();

                    // Brief notification then redirect
                    notify("A redirecionar para o teu painel...", "loading");
                    setTimeout(() => {
                        router.push("/dashboard");
                    }, 800);
                },
                onError: (error: any) => {
                    setIsLoading(false);
                    // Check if this is a lockout error with countdown
                    if (error.lockoutSeconds) {
                        setLockoutSeconds(error.lockoutSeconds);
                        setError('root.serverError', {
                            type: 'custom',
                            message: `Conta bloqueada. Tenta novamente em ${formatTime(error.lockoutSeconds)}.`
                        });
                    } else {
                        setError('root.serverError', { type: 'custom', message: error.message });
                    }
                }
            }
        );
    };

    const passwordIcon = (
        <button type="button" onClick={() => setIsPasswordVisible(p => !p)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer border-none bg-transparent">
            <i className={cn("fa-solid fa-fw", isPasswordVisible ? "fa-eye-slash" : "fa-eye")} style={{ fontSize: 14 }}></i>
        </button>
    );

    const isSubmitting = isLoading || loginMutation.isPending;
    const isLocked = lockoutSeconds !== null && lockoutSeconds > 0;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Input
                id="email" label="Email" type="email"
                registration={register('email')}
                placeholder="mail@example.com"
                error={errors.email}
                disabled={isSubmitting || isLocked} autoComplete="email"
            />
            <Input
                id="password" label="Password"
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder="********"
                registration={register('password')}
                error={errors.password}
                disabled={isSubmitting || isLocked}
                autoComplete="current-password"
                icon={passwordIcon}
            />
            <div className="flex justify-between items-center text-sm">
                <div></div>
                <a href="/forgot-password" className="font-medium text-[var(--primary)] hover:underline cursor-pointer">Esqueceste a password?</a>
            </div>
            {errors.root?.serverError && (
                <div className={cn(
                    "text-sm text-center font-medium p-3 rounded-lg",
                    isLocked
                        ? "bg-amber-950/50 border border-amber-500/30 text-amber-300"
                        : "text-destructive"
                )}>
                    {isLocked && <i className="fa-duotone fa-clock mr-2"></i>}
                    {errors.root.serverError.message}
                </div>
            )}
            <NewButton
                type="submit"
                className="w-full !py-3 !text-base !font-semibold"
                h='12'
                variant='new_primary_rounded'
                disabled={isSubmitting || isLocked}
            >
                {isSubmitting ? (
                    <LoadingSpinner size="h-6 w-6" color="text-primary-foreground" />
                ) : isLocked ? (
                    <>
                        <i className="fa-duotone fa-lock mr-2"></i>
                        Bloqueado ({formatTime(lockoutSeconds!)})
                    </>
                ) : (
                    <>
                        <i className="fa-duotone fa-right-to-bracket mr-2"></i>
                        Sign In
                    </>
                )}
            </NewButton>
        </form>
    );
};
