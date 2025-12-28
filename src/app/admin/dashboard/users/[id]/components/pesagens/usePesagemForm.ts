import { useState } from "react";
import { Pesagem } from "../../types";
import {
    calculateBMI,
    classifyBMI,
    classifyBodyFat,
    calculateMM,
    calculateH2O
} from "@/lib/utils/bodyMetrics";

interface UsePesagemFormProps {
    gender: string;
    onSave: (e: React.FormEvent<HTMLFormElement>, editingId?: number) => Promise<void>;
}

export function usePesagemForm({ gender, onSave }: UsePesagemFormProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Partial<Pesagem> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Pesagem>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenModal = (record?: Pesagem) => {
        const initialData = record || {
            date: new Date().toISOString(),
            peso: null,
            height: null,
            percentualMG: null,
            mm: null,
            h2o: null,
            gordVisceral: null,
            idMetabolica: null,
            massaOssea: null,
            imc: null,
            resultadoIMC: null,
            resultadoPercentMG: null,
            notas: null
        };

        // Calculate auto values if data exists
        if (initialData.peso) {
            const bmi = calculateBMI(initialData.peso, initialData.height);
            if (bmi) {
                initialData.imc = bmi;
                initialData.resultadoIMC = classifyBMI(bmi) || '';
            }
            const mm = calculateMM(initialData.peso, initialData.percentualMG, initialData.massaOssea);
            if (mm) initialData.mm = mm;
            const h2o = calculateH2O(initialData.peso, gender);
            if (h2o) initialData.h2o = h2o;
        }
        if (initialData.percentualMG) {
            initialData.resultadoPercentMG = classifyBodyFat(initialData.percentualMG, gender) || '';
        }

        setEditingRecord(record || null);
        setFormData(initialData);
        setIsModalOpen(true);
        setError(null);
    };

    const handleFieldChange = (field: keyof Pesagem, value: any) => {
        const newFormData = { ...formData, [field]: value };

        // Auto-calculate BMI (IMC)
        if (field === 'peso' || field === 'height') {
            const p = field === 'peso' ? value : formData.peso;
            const h = field === 'height' ? value : formData.height;
            const bmi = calculateBMI(p, h);
            if (bmi) {
                newFormData.imc = bmi;
                newFormData.resultadoIMC = classifyBMI(bmi) || '';
            }
        }

        // Auto-calculate Fat classification
        if (field === 'percentualMG') {
            newFormData.resultadoPercentMG = classifyBodyFat(value, gender) || '';
        }

        // Auto-calculate MM (Massa Muscular)
        if (field === 'peso' || field === 'percentualMG' || field === 'massaOssea') {
            const p = field === 'peso' ? value : formData.peso;
            const mg = field === 'percentualMG' ? value : formData.percentualMG;
            const ossea = field === 'massaOssea' ? value : formData.massaOssea;
            const mm = calculateMM(p, mg, ossea);
            if (mm) {
                newFormData.mm = mm;
            }
        }

        // Auto-calculate H2O
        if (field === 'peso') {
            const h2o = calculateH2O(value, gender);
            if (h2o) {
                newFormData.h2o = h2o;
            }
        }

        setFormData(newFormData);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(e, editingRecord?.id);
            setIsModalOpen(false);
            setEditingRecord(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRecord(null);
    };

    return {
        isModalOpen,
        editingRecord,
        error,
        formData,
        isSubmitting,
        handleOpenModal,
        handleFieldChange,
        handleSubmit,
        handleCloseModal
    };
}
