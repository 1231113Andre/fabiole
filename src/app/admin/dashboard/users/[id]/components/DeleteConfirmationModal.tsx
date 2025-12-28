import React, { useState } from "react";
import NewButton from "@/app/components/newButton";
import { ButtonSpinner } from "@/app/admin/components/LoadingStates";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    title?: string;
    message: string;
    onClose: () => void;
    onConfirm: (dontAskAgain: boolean) => void;
    isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    title = "Eliminar Registo",
    message,
    onClose,
    onConfirm,
    isDeleting = false
}) => {
    const [dontAsk, setDontAsk] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
                        <i className="fa-duotone fa-trash-can text-3xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500">{message}</p>
                </div>

                <div className="flex items-center gap-2 mb-6 justify-center bg-gray-50 p-3 rounded-lg border border-gray-100 cursor-pointer" onClick={() => setDontAsk(!dontAsk)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${dontAsk ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300'}`}>
                        {dontAsk && <i className="fa-solid fa-check text-xs"></i>}
                    </div>
                    <label className="text-sm text-gray-600 font-medium cursor-pointer select-none">
                        Não voltar a perguntar
                    </label>
                </div>

                <div className="flex gap-3">
                    <NewButton
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 justify-center h-11"
                        disabled={isDeleting}
                    >
                        Cancelar
                    </NewButton>
                    <NewButton
                        variant="new_pendente_rounded"
                        onClick={() => onConfirm(dontAsk)}
                        className="flex-1 justify-center h-11 bg-red-600 text-white border-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                    >
                        {isDeleting ? <ButtonSpinner color="white" /> : "Eliminar"}
                    </NewButton>
                </div>
            </div>
        </div>
    );
};
