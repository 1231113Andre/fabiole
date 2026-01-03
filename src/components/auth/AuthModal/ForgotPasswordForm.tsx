"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';

import NewButton from '@/app/components/newButton';
import { cn } from '@/lib/utils';
import { Input } from './Input';
import { VerificationCodeInput } from './VerificationCodeInput';
import { LoadingSpinner } from '@/components/ui/spinner';

// Cooldown time in seconds for resending code
const RESEND_COOLDOWN_SECONDS = 60;

// Step 1: Email schema
const emailSchema = z.object({
    email: z.string().email('Por favor, insere um email válido.'),
});

// Step 3: New password schema
const passwordSchema = z.object({
    password: z.string()
        .min(8, 'A password deve ter pelo menos 8 caracteres.')
        .regex(/[A-Z]/, 'A password deve conter pelo menos uma letra maiúscula.')
        .regex(/[a-z]/, 'A password deve conter pelo menos uma letra minúscula.')
        .regex(/[0-9]/, 'A password deve conter pelo menos um número.'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: 'As passwords não coincidem.',
    path: ['confirmPassword'],
});

type EmailSchema = z.infer<typeof emailSchema>;
type PasswordSchema = z.infer<typeof passwordSchema>;

type Step = 'email' | 'code' | 'password' | 'success';

interface ForgotPasswordFormProps {
    onBack: () => void;
    onClose: () => void;
}

export const ForgotPasswordForm = ({ onBack, onClose }: ForgotPasswordFormProps) => {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    
    // Email step message (shown after sending code)
    const [emailStepMessage, setEmailStepMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
    
    // Resend cooldown state
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendMessage, setResendMessage] = useState<{ type: 'info' | 'success'; text: string } | null>(null);
    const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
    const resendMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Verification error state (for code step)
    const [verifyError, setVerifyError] = useState<string | null>(null);

    // Cooldown timer effect - with proper cleanup
    useEffect(() => {
        if (resendCooldown > 0) {
            cooldownTimerRef.current = setInterval(() => {
                setResendCooldown(prev => {
                    if (prev <= 1) {
                        if (cooldownTimerRef.current) {
                            clearInterval(cooldownTimerRef.current);
                            cooldownTimerRef.current = null;
                        }
                        setResendMessage(null);
                        return 0;
                    }
                    const seconds = prev - 1;
                    setResendMessage({
                        type: 'info',
                        text: `Podes reenviar o código em <strong>${seconds}</strong> segundo${seconds !== 1 ? 's' : ''}.`
                    });
                    return prev - 1;
                });
            }, 1000);

            return () => {
                if (cooldownTimerRef.current) {
                    clearInterval(cooldownTimerRef.current);
                    cooldownTimerRef.current = null;
                }
            };
        } else {
            // Clear timer if cooldown becomes 0
            if (cooldownTimerRef.current) {
                clearInterval(cooldownTimerRef.current);
                cooldownTimerRef.current = null;
            }
        }
    }, [resendCooldown]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (cooldownTimerRef.current) {
                clearInterval(cooldownTimerRef.current);
                cooldownTimerRef.current = null;
            }
            if (resendMessageTimeoutRef.current) {
                clearTimeout(resendMessageTimeoutRef.current);
                resendMessageTimeoutRef.current = null;
            }
        };
    }, []);

    // Cooldown is managed by sendCodeMutation.onSuccess and resendCode - no auto-start needed

    // Email form
    const emailForm = useForm<EmailSchema>({
        resolver: zodResolver(emailSchema),
    });

    // Password form
    const passwordForm = useForm<PasswordSchema>({
        resolver: zodResolver(passwordSchema),
    });
    const passwordValue = passwordForm.watch('password') || '';
    const passwordRequirements = {
        length: passwordValue.length >= 8,
        upper: /[A-Z]/.test(passwordValue),
        lower: /[a-z]/.test(passwordValue),
        digit: /[0-9]/.test(passwordValue),
    };

    // Send code mutation
    const sendCodeMutation = useMutation({
        mutationFn: async (email: string) => {
            const res = await fetch('/api/auth/forgot-password/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao enviar código');
            return data;
        },
        onSuccess: (data) => {
            // Always start/reset cooldown when code is successfully sent
            setResendCooldown(RESEND_COOLDOWN_SECONDS);
            
            // Check current step to determine behavior
            setStep(currentStep => {
                if (currentStep === 'email') {
                    // Fresh send from email step - show success and move to code step
                    const message = data?.message || 'Se este email existir na nossa base de dados, enviámos um código para redefinir a password.';
                    setEmailStepMessage({ type: 'success', text: message });
                    setResendMessage({
                        type: 'info',
                        text: `Podes reenviar o código em <strong>${RESEND_COOLDOWN_SECONDS}</strong> segundos.`
                    });
                    return 'code';
                } else {
                    // This is a resend from code step - update resend message only
                    // Clear any existing timeout
                    if (resendMessageTimeoutRef.current) {
                        clearTimeout(resendMessageTimeoutRef.current);
                        resendMessageTimeoutRef.current = null;
                    }
                    
                    setResendMessage({
                        type: 'success',
                        text: 'Código reenviado com sucesso! Verifica o teu email.'
                    });
                    // After 3 seconds, switch to cooldown message
                    resendMessageTimeoutRef.current = setTimeout(() => {
                        const remaining = RESEND_COOLDOWN_SECONDS - 3;
                        setResendMessage({
                            type: 'info',
                            text: `Podes reenviar o código em <strong>${remaining}</strong> segundo${remaining !== 1 ? 's' : ''}.`
                        });
                        resendMessageTimeoutRef.current = null;
                    }, 3000);
                    return currentStep; // Stay in current step
                }
            });
        },
        onError: (error: Error) => {
            setEmailStepMessage({ type: 'error', text: error.message });
        },
    });

    // Verify code mutation
    const verifyCodeMutation = useMutation({
        mutationFn: async ({ email, code }: { email: string; code: string }) => {
            const res = await fetch('/api/auth/forgot-password/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Código inválido');
            return data;
        },
        onSuccess: () => {
            setVerifyError(null);
            setStep('password');
        },
        onError: (error: Error) => {
            setVerifyError(error.message);
        },
    });

    // Reset password mutation
    const resetPasswordMutation = useMutation({
        mutationFn: async ({ email, code, password }: { email: string; code: string; password: string }) => {
            const res = await fetch('/api/auth/forgot-password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao alterar password');
            return data;
        },
        onSuccess: () => {
            setStep('success');
        },
        onError: (error: Error) => {
            passwordForm.setError('root.serverError', { message: error.message });
        },
    });

    // Handlers
    const onEmailSubmit: SubmitHandler<EmailSchema> = (data) => {
        // If cooldown is active, don't call API - just show message
        if (resendCooldown > 0) {
            setEmailStepMessage({ 
                type: 'info', 
                text: `Aguarda <strong>${resendCooldown}</strong> segundo${resendCooldown !== 1 ? 's' : ''} antes de solicitar outro código.` 
            });
            return;
        }
        
        setEmailStepMessage(null); // Clear previous messages
        setEmail(data.email);
        sendCodeMutation.mutate(data.email);
    };

    const onCodeComplete = (code: string) => {
        setVerifyError(null); // Clear previous error
        setVerificationCode(code);
        verifyCodeMutation.mutate({ email, code });
    };

    const onPasswordSubmit: SubmitHandler<PasswordSchema> = (data) => {
        resetPasswordMutation.mutate({
            email,
            code: verificationCode,
            password: data.password,
        });
    };

    const resendCode = () => {
        if (resendCooldown > 0) return; // Guard - don't call API during cooldown
        
        // Use the same mutation - onSuccess handles both email step and code step
        sendCodeMutation.mutate(email);
    };

    // Password visibility toggles
    const passwordIcon = (
        <button type="button" onClick={() => setIsPasswordVisible(p => !p)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer border-none bg-transparent">
            <i className={cn("fa-solid fa-fw", isPasswordVisible ? "fa-eye-slash" : "fa-eye")} style={{ fontSize: 14 }}></i>
        </button>
    );

    const confirmIcon = (
        <button type="button" onClick={() => setIsConfirmVisible(p => !p)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer border-none bg-transparent">
            <i className={cn("fa-solid fa-fw", isConfirmVisible ? "fa-eye-slash" : "fa-eye")} style={{ fontSize: 14 }}></i>
        </button>
    );

    // Step 1: Email Input
    if (step === 'email') {
        const isSendDisabled = resendCooldown > 0 || sendCodeMutation.isPending;
        
        return (
            <div className="space-y-4">
                <div className="text-center mb-4">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                        <i className="fa-duotone fa-envelope text-2xl text-primary"></i>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        Insere o teu email e enviaremos um código para redefinires a tua password.
                    </p>
                </div>

                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-3">
                    <Input
                        id="forgot-email"
                        label="Email"
                        type="email"
                        registration={emailForm.register('email')}
                        placeholder="mail@example.com"
                        error={emailForm.formState.errors.email}
                        disabled={sendCodeMutation.isPending}
                        autoComplete="email"
                    />

                    {/* Error message */}
                    {emailStepMessage && emailStepMessage.type === 'error' && (
                        <div className="text-sm text-center font-medium p-3 rounded-lg border bg-red-500/10 text-red-400 border-red-500/30">
                            <i className="fa-duotone fa-circle-exclamation mr-2"></i>
                            {emailStepMessage.text}
                        </div>
                    )}

                    {/* Info message (cooldown or other info) */}
                    {emailStepMessage && emailStepMessage.type === 'info' && (
                        <div className="text-sm text-center p-3 rounded-lg border font-semibold bg-boxdark text-bodydark2 border-strokedark">
                            <i className="fa-duotone fa-clock mr-2"></i>
                            <span dangerouslySetInnerHTML={{ __html: emailStepMessage.text }} />
                        </div>
                    )}

                    {/* Success message */}
                    {emailStepMessage && emailStepMessage.type === 'success' && (
                        <div className="text-sm text-center p-3 rounded-lg border font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            <i className="fa-duotone fa-circle-check mr-2"></i>
                            {emailStepMessage.text}
                        </div>
                    )}

                    {/* Cooldown message in email step (if no emailStepMessage) */}
                    {resendCooldown > 0 && !emailStepMessage && (
                        <div className="text-sm text-center p-3 rounded-lg border font-semibold bg-boxdark text-bodydark2 border-strokedark">
                            <i className="fa-duotone fa-clock mr-2"></i>
                            <span>Podes enviar outro código em <strong>{resendCooldown}</strong> segundo{resendCooldown !== 1 ? 's' : ''}.</span>
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-4">
                        <NewButton
                            type="submit"
                            className="!py-2.5 !text-sm !font-semibold w-[280px] uppercase"
                            h="11"
                            variant="new_primary_rounded"
                            disabled={isSendDisabled}
                        >
                            {sendCodeMutation.isPending ? (
                                <LoadingSpinner size="h-5 w-5" color="text-primary-foreground" />
                            ) : resendCooldown > 0 ? (
                                <>
                                    <i className="fa-duotone fa-clock mr-2"></i>
                                    Aguarda ({resendCooldown}s)
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-envelope-circle-check mr-2"></i>
                                    Enviar Código
                                </>
                            )}
                        </NewButton>

                        <div className="w-[280px] border-t border-[var(--border)]"></div>

                        <NewButton
                            type="button"
                            onClick={onBack}
                            className="!py-2.5 !text-sm w-[280px] uppercase"
                            h="11"
                            variant="new_primary_rounded"
                            iconPosition="left"
                            icon={<i className="fa-duotone fa-arrow-left"></i>}
                        >
                            Voltar ao Login
                        </NewButton>
                    </div>
                </form>
            </div>
        );
    }

    // Step 2: Verification Code
    if (step === 'code') {
        const isResendDisabled = resendCooldown > 0 || sendCodeMutation.isPending;
        
        return (
            <div className="space-y-4">
                {/* Success message from sending code */}
                {emailStepMessage && emailStepMessage.type === 'success' && (
                    <div className="text-sm text-center p-3 rounded-lg border font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        <i className="fa-duotone fa-circle-check mr-2"></i>
                        {emailStepMessage.text}
                    </div>
                )}

                <div className="text-center mb-4">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                        <i className="fa-duotone fa-key text-2xl text-primary"></i>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        Enviámos um código de 6 dígitos para <strong className="text-[var(--foreground)]">{email}</strong>
                    </p>
                </div>

                <VerificationCodeInput
                    onComplete={onCodeComplete}
                    disabled={verifyCodeMutation.isPending}
                    error={verifyError || undefined}
                />

                {verifyCodeMutation.isPending && (
                    <div className="flex justify-center">
                        <LoadingSpinner size="h-8 w-8" color="text-primary" />
                    </div>
                )}

                {/* Resend message / cooldown */}
                {resendMessage && (
                    <div className={cn(
                        "text-sm text-center p-3 rounded-lg border font-semibold",
                        resendMessage.type === 'success' 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                            : "bg-boxdark text-bodydark2 border-strokedark"
                    )}>
                        {resendMessage.type === 'success' && (
                            <i className="fa-duotone fa-circle-check mr-2"></i>
                        )}
                        {resendMessage.type === 'info' && (
                            <i className="fa-duotone fa-clock mr-2"></i>
                        )}
                        <span dangerouslySetInnerHTML={{ __html: resendMessage.text }} />
                    </div>
                )}

                <div className="flex flex-col items-center gap-4 pt-2">
                    <button
                        type="button"
                        onClick={resendCode}
                        disabled={isResendDisabled}
                        className={cn(
                            "text-sm font-bold cursor-pointer transition-all",
                            isResendDisabled 
                                ? "text-[var(--muted-foreground)] cursor-not-allowed" 
                                : "text-primary hover:text-primary/80"
                        )}
                    >
                        {sendCodeMutation.isPending ? (
                            <>
                                <i className="fa-duotone fa-spinner-third fa-spin mr-2"></i>
                                A enviar...
                            </>
                        ) : resendCooldown > 0 ? (
                            <>
                                <i className="fa-duotone fa-clock mr-2"></i>
                                Reenviar código ({resendCooldown}s)
                            </>
                        ) : (
                            <>
                                <i className="fa-duotone fa-paper-plane mr-2"></i>
                                Reenviar código
                            </>
                        )}
                    </button>

                    <div className="w-[280px] border-t border-[var(--border)]"></div>

                    <NewButton
                        type="button"
                        onClick={() => {
                            // Clear success/error messages, but keep info if cooldown is active
                            setEmailStepMessage(prev => {
                                if (prev?.type === 'info') return null; // Clear info messages
                                return null;
                            });
                            setResendMessage(null);
                            // Don't reset cooldown - it should persist across steps
                            setStep('email');
                        }}
                        className="!py-2.5 !text-sm w-[280px] uppercase"
                        h="11"
                        variant="new_primary_rounded"
                        iconPosition="left"
                        icon={<i className="fa-duotone fa-at"></i>}
                    >
                        Alterar Email
                    </NewButton>
                </div>
            </div>
        );
    }

    // Step 3: New Password
    if (step === 'password') {
        return (
            <div className="space-y-4">
                <div className="text-center mb-4">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <i className="fa-duotone fa-lock-open text-2xl text-emerald-500"></i>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        Define a tua nova password.
                    </p>
                </div>

                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-3">
                    <Input
                        id="new-password"
                        label="Nova Password"
                        type={isPasswordVisible ? 'text' : 'password'}
                        registration={passwordForm.register('password')}
                        placeholder="********"
                        error={passwordForm.formState.errors.password}
                        disabled={resetPasswordMutation.isPending}
                        autoComplete="new-password"
                        icon={passwordIcon}
                    />

                    <Input
                        id="confirm-password"
                        label="Confirmar Password"
                        type={isConfirmVisible ? 'text' : 'password'}
                        registration={passwordForm.register('confirmPassword')}
                        placeholder="********"
                        error={passwordForm.formState.errors.confirmPassword}
                        disabled={resetPasswordMutation.isPending}
                        autoComplete="new-password"
                        icon={confirmIcon}
                    />

                    {/* Password requirements hint - styled to match AuthModal and show missing rules */}
                    <div className="rounded-lg border border-orange-400/40 bg-[#232c3d] text-sm shadow-[0_10px_24px_rgba(0,0,0,0.25)] p-4 space-y-2">
                        <p className="font-semibold text-white">A password deve conter:</p>
                        <ul className="space-y-1">
                            <li className="flex items-center gap-2">
                                <i className={`fa-solid ${passwordRequirements.length ? 'fa-check text-emerald-400 drop-shadow-sm' : 'fa-circle-xmark text-red-400'}`}></i>
                                <span className={passwordRequirements.length ? 'text-white/90' : 'text-red-200'}>Pelo menos 8 caracteres</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <i className={`fa-solid ${passwordRequirements.upper ? 'fa-check text-emerald-400 drop-shadow-sm' : 'fa-circle-xmark text-red-400'}`}></i>
                                <span className={passwordRequirements.upper ? 'text-white/90' : 'text-red-200'}>Uma letra maiúscula</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <i className={`fa-solid ${passwordRequirements.lower ? 'fa-check text-emerald-400 drop-shadow-sm' : 'fa-circle-xmark text-red-400'}`}></i>
                                <span className={passwordRequirements.lower ? 'text-white/90' : 'text-red-200'}>Uma letra minúscula</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <i className={`fa-solid ${passwordRequirements.digit ? 'fa-check text-emerald-400 drop-shadow-sm' : 'fa-circle-xmark text-red-400'}`}></i>
                                <span className={passwordRequirements.digit ? 'text-white/90' : 'text-red-200'}>Um número</span>
                            </li>
                        </ul>
                    </div>

                    {passwordForm.formState.errors.root?.serverError && (
                        <div className="text-sm text-center font-medium p-3 rounded-lg text-destructive">
                            {passwordForm.formState.errors.root.serverError.message}
                        </div>
                    )}

                    <div className="flex flex-col items-center">
                        <NewButton
                            type="submit"
                            className="!py-2.5 !text-sm !font-semibold w-[280px] uppercase"
                            h="11"
                            variant="new_primary_rounded"
                            disabled={resetPasswordMutation.isPending}
                        >
                            {resetPasswordMutation.isPending ? (
                                <LoadingSpinner size="h-5 w-5" color="text-primary-foreground" />
                            ) : (
                                <>
                                    <i className="fa-duotone fa-lock-keyhole mr-2"></i>
                                    Alterar Password
                                </>
                            )}
                        </NewButton>
                    </div>
                </form>
            </div>
        );
    }

    // Step 4: Success
    return (
        <div className="space-y-4 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <i className="fa-duotone fa-circle-check text-4xl text-emerald-500"></i>
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Password Alterada!
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
                A tua password foi alterada com sucesso. Já podes fazer login com a nova password.
            </p>
            <div className="flex flex-col items-center">
                <NewButton
                    onClick={onBack}
                    className="!py-2.5 !text-sm !font-semibold w-[280px] uppercase"
                    h="11"
                    variant="new_primary_rounded"
                    iconPosition="left"
                    icon={<i className="fa-duotone fa-arrow-left"></i>}
                >
                    Ir para Login
                </NewButton>
            </div>
        </div>
    );
};

