"use client";

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '../../Input';
import { cn } from '@/lib/utils';
import type { RegisterSchema } from '../schemas/registerSchema';

interface BirthDateGenderFieldsProps {
    register: UseFormRegister<RegisterSchema>;
    errors: FieldErrors<RegisterSchema>;
    disabled?: boolean;
}

/**
 * Birth date and gender fields component
 */
export const BirthDateGenderFields = React.memo<BirthDateGenderFieldsProps>(({
    register,
    errors,
    disabled = false,
}) => {
    return (
        <div className="flex gap-2">
            <Input
                id="birthDate"
                label="Birth Date"
                type="date"
                registration={register('birthDate')}
                error={errors.birthDate}
                disabled={disabled}
                className="flex-1"
            />
            <div className="flex-1 space-y-2">
                <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-muted-foreground cursor-pointer"
                >
                    Género
                </label>
                <div className="relative">
                    <select
                        id="gender"
                        className={cn(
                            "block w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-3 px-4 text-[var(--foreground)] shadow-sm transition-colors duration-200",
                            "focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]",
                            "sm:text-sm sm:leading-6 font-montserrat appearance-none cursor-pointer",
                            errors.gender && "border-[var(--destructive)] focus:border-[var(--destructive)] focus:ring-[var(--destructive)]"
                        )}
                        disabled={disabled}
                        {...register('gender')}
                    >
                        <option value="">Selecionar</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[var(--muted-foreground)]">
                        <i className="fa-solid fa-chevron-down text-xs" />
                    </div>
                </div>
                {errors.gender && (
                    <p className="mt-1 text-xs text-destructive">{errors.gender.message}</p>
                )}
            </div>
        </div>
    );
});

BirthDateGenderFields.displayName = 'BirthDateGenderFields';

