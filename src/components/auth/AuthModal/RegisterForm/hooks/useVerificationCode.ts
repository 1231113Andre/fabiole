import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/components/NotificationContext';
import { useRegister } from '@/lib/react-query/hooks/useAuth';
import { getCsrfToken } from '@/lib/react-query/hooks/useCsrfToken';
import type { RegisterSchema } from '../schemas/registerSchema';

interface UseVerificationCodeOptions {
    formData: RegisterSchema | null;
    onClose: () => void;
}

/**
 * Custom hook for handling verification code logic
 */
export function useVerificationCode({ formData, onClose }: UseVerificationCodeOptions) {
    const router = useRouter();
    const { notify } = useNotification();
    const registerMutation = useRegister();
    const [isLoading, setIsLoading] = useState(false);
    const [verifyError, setVerifyError] = useState<string | undefined>();

    /**
     * Create headers with CSRF token
     */
    const createHeaders = useCallback((): HeadersInit => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }
        return headers;
    }, []);

    /**
     * Send verification code
     */
    const sendVerificationCode = useCallback(async (email: string, firstName: string) => {
        const response = await fetch('/api/auth/send-verification', {
            method: 'POST',
            headers: createHeaders(),
            body: JSON.stringify({ email, firstName }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to send verification code');
        }

        return result;
    }, [createHeaders]);

    /**
     * Verify code and complete registration
     */
    const handleVerifyCode = useCallback(async (code: string) => {
        if (!formData) return;

        setIsLoading(true);
        setVerifyError(undefined);

        try {
            // First verify the code
            const verifyResponse = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: createHeaders(),
                body: JSON.stringify({
                    email: formData.email,
                    code,
                }),
            });

            const verifyResult = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyResult.success) {
                throw new Error(verifyResult.error || 'Invalid verification code');
            }

            // Code verified! Now complete registration
            await registerMutation.mutateAsync({
                name: formData.firstName,
                surname: formData.lastName,
                email: formData.email,
                password: formData.password,
                birth: formData.birthDate,
                gender: formData.gender,
            });

            // Success handled by hook (session update, notification)
            onClose();
            
            // Redirect immediately for snappy UX
            router.push("/dashboard");

        } catch (error: any) {
            setVerifyError(error.message || 'Verification failed');
            setIsLoading(false);
        }
    }, [formData, createHeaders, registerMutation, onClose, router]);

    /**
     * Resend verification code
     */
    const handleResend = useCallback(async (): Promise<void> => {
        if (!formData) return;

        setIsLoading(true);
        setVerifyError(undefined);

        try {
            await sendVerificationCode(formData.email, formData.firstName);
            notify('New code sent!', 'success');
        } catch (error: any) {
            setVerifyError(error.message);
        } finally {
            setIsLoading(false);
        }
    }, [formData, sendVerificationCode, notify]);

    return {
        isLoading,
        verifyError,
        handleVerifyCode,
        handleResend,
        sendVerificationCode,
    };
}

