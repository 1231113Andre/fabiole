// Plik: components/auth/AuthModal/Input.tsx
"use client";

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    registration?: Partial<UseFormRegisterReturn>; // Made optional to be safe
    error?: FieldError | any; // Should be FieldError but keeping flexibile
    icon?: React.ReactNode;
}

const InputComponent = forwardRef<HTMLInputElement, InputProps>(
    ({ id, label, registration, error, type = 'text', icon, className, ...props }, ref) => (
        <div className={cn("space-y-2", className)}>
            <label htmlFor={id} className="block text-sm font-medium text-muted-foreground cursor-pointer">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    className={cn(
                        "block w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-3 px-4 text-[var(--foreground)] shadow-sm transition-colors duration-200",
                        "placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]",
                        "sm:text-sm sm:leading-6 font-montserrat",
                        error && "border-[var(--destructive)] focus:border-[var(--destructive)] focus:ring-[var(--destructive)]"
                    )}
                    ref={ref}
                    {...registration}
                    {...props}
                />
                {icon && <div className="absolute inset-y-0 right-0 flex items-center pr-4">{icon}</div>}
            </div>
            {error && <p className="mt-1 text-xs text-destructive">{error.message || error}</p>}
        </div>
    )
);

InputComponent.displayName = 'Input';
export const Input = React.memo(InputComponent);
