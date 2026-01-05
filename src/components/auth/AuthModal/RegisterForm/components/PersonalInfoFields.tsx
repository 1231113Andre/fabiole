"use client";

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '../../Input';
import type { RegisterSchema } from '../schemas/registerSchema';

interface PersonalInfoFieldsProps {
    register: UseFormRegister<RegisterSchema>;
    errors: FieldErrors<RegisterSchema>;
    disabled?: boolean;
}

/**
 * Personal information fields component (First Name, Last Name)
 */
export const PersonalInfoFields = React.memo<PersonalInfoFieldsProps>(({
    register,
    errors,
    disabled = false,
}) => {
    return (
        <div className="flex gap-2">
            <Input
                id="firstName"
                label="First Name"
                type="text"
                registration={register('firstName')}
                placeholder="John"
                error={errors.firstName}
                disabled={disabled}
                autoComplete="given-name"
                className="flex-1"
            />
            <Input
                id="lastName"
                label="Last Name"
                type="text"
                registration={register('lastName')}
                placeholder="Doe"
                error={errors.lastName}
                disabled={disabled}
                autoComplete="family-name"
                className="flex-1"
            />
        </div>
    );
});

PersonalInfoFields.displayName = 'PersonalInfoFields';

