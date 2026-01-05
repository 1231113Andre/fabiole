import { useState, useEffect, useRef } from 'react';
import type { UseFormSetError, UseFormClearErrors, FieldPath } from 'react-hook-form';
import { formatTime } from '../utils/formatTime';
import type { LoginSchema } from '../schemas/loginSchema';

/**
 * Custom hook for managing lockout timer and countdown
 * @param setError - Function to set error on lockout expiration
 * @param clearErrors - Function to clear specific error field
 * @returns [lockoutSeconds, setLockoutSeconds] - Current lockout seconds and setter
 */
export function useLockoutTimer(
    setError: UseFormSetError<LoginSchema>,
    clearErrors: UseFormClearErrors<LoginSchema>
) {
    const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (lockoutSeconds !== null && lockoutSeconds > 0) {
            timerRef.current = setInterval(() => {
                setLockoutSeconds((prev) => {
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
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }
    }, [lockoutSeconds, setError, clearErrors]);

    return [lockoutSeconds, setLockoutSeconds] as const;
}

