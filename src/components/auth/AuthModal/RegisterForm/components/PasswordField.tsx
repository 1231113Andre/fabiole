"use client";

import React, { useMemo } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '../../Input';
import { cn } from '@/lib/utils';
import type { RegisterSchema } from '../schemas/registerSchema';

interface PasswordFieldProps {
    register: UseFormRegister<RegisterSchema>;
    errors: FieldErrors<RegisterSchema>;
    isPasswordVisible: boolean;
    onToggleVisibility: () => void;
    disabled?: boolean;
}

/**
 * Password field component with visibility toggle
 */
export const PasswordField = React.memo<PasswordFieldProps>(({
    register,
    errors,
    isPasswordVisible,
    onToggleVisibility,
    disabled = false,
}) => {
    const passwordIcon = useMemo(() => (
        <button
            type="button"
            onClick={onToggleVisibility}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer border-none bg-transparent"
        >
            <i
                className={cn("fa-solid fa-fw", isPasswordVisible ? "fa-eye-slash" : "fa-eye")}
                style={{ fontSize: 14 }}
            />
        </button>
    ), [isPasswordVisible, onToggleVisibility]);

    return (
        <Input
            id="password"
            label="Password"
            type={isPasswordVisible ? 'text' : 'password'}
            placeholder="********"
            registration={register('password')}
            error={errors.password}
            disabled={disabled}
            autoComplete="new-password"
            icon={passwordIcon}
        />
    );
});

PasswordField.displayName = 'PasswordField';

