"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNotification } from "@/components/NotificationContext";
import NewButton from "@/app/components/newButton";
import { ButtonSpinner } from "@/app/admin/components/LoadingStates";

const changePasswordSchema = z.object({
    newPassword: z.string()
        .min(8, "Nova password deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma a nova password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "As passwords não coincidem",
    path: ["confirmPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

interface Props {
    userId: string;
    isOpen: boolean;
    onToggle: () => void;
}

export function AdminChangePasswordSection({ userId, isOpen, onToggle }: Props) {
    const { notify } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordForm>({
        resolver: zodResolver(changePasswordSchema),
    });

    const onSubmit = async (data: ChangePasswordForm) => {
        setIsSubmitting(true);
        setSuccessMessage(null);
        try {
            const response = await fetch(`/api/admin/users/${userId}/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword: data.newPassword }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erro ao alterar password");
            }

            setSuccessMessage("Password alterada com sucesso!");
            notify("Password alterada com sucesso!", "success");
            reset();
        } catch (error: any) {
            notify(error.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rounded-2xl border border-stroke bg-white shadow-default overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <i className="fa-duotone fa-lock text-xl"></i>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-black">Alterar Password</h3>
                        <p className="text-sm text-muted-foreground">Definir nova password para o utilizador</p>
                    </div>
                </div>
                <i className={`fa-duotone fa-chevron-down text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}></i>
            </button>

            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 border-t border-stroke">
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">
                                <i className="fa-duotone fa-shield-check mr-2"></i>
                                <strong>Modo Administrador:</strong> Não é necessário inserir a password atual do utilizador.
                            </p>
                        </div>

                        {successMessage && (
                            <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3">
                                <i className="fa-solid fa-circle-check text-xl"></i>
                                <span className="font-medium">{successMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nova Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        {...register("newPassword")}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:border-primary focus:ring-0 transition-all placeholder:text-gray-400"
                                        placeholder="••••••••"
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
                                    >
                                        <i className={`fa-solid ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <p className="mt-1 text-sm text-destructive">{errors.newPassword.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirmar Nova Password
                                </label>
                                <input
                                    type="password"
                                    {...register("confirmPassword")}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:border-primary focus:ring-0 transition-all placeholder:text-gray-400"
                                    placeholder="••••••••"
                                    disabled={isSubmitting}
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <div className="flex justify-center mt-4">
                                <NewButton
                                    type="submit"
                                    variant="new_primary_rounded"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <ButtonSpinner />
                                            <span>A alterar...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-key mr-2"></i>
                                            Alterar Password
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
