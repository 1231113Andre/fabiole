import React, { useCallback } from "react";
import { useRecordMutations } from "./useRecordMutations";

interface UseRecordOperationsProps {
    userId: string;
    fetchUser: () => Promise<void>; // Kept for interface compatibility but largely unused now
    onLocalUpdate?: (endpoint: string, record: any, isDelete?: boolean) => void;
    setSuccess: (message: React.ReactNode | null) => void;
    setError: (message: string | null) => void;
    setSaving: (saving: boolean) => void;
}

export function useRecordOperations({ userId, onLocalUpdate, setSuccess, setError, setSaving }: UseRecordOperationsProps) {
    const { saveRecordMutation, bulkSaveMutation, deleteRecordMutation } = useRecordMutations(userId);

    const handleSaveRecord = useCallback(async (
        endpoint: string,
        e: React.FormEvent<HTMLFormElement>,
        editingId?: number,
        originalData?: any
    ) => {
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Simple numeric conversion
        const payload: any = { ...data };
        Object.keys(payload).forEach(key => {
            if (key !== 'date' && key !== 'notas' && key !== 'notes' && key !== 'mile' && key !== 'mileResult' && payload[key]) {
                if (key === 'resultadoIMC' || key === 'resultadoPercentMG') return;
                const val = parseFloat(payload[key].toString());
                if (!isNaN(val)) payload[key] = val;
            }
        });

        setSaving(true);
        setSuccess(null);
        setError(null);

        try {
            const savedRecord = await saveRecordMutation.mutateAsync({
                endpoint,
                payload,
                editingId
            });

            // Local callback for non-React Query updates (if any parent still needs it)
            if (onLocalUpdate) {
                onLocalUpdate(endpoint, savedRecord);
            }

            // Generate Diff Message
            const endpointNames: Record<string, string> = {
                pesagens: 'Pesagem',
                perimetros: 'Perímetro',
                avaliacoes: 'Avaliação'
            };
            const name = endpointNames[endpoint] || 'Registo';

            let diffMessage: React.ReactNode = editingId ? `${name} atualizado com sucesso` : `${name} adicionado com sucesso`;

            if (editingId && originalData) {
                const changes: { key: string; icon: string; old: any; new: any }[] = [];

                // Fields to ignore in diff
                const ignoredFields = ['id', 'userId', 'uuid', 'createdAt', 'updatedAt', 'notes', 'notas'];

                // Labels & Icons mapping
                const fieldConfig: Record<string, { label: string; icon: string }> = {
                    weight: { label: 'Peso', icon: 'fa-weight-scale' },
                    height: { label: 'Altura', icon: 'fa-ruler-vertical' },
                    fatMassPercent: { label: '% Gordura', icon: 'fa-percent' },
                    muscleMass: { label: 'Massa Musc.', icon: 'fa-dumbbell' },
                    waterPercent: { label: 'H2O', icon: 'fa-droplet' },
                    imc: { label: 'IMC', icon: 'fa-calculator' },
                    visceralFat: { label: 'Gord. Visceral', icon: 'fa-heart-pulse' },
                    metabolicAge: { label: 'Idade Metab.', icon: 'fa-clock' },
                    boneMass: { label: 'Massa Óssea', icon: 'fa-bone' },
                    // Perimetros
                    neck: { label: 'Pescoço', icon: 'fa-ruler-horizontal' },
                    chest: { label: 'Peito', icon: 'fa-ruler-horizontal' },
                    shoulders: { label: 'Ombros', icon: 'fa-ruler-horizontal' },
                    waist: { label: 'Cintura', icon: 'fa-ruler-horizontal' },
                    abdomen: { label: 'Abdómen', icon: 'fa-ruler-horizontal' },
                    hips: { label: 'Anca', icon: 'fa-ruler-horizontal' },
                    rightArm: { label: 'Braço Dir.', icon: 'fa-ruler-horizontal' },
                    leftArm: { label: 'Braço Esq.', icon: 'fa-ruler-horizontal' },
                    rightForearm: { label: 'Antebraço Dir.', icon: 'fa-ruler-horizontal' },
                    leftForearm: { label: 'Antebraço Esq.', icon: 'fa-ruler-horizontal' },
                    rightThigh: { label: 'Coxa Dir.', icon: 'fa-ruler-horizontal' },
                    leftThigh: { label: 'Coxa Esq.', icon: 'fa-ruler-horizontal' },
                    rightCalf: { label: 'Gémeo Dir.', icon: 'fa-ruler-horizontal' },
                    leftCalf: { label: 'Gémeo Esq.', icon: 'fa-ruler-horizontal' },
                    date: { label: 'Data', icon: 'fa-calendar' }
                };

                const formatDate = (val: string) => {
                    if (!val) return '-';
                    return new Date(val).toLocaleDateString('pt-PT');
                };

                const formatValue = (key: string, val: any) => {
                    if (key === 'date') return formatDate(val);
                    if (typeof val === 'number') return Math.round(val * 100) / 100;
                    return val;
                };

                Object.keys(payload).forEach(key => {
                    if (ignoredFields.includes(key)) return;

                    const oldVal = originalData[key];
                    const newVal = payload[key];
                    const config = fieldConfig[key] || { label: key, icon: 'fa-pen-to-square' };

                    if (key === 'date') {
                        if (formatDate(oldVal) !== formatDate(newVal)) {
                            changes.push({
                                key: config.label,
                                icon: config.icon,
                                old: formatDate(oldVal),
                                new: formatDate(newVal)
                            });
                        }
                    } else if (oldVal != newVal) {
                        changes.push({
                            key: config.label,
                            icon: config.icon,
                            old: formatValue(key, oldVal),
                            new: formatValue(key, newVal)
                        });
                    }
                });

                if (changes.length > 0) {
                    diffMessage = (
                        <div className="flex flex-col text-[#0F172A]">
                            <div className="font-semibold text-[15px] leading-none -mt-[2px]">
                                O registo de {name} foi atualizado com sucesso.
                            </div>
                            <div className="mt-4 text-sm font-medium text-[#0F172A]/80">
                                The records updated:
                            </div>
                            <div className="flex flex-col gap-2 mt-2 pl-1">
                                {changes.map((change, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                        <i className="fa-solid fa-rotate text-emerald-600 text-xs"></i>
                                        <span>
                                            <span className="font-bold uppercase">{change.key}</span> updated from <span className="font-bold">{change.old}</span> to <span className="font-bold">{change.new}</span> new value.
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }
            }

            setSuccess(diffMessage);
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [saveRecordMutation, onLocalUpdate, setSuccess, setError, setSaving]);

    const handleBulkSave = useCallback(async (endpoint: string, data: any[]) => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const records = data.map(record => {
                const payload: any = { ...record };
                if (typeof payload.id === 'string' && payload.id.startsWith('temp_')) {
                    delete payload.id;
                }
                return payload;
            });

            const result = await bulkSaveMutation.mutateAsync({
                endpoint,
                records
            });

            setSuccess(`${result.count} registos adicionados com sucesso!`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [bulkSaveMutation, setSuccess, setError, setSaving]);

    const executeDelete = useCallback(async (endpoint: string, id: number) => {
        try {
            await deleteRecordMutation.mutateAsync({ endpoint, id });

            if (onLocalUpdate) {
                onLocalUpdate(endpoint, { id }, true);
            }

            setSuccess("Registo eliminado com sucesso");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError("Erro: " + err.message);
        }
    }, [deleteRecordMutation, onLocalUpdate, setSuccess, setError]);

    return {
        isDeleting: deleteRecordMutation.isPending,
        handleSaveRecord,
        handleBulkSave,
        executeDelete
    };
}
