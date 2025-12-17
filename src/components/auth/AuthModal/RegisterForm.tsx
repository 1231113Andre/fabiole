// Plik: components/auth/AuthModal/RegisterForm.tsx
"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useRegister } from '@/lib/react-query/hooks/useAuth';
import NewButton from '@/app/components/newButton';
import { cn } from '@/lib/utils';
import { Input } from './Input';
// import { InfoBox } from '@/components/ui/infobox'; // Removed unused import
import { LoadingSpinner } from '@/components/ui/spinner';

// Adapted Schema for Fabiole: firstName, lastName, email, password, birthDate
const registerSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters long.'), // fabiole requires 6 checks
    birthDate: z.string().min(1, "Birth date is required"),
    terms: z.boolean().refine(val => val === true, {
        message: 'You must agree to the terms of service.',
    }),
});
type RegisterSchema = z.infer<typeof registerSchema>;

export const RegisterForm = ({ onClose }: { onClose: () => void }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const registerMutation = useRegister();

    const { register, handleSubmit, formState: { errors }, setError } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit: SubmitHandler<RegisterSchema> = (data) => {
        registerMutation.mutate(
            {
                name: data.firstName,
                surname: data.lastName,
                email: data.email,
                password: data.password,
                birth: data.birthDate,
            },
            {
                onSuccess: () => {
                    onClose();
                    // Alert or toast success
                    alert("Account created! Please check your email.");
                },
                onError: (error: any) => {
                    const message = error.message || "Registration failed";
                    setError('root.serverError', { type: 'custom', message });
                }
            }
        );
    };

    const passwordIcon = (
        <button type="button" onClick={() => setIsPasswordVisible(p => !p)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer border-none bg-transparent">
            <i className={cn("fa-solid fa-fw", isPasswordVisible ? "fa-eye-slash" : "fa-eye")} style={{ fontSize: 14 }}></i>
        </button>
    );

    const isSubmitting = registerMutation.isPending;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div className="flex gap-2">
                <Input
                    id="firstName" label="First Name" type="text"
                    registration={register('firstName')}
                    placeholder="John"
                    error={errors.firstName}
                    disabled={isSubmitting} autoComplete="given-name"
                    className="flex-1"
                />
                <Input
                    id="lastName" label="Last Name" type="text"
                    registration={register('lastName')}
                    placeholder="Doe"
                    error={errors.lastName}
                    disabled={isSubmitting} autoComplete="family-name"
                    className="flex-1"
                />
            </div>

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
                autoComplete="new-password"
                icon={passwordIcon}
            />
            <Input
                id="birthDate" label="Birth Date" type="date"
                registration={register('birthDate')}
                error={errors.birthDate}
                disabled={isSubmitting}
            />

            <div>
                <div className="flex items-start gap-3 mt-2">
                    <input id="terms" type="checkbox" {...register('terms')} className="w-4 h-4 flex-shrink-0 mt-0.5 rounded border-[var(--border)] bg-[var(--muted)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-[var(--background)] cursor-pointer" disabled={isSubmitting} />
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
            <NewButton type="submit" h='12' variant='new_primary_rounded' className="w-full !py-3 !text-base !font-semibold" disabled={isSubmitting}>
                {isSubmitting ? (
                    <LoadingSpinner size="h-6 w-6" color="text-primary-foreground" />
                ) : (
                    'Sign Up'
                )}
            </NewButton>
        </form>
    );
};
