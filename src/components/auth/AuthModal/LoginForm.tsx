// Plik: components/auth/AuthModal/LoginForm.tsx
"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useLogin } from '@/lib/react-query/hooks/useAuth';
// import { useNotification } from '@/contexts/NotificationContext'; // Fabiole doesn't have this
import NewButton from '@/app/components/newButton';
import { cn } from '@/lib/utils';
import { Input } from './Input';
import { InfoBox } from '@/components/ui/infobox';
import { LoadingSpinner } from '@/components/ui/spinner';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(1, 'Password is required.'),
    // rememberMe: z.boolean().optional(), // Fabiole doesn't seem to use rememberMe in useLogin
});
type LoginSchema = z.infer<typeof loginSchema>;

export const LoginForm = ({ onClose }: { onClose: () => void }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const loginMutation = useLogin();

    // Simple toast replacement (since we couldn't easily verify ToastContainer context)
    // In a real integration, we should use the existing Toast system.
    // For now, we utilize error/success states within the form or just rely on mutation side effects.

    const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit: SubmitHandler<LoginSchema> = (data) => {
        loginMutation.mutate(
            {
                email: data.email,
                password: data.password,
            },
            {
                onSuccess: () => {
                    // Success handling - close modal first so navbar updates immediately
                    onClose();
                    // Wait 2 seconds before redirecting to dashboard
                    setTimeout(() => {
                        window.location.href = "/dashboard";
                    }, 2000);
                },
                onError: (error) => {
                    setError('root.serverError', { type: 'custom', message: error.message });
                }
            }
        );
    };

    const passwordIcon = (
        <button type="button" onClick={() => setIsPasswordVisible(p => !p)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer border-none bg-transparent">
            <i className={cn("fa-solid fa-fw", isPasswordVisible ? "fa-eye-slash" : "fa-eye")} style={{ fontSize: 14 }}></i>
        </button>
    );

    const isSubmitting = loginMutation.isPending;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Input
                id="email" label="Email address" type="email"
                registration={register('email')}
                placeholder="mail@example.com"
                error={errors.email}
                disabled={isSubmitting} autoComplete="email"
            />
            <Input
                id="password" label="Password"
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder="********"
                registration={register('password')}
                error={errors.password}
                disabled={isSubmitting}
                autoComplete="current-password"
                icon={passwordIcon}
            />
            <div className="flex justify-between items-center text-sm">
                {/* Remove Remember Me as it's not in fabiole useLogin */}
                <div></div>
                <a href="/forgot-password" className="font-medium text-[var(--primary)] hover:underline cursor-pointer">Forgot password?</a>
            </div>
            {errors.root?.serverError && (
                <InfoBox variant="destructive" className="text-sm text-center">
                    <div className="flex items-center justify-center gap-2">
                        <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 14 }}></i>
                        <span>{errors.root.serverError.message}</span>
                    </div>
                </InfoBox>
            )}
            <NewButton type="submit" className="w-full !py-3 !text-base !font-semibold" h='12' variant='new_primary_rounded' disabled={isSubmitting}>
                {isSubmitting ? (
                    <LoadingSpinner size="h-6 w-6" color="text-primary-foreground" />
                ) : (
                    'Sign In'
                )}
            </NewButton>
        </form>
    );
};
