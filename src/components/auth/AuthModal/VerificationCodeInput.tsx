// components/auth/AuthModal/VerificationCodeInput.tsx
// Apple-style OTP input with auto-paste support
"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VerificationCodeInputProps {
    length?: number;
    onComplete: (code: string) => void;
    disabled?: boolean;
    error?: string;
    autoFocus?: boolean;
}

export const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
    length = 6,
    onComplete,
    disabled = false,
    error,
    autoFocus = true,
}) => {
    const [values, setValues] = useState<string[]>(Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const hasCalledComplete = useRef(false);
    const onCompleteRef = useRef(onComplete);

    // Keep onComplete ref updated without triggering effects
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    // Focus first input on mount
    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [autoFocus]);

    // Reset hasCalledComplete when error occurs (allow retry)
    useEffect(() => {
        if (error) {
            hasCalledComplete.current = false;
        }
    }, [error]);

    // Check if code is complete - only call once per complete code
    useEffect(() => {
        const code = values.join('');
        if (code.length === length && values.every(v => v !== '') && !hasCalledComplete.current) {
            hasCalledComplete.current = true;
            onCompleteRef.current(code);
        }
    }, [values, length]);

    const handleChange = useCallback((index: number, value: string) => {
        // Only accept digits
        const digit = value.replace(/\D/g, '').slice(-1);

        const newValues = [...values];
        newValues[index] = digit;
        setValues(newValues);

        // Move to next input if digit entered
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }, [values, length]);

    const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Backspace: clear current or move to previous
        if (e.key === 'Backspace') {
            if (values[index] === '' && index > 0) {
                inputRefs.current[index - 1]?.focus();
            } else {
                const newValues = [...values];
                newValues[index] = '';
                setValues(newValues);
            }
        }

        // Arrow keys navigation
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }, [values, length]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

        if (pastedData.length > 0) {
            const newValues = Array(length).fill('');
            pastedData.split('').forEach((char, i) => {
                if (i < length) newValues[i] = char;
            });
            setValues(newValues);

            // Focus last filled input or first empty
            const lastFilledIndex = Math.min(pastedData.length - 1, length - 1);
            inputRefs.current[lastFilledIndex]?.focus();
        }
    }, [length]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2 sm:gap-3" onPaste={handlePaste}>
                {Array.from({ length }).map((_, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={values[index]}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onFocus={handleFocus}
                        disabled={disabled}
                        className={cn(
                            "w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold rounded-xl",
                            "border-2 transition-all duration-200",
                            "bg-[var(--muted)] text-black",
                            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            error
                                ? "border-destructive ring-destructive/20 ring-2"
                                : values[index]
                                    ? "border-[var(--primary)]"
                                    : "border-[var(--border)]"
                        )}
                        aria-label={`Digit ${index + 1}`}
                    />
                ))}
            </div>
            {error && (
                <p className="text-sm text-destructive font-medium flex items-center gap-2">
                    <i className="fa-solid fa-circle-exclamation" />
                    {error}
                </p>
            )}
        </div>
    );
};
