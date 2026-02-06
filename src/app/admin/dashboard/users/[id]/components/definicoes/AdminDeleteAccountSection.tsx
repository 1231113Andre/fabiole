"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNotification } from "@/components/NotificationContext";
import NewButton from "@/app/components/newButton";

interface Props {
    userId: string;
    userName: string;
    userEmail: string;
    isOpen: boolean;
    onToggle: () => void;
}

export function AdminDeleteAccountSection({ userId, userName, userEmail, isOpen, onToggle }: Props) {
    const router = useRouter();
    const { notify } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const deleteAccountSchema = z.object({
        confirmText: z.string().refine((val) => val === userEmail, {
            message: "O email introduzido não corresponde ao email do utilizador",
        }),
    });

    type DeleteAccountForm = z.infer<typeof deleteAccountSchema>;

    const { register, handleSubmit, formState: { errors } } = useForm<DeleteAccountForm>({
        resolver: zodResolver(deleteAccountSchema),
    });

    const onSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erro ao eliminar conta");
            }

            notify("Conta eliminada com sucesso!", "success");
            router.push("/admin/dashboard");
        } catch (error: any) {
            notify(error.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rounded-2xl border border-red-200 bg-white shadow-default overflow-hidden">
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
                        <p className="text-sm text-gray-500">Eliminar permanentemente a conta e todos os dados associados</p>
                    </div>
                </div>
                <i className={`fa-duotone fa-chevron-down text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}></i>
            </button>

            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 border-t border-red-200">
                        <div className="mt-6 p-5 bg-red-50/50 border border-red-200 rounded-xl">
                            <h4 className="text-base font-bold text-red-900 flex items-center gap-2 mb-3">
                                <i className="fa-duotone fa-triangle-exclamation text-red-600"></i>
                                Ação Irreversível - Zona de Perigo
                            </h4>
                            <p className="text-sm text-red-800 leading-relaxed">
                                Ao eliminar esta conta, <strong>todos os dados serão apagados permanentemente</strong> dos nossos servidores.
                                Isto inclui o histórico de pesagens, perímetros, avaliações, fotografias e notas pessoais.
                            </p>
                            <p className="mt-2 text-sm text-red-800 font-medium">
                                Esta ação não pode ser desfeita nem os dados recuperados.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 max-w-lg">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Para confirmar, digite o email do utilizador: <span className="font-bold select-all text-gray-900">{userEmail}</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register("confirmText")}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-gray-400"
                                        placeholder={userEmail}
                                        disabled={isSubmitting}
                                        autoComplete="off"
                                    />
                                    {errors.confirmText && (
                                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                                            <i className="fa-solid fa-circle-exclamation text-xs"></i>
                                            {errors.confirmText.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-center pt-2">
                                    <NewButton
                                        type="submit"
                                        variant="destructive"
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin mr-2" aria-hidden />
                                                Eliminar Conta Permanentemente
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-duotone fa-trash-can mr-2 ml-2"></i>
                                                Eliminar Conta Permanentemente
                                            </>
                                        )}
                                    </NewButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
