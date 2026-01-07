"use client";

import { useState, lazy, Suspense } from "react";
import { Tab, UserData } from "./types";
import { UserHeader } from "./components/UserHeader";
import { UserEditForm } from "./components/UserEditForm";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import NewButton from "@/app/components/newButton";
import { useUserEdit } from "./hooks/useUserEdit";
import { useRecordOperations } from "./hooks/useRecordOperations";
// Direct import for PesagensSection to ensure proper re-renders
import { PesagensSection } from "./components/PesagensSection";
const PerimetrosSection = lazy(() =>
    import("./components/PerimetrosSection").then(module => ({ default: module.PerimetrosSection }))
);
const AvaliacoesSection = lazy(() =>
    import("./components/AvaliacoesSection").then(module => ({ default: module.AvaliacoesSection }))
);
const DefinicoeSection = lazy(() =>
    import("./components/DefinicoeSection").then(module => ({ default: module.DefinicoeSection }))
);

interface UserEditClientProps {
    initialUser: UserData;
}

const LoadingSection = () => (
    <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
);

export function UserEditClient({ initialUser }: UserEditClientProps) {
    const userId = initialUser.id;
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; endpoint: 'pesagens' | 'perimetros' | 'avaliacoes'; id: number; message: string } | null>(null);

    const {
        user,
        setUser,
        saving,
        setSaving,
        error,
        success,
        setError,
        setSuccess,
        fetchUser,
        handleSaveUser
    } = useUserEdit(userId, initialUser);

    const {
        isDeleting,
        handleSaveRecord,
        handleBulkSave,
        executeDelete
    } = useRecordOperations({
        userId,
        fetchUser,
        setSuccess,
        setError,
        setSaving
    });

    const handleDeleteRecord = async (endpoint: 'pesagens' | 'perimetros' | 'avaliacoes', id: number, message: string) => {
        const dontAsk = localStorage.getItem('fabiole_dont_ask_delete');
        if (dontAsk === 'true') {
            await executeDelete(endpoint, id);
            return;
        }

        setDeleteModal({
            isOpen: true,
            endpoint,
            id,
            message
        });
    };

    const handleConfirmDelete = async (dontAsk: boolean) => {
        if (!deleteModal) return;

        if (dontAsk) {
            localStorage.setItem('fabiole_dont_ask_delete', 'true');
        }

        await executeDelete(deleteModal.endpoint, deleteModal.id);
        setDeleteModal(null);
    };

    const tabs: { id: Tab; label: string; icon: string; count?: number }[] = [
        { id: 'info', label: 'Informações', icon: 'fa-user' },
        { id: 'pesagens', label: 'Pesagens', icon: 'fa-weight-scale', count: user.pesagens.length },
        { id: 'perimetros', label: 'Perímetros', icon: 'fa-ruler-combined', count: user.perimetros.length },
        { id: 'avaliacoes', label: 'Avaliações', icon: 'fa-dumbbell', count: user.avaliacoes.length },
        { id: 'definicoes', label: 'Definições', icon: 'fa-gear', count: 4 }
    ];

    return (
        <div>
            <UserHeader user={user} onUpdate={fetchUser} />

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                    <i className="fa-duotone fa-circle-exclamation"></i>
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 flex items-start gap-3">
                    <i className="fa-duotone fa-check-circle"></i>
                    {success}
                </div>
            )}

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <NewButton
                            key={tab.id}
                            variant={isActive ? "new_primary_rounded" : "new_primary_no_bg_rounded"}
                            onClick={() => setActiveTab(tab.id)}
                            icon={<i className={`fa-duotone ${tab.icon}`}></i>}
                            className={`h-11 ${!isActive ? 'bg-white border-gray-200 hover:border-orange-400' : ''}`}
                        >
                            <span className="mr-2">{tab.label}</span>
                            {tab.count !== undefined && (
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </NewButton>
                    );
                })}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                {activeTab === 'info' && (
                    <UserEditForm
                        user={user}
                        setUser={setUser}
                        onSave={handleSaveUser}
                        saving={saving}
                    />
                )}

                {activeTab === 'pesagens' && (
                    <PesagensSection
                        pesagens={user.pesagens}
                        onSave={(e, id, originalRecord) => handleSaveRecord('pesagens', e, id, originalRecord)}
                        onBulkSave={(data) => handleBulkSave('pesagens', data)}
                        onDelete={(id) => handleDeleteRecord('pesagens', id, "Tem a certeza que deseja eliminar esta pesagem?")}
                        gender={user.gender}
                        userBirth={user.birth}
                    />
                )}

                {activeTab === 'perimetros' && (
                    <Suspense fallback={<LoadingSection />}>
                        <PerimetrosSection
                            perimetros={user.perimetros}
                            onSave={(e, id, originalRecord) => handleSaveRecord('perimetros', e, id, originalRecord)}
                            onBulkSave={(data) => handleBulkSave('perimetros', data)}
                            onDelete={(id) => handleDeleteRecord('perimetros', id, "Tem a certeza que deseja eliminar este perímetro?")}
                        />
                    </Suspense>
                )}

                {activeTab === 'avaliacoes' && (
                    <Suspense fallback={<LoadingSection />}>
                        <AvaliacoesSection
                            avaliacoes={user.avaliacoes}
                            pesagens={user.pesagens}
                            onSave={(e, id, originalRecord) => handleSaveRecord('avaliacoes', e, id, originalRecord)}
                            onBulkSave={(data) => handleBulkSave('avaliacoes', data)}
                            onDelete={(id) => handleDeleteRecord('avaliacoes', id, "Tem a certeza que deseja eliminar esta avaliação?")}
                            gender={user.gender}
                            userBirth={user.birth}
                        />
                    </Suspense>
                )}

                {activeTab === 'definicoes' && (
                    <Suspense fallback={<LoadingSection />}>
                        <DefinicoeSection
                            userId={user.id}
                            userEmail={user.email}
                            userName={user.name || ''}
                            userSurname={user.surname || ''}
                            status={user.status || 'ACTIVE'}
                            statusChangedBy={user.statusChangedBy}
                            statusChangedAt={user.statusChangedAt}
                            statusReason={user.statusReason}
                            userRole={user.role}
                            userCreatedAt={user.createdAt}
                            userGender={user.gender}
                            userDebt={user.debtValue}
                            userCredits={user.trainingCredit}
                            userScheduled={user.trainingsScheduled}
                            userPaid={typeof user.paid === 'boolean' ? (user.paid ? 'PAGO' : 'PENDENTE') : (!user.paid || user.paid === '-' ? 'EM ANÁLISE' : user.paid)}
                            onEmailChanged={(newEmail) => setUser({ ...user, email: newEmail })}
                            onStatusChanged={(newStatus) => setUser({ ...user, status: newStatus, statusChangedAt: new Date().toISOString() })}
                        />
                    </Suspense>
                )}
            </div>

            {deleteModal && (
                <DeleteConfirmationModal
                    isOpen={deleteModal.isOpen}
                    message={deleteModal.message}
                    onClose={() => setDeleteModal(null)}
                    onConfirm={handleConfirmDelete}
                    isDeleting={isDeleting}
                />
            )}
        </div>
    );
}
