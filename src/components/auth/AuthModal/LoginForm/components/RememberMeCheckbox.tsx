"use client";

import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import type { LoginSchema } from '../schemas/loginSchema';

interface RememberMeCheckboxProps {
    register: UseFormRegister<LoginSchema>;
    disabled?: boolean;
}

/**
 * Remember me checkbox component
 */
export const RememberMeCheckbox = React.memo<RememberMeCheckboxProps>(({
    register,
    disabled = false,
}) => {
    return (
        <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <input
                type="checkbox"
                {...register('rememberMe')}
                className="custom-checkbox"
                disabled={disabled}
            />
            <span className="text-gray-300 font-semibold">Manter sessão iniciada</span>
        </label>
    );
});

RememberMeCheckbox.displayName = 'RememberMeCheckbox';

