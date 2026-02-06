"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNotification } from "@/components/NotificationContext";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { useRouter } from "next/navigation";
import NewButton from "@/app/components/newButton";
import { apiPost } from "@/lib/react-query/apiClient";
import { useCsrfToken } from "@/lib/react-query/hooks/useCsrfToken";

// Inline button spinner
const ButtonSpinner = () => (
    <div className="relative w-5 h-5">
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-r-white animate-spin" />
        <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-white/60 border-l-white/60 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
    </div>
);

const changeEmailSchema = z.object({
    newEmail: z.string().email("Email inválido"),
    password: z.string().min(1, "Password é obrigatória para confirmar"),
    code: z.string().optional(),
});

type ChangeEmailForm = z.infer<typeof changeEmailSchema>;

interface Props {
    currentEmail: string;
    isOpen: boolean;
    onToggle: () => void;
}

export function ChangeEmailSection({ currentEmail, isOpen, onToggle }: Props) {
    useCsrfToken(); // Ensure CSRF token is available for mutations
    const { notify } = useNotification();
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1); // 1 = Request, 2 = Verify
    const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const formRef = useRef<HTMLFormElement>(null);

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ChangeEmailForm>({
        resolver: zodResolver(changeEmailSchema),
    });

    // Update the form value when code digits change
    useEffect(() => {
        const fullCode = codeDigits.join('');
        setValue('code', fullCode);
    }, [codeDigits, setValue]);

    // Handle single digit input
    const handleDigitChange = (index: number, value: string) => {
        // Only allow digits
        const digit = value.replace(/\D/g, '').slice(-1);

        const newDigits = [...codeDigits];
        newDigits[index] = digit;
        setCodeDigits(newDigits);

        // Auto-advance to next field
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle paste event - fill all fields and auto-submit if complete
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

        if (pastedData.length > 0) {
            const newDigits = [...codeDigits];
            for (let i = 0; i < 6; i++) {
                newDigits[i] = pastedData[i] || '';
            }
            setCodeDigits(newDigits);

            // If all 6 digits are filled, auto-submit after a short delay
            if (pastedData.length === 6) {
                // Focus last field briefly for visual feedback
                inputRefs.current[5]?.focus();

                // Auto-submit after 300ms delay for visual feedback
                setTimeout(() => {
                    const form = document.querySelector('form[data-email-form]') as HTMLFormElement;
                    if (form) {
                        form.requestSubmit();
                    }
                }, 400);
            } else {
                // Focus the next empty field
                const lastIndex = Math.min(pastedData.length, 5);
                inputRefs.current[lastIndex]?.focus();
            }
        }
    };

    // Handle backspace
    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Reset code digits when going back to step 1
    const handleBack = () => {
        setStep(1);
        setCodeDigits(['', '', '', '', '', '']);
    };

    const onSubmit = async (data: ChangeEmailForm) => {
        setIsSubmitting(true);
        try {
            if (step === 1) {
                // Step 1: Request Code
                await apiPost("/api/auth/change-email/request", {
                    currentPassword: data.password,
                    newEmail: data.newEmail,
                });

                notify("Código enviado para o teu email atual!", "success");
                setStep(2);
            } else {
                // Step 2: Verify Code
                const result = await apiPost<{ data?: { newEmail?: string } }>("/api/auth/change-email/verify", {
                    code: data.code,
                    newEmail: data.newEmail,
                });

                const newEmail = result?.data?.newEmail || data.newEmail;

                // Update React Query cache for session with new email
                // This ensures immediate UI update without race conditions
                queryClient.setQueryData(queryKeys.session, (old: any) => {
                    if (!old?.user) return old;
                    return {
                        ...old,
                        user: {
                            ...old.user,
                            email: newEmail
                        }
                    };
                });

                // No invalidateQueries needed here - useUserData uses sessionData?.user?.email as part of query key,
                // so when session cache updates, the query key changes automatically and new data will be fetched
                // This avoids race conditions similar to what we fixed in pesagens/perimetros/avaliacoes

                notify("Email alterado com sucesso!", "success");

                // Close section and refresh router for SSR components (navbar, etc.)
                setTimeout(() => {
                    onToggle();
                    router.refresh();
                }, 500);
            }
        } catch (error: any) {
            notify(error?.message ?? "Erro ao processar", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rounded-2xl border border-stroke bg-white shadow-default overflow-hidden">
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                        <i className="fa-duotone fa-envelope text-xl"></i>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-black">Alterar Email</h3>
                        <p className="text-sm text-muted-foreground">
                            Email atual: <span className="font-medium text-black">{currentEmail || "N/A"}</span>
                        </p>
                    </div>
                </div>
                <i className={`fa-duotone fa-chevron-down text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}></i>
            </button>

            {/* Content */}
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 border-t border-stroke">
                        <div className="mt-4 p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl shadow-md w-fit">
                            <div className="flex items-center gap-2.5 flex-nowrap">
                                <div className="flex-shrink-0">
                                    <i className="fa-duotone fa-envelope-circle-check text-lg text-[#e6915b]"></i>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 leading-snug whitespace-nowrap">
                                    {step === 1
                                        ? "Será enviado um código de verificação para o teu email ATUAL."
                                        : "Introduz o código que enviámos para o teu email atual."}
                                </p>
                            </div>
                        </div>

                        {/* Steps Explanation */}
                        <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-md">
                            <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#e6915b] to-[#d37d45] text-white shadow-sm">
                                    <i className="fa-duotone fa-list-ol text-sm"></i>
                                </div>
                                <span>Como funciona</span>
                            </h4>
                            <div className="space-y-3.5">
                                <div className="flex items-start gap-3.5 p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#e6915b] to-[#d37d45] text-white font-bold text-sm flex items-center justify-center shadow-md">
                                        1
                                    </div>
                                    <div className="flex-1 pt-0.5">
                                        <p className="text-sm font-bold text-gray-900 mb-1.5">Step #1: Solicitar Código</p>
                                        <p className="text-xs text-gray-600 leading-relaxed">Introduz o teu novo email e confirma com a password atual. Será enviado um código de verificação para o teu email atual.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3.5 p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#e6915b] to-[#d37d45] text-white font-bold text-sm flex items-center justify-center shadow-md">
                                        2
                                    </div>
                                    <div className="flex-1 pt-0.5">
                                        <p className="text-sm font-bold text-gray-900 mb-1.5">Step #2: Verificar Código</p>
                                        <p className="text-xs text-gray-600 leading-relaxed">Introduz o código de 6 dígitos que recebeste no teu email atual para confirmar e completar a alteração.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} data-email-form className="mt-6 space-y-4 max-w-md">

                            {/* Step 1: New Email & Password */}
                            <div className={step === 1 ? "block space-y-4" : "hidden"}>
                                {/* New Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Novo Email
                                    </label>
                                    <input
                                        type="email"
                                        {...register("newEmail")}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:border-primary focus:ring-0 transition-all placeholder:text-gray-400"
                                        placeholder="novo@email.com"
                                        disabled={isSubmitting}
                                    />
                                    {errors.newEmail && (
                                        <p className="mt-1 text-sm text-destructive">{errors.newEmail.message}</p>
                                    )}
                                </div>

                                {/* Password Confirmation */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password Atual (para confirmar)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            {...register("password")}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:border-primary focus:ring-0 transition-all placeholder:text-gray-400"
                                            placeholder="••••••••"
                                            disabled={isSubmitting}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
                                        >
                                            <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Step 2: Verification Code */}
                            {step === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    {/* Stylized code input section */}
                                    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center justify-center gap-2 mb-4">
                                            <i className="fa-duotone fa-shield-keyhole text-2xl text-primary"></i>
                                            <h4 className="text-lg font-bold text-black">Código de Verificação</h4>
                                        </div>
                                        <p className="text-sm text-gray-600 text-center mb-5">
                                            Introduz o código de 6 dígitos enviado para o teu email
                                        </p>

                                        {/* 6-digit code input boxes */}
                                        <div className="flex justify-center gap-2.5 sm:gap-3">
                                            {codeDigits.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el) => { inputRefs.current[index] = el; }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="one-time-code"
                                                    value={digit}
                                                    onChange={(e) => handleDigitChange(index, e.target.value)}
                                                    onPaste={handlePaste}
                                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                                    maxLength={1}
                                                    disabled={isSubmitting}
                                                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-black rounded-xl 
                                                        border-2 border-slate-300 bg-white shadow-sm
                                                        focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 focus:shadow-md
                                                        transition-all duration-200
                                                        disabled:opacity-50 disabled:cursor-not-allowed
                                                        placeholder:text-slate-300"
                                                    placeholder="•"
                                                />
                                            ))}
                                        </div>

                                        {errors.code && (
                                            <p className="mt-4 text-sm text-destructive text-center font-medium">{errors.code.message}</p>
                                        )}

                                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                                            <i className="fa-solid fa-paste"></i>
                                            <span>Cola o código com <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono text-xs">Ctrl+V</kbd> para preencher automaticamente</span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            className="text-sm text-muted-foreground hover:text-primary underline bg-transparent border-none cursor-pointer transition-colors"
                                        >
                                            <i className="fa-solid fa-arrow-left mr-1.5"></i>
                                            Voltar / Alterar dados
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center mt-6">
                                <NewButton
                                    type="submit"
                                    variant="new_primary_rounded"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <ButtonSpinner />
                                            <span>{step === 1 ? 'A enviar...' : 'A verificar...'}</span>
                                        </div>
                                    ) : (
                                        <>
                                            {step === 1 ? (
                                                <>
                                                    <i className="fa-duotone fa-envelope mr-2"></i>
                                                    Enviar Código
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa-duotone fa-check mr-2"></i>
                                                    Verificar e Alterar
                                                </>
                                            )}
                                        </>
                                    )}
                                </NewButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
