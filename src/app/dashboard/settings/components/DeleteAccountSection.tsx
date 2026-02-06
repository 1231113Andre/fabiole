"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNotification } from "@/components/NotificationContext";
import NewButton from "@/app/components/newButton";
import { apiMutate } from "@/lib/react-query/apiClient";
import { useCsrfToken } from "@/lib/react-query/hooks/useCsrfToken";

const deleteAccountSchema = z.object({
    password: z.string().min(1, "Password é obrigatória"),
    confirmText: z.string().refine((val) => val === "ELIMINAR", {
        message: "Escreve 'ELIMINAR' para confirmar",
    }),
});

type DeleteAccountForm = z.infer<typeof deleteAccountSchema>;

interface Props {
    isOpen: boolean;
    onToggle: () => void;
}

export function DeleteAccountSection({ isOpen, onToggle }: Props) {
    useCsrfToken(); // Ensure CSRF token is available for mutations
    const router = useRouter();
    const { notify } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<DeleteAccountForm>({
        resolver: zodResolver(deleteAccountSchema),
    });

    const onSubmit = async (data: DeleteAccountForm) => {
        setIsSubmitting(true);
        try {
            await apiMutate<{ success: boolean; message?: string }>(
                "/api/auth/delete-account",
                "DELETE",
                { password: data.password }
            );

            notify("Conta eliminada com sucesso. Adeus!", "success");
            router.push("/");
        } catch (error: any) {
            notify(error?.message ?? "Erro ao eliminar conta", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rounded-2xl border border-red-200 bg-white shadow-default overflow-hidden">
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-6 hover:bg-red-50/50 transition-colors cursor-pointer border-none bg-transparent text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <i className="fa-duotone fa-trash-can text-xl"></i>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-red-600">Eliminar Conta</h3>
                        <p className="text-sm text-muted-foreground">Elimina permanentemente a tua conta e dados</p>
                    </div>
                </div>
                <i className={`fa-duotone fa-chevron-down text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}></i>
            </button>

            {/* Content */}
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 border-t border-red-200">
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800 font-medium">
                                <i className="fa-duotone fa-triangle-exclamation mr-2"></i>
                                <strong>Atenção:</strong> Esta ação é irreversível!
                            </p>
                            <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                                <li>Todos os teus dados serão eliminados permanentemente</li>
                                <li>Não poderás recuperar a tua conta</li>
                                <li>Perderás acesso a todo o histórico</li>
                            </ul>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 max-w-md">
                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password (para confirmar)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        {...register("password")}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder:text-gray-400"
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

                            {/* Confirm Text */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Escreve <span className="font-bold text-red-600">ELIMINAR</span> para confirmar
                                </label>
                                <input
                                    type="text"
                                    {...register("confirmText")}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder:text-gray-400"
                                    placeholder="ELIMINAR"
                                    disabled={isSubmitting}
                                />
                                {errors.confirmText && (
                                    <p className="mt-1 text-sm text-destructive">{errors.confirmText.message}</p>
                                )}
                            </div>

                            <div className="flex justify-center mt-4">
                                <NewButton
                                    type="submit"
                                    variant="destructive"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin mr-2" aria-hidden />
                                            Eliminar Conta
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-trash-can mr-2"></i>
                                            Eliminar Conta
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
