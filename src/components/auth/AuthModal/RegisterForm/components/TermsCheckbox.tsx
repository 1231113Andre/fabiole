"use client";

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { RegisterSchema } from '../schemas/registerSchema';

interface TermsCheckboxProps {
    register: UseFormRegister<RegisterSchema>;
    errors: FieldErrors<RegisterSchema>;
    disabled?: boolean;
}

/**
 * Terms and conditions checkbox component
 */
export const TermsCheckbox = React.memo<TermsCheckboxProps>(({
    register,
    errors,
    disabled = false,
}) => {
    return (
        <div className="mb-4">
            <div className="flex items-start gap-2 mt-2">
                <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <input
                        id="terms"
                        type="checkbox"
                        {...register('terms')}
                        className="custom-checkbox"
                        disabled={disabled}
                    />
                    <span className="text-gray-300 font-semibold text-sm">
                        I agree to the{' '}
                        <a
                            href="/terms"
                            className="font-medium text-[var(--primary)] hover:underline"
                        >
                            terms of service
                        </a>
                        {' '}and{' '}
                        <a
                            href="/privacy"
                            className="font-medium text-[var(--primary)] hover:underline"
                        >
                            privacy policy
                        </a>
                        .
                    </span>
                </label>
            </div>
            {errors.terms && (
                <p className="mt-1 text-xs text-destructive">{errors.terms.message}</p>
            )}
        </div>
    );
});

TermsCheckbox.displayName = 'TermsCheckbox';

