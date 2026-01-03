import { useState } from "react";
import { Pesagem } from "../../types";
import {
    calculateBMI,
    classifyBMI,
    classifyBodyFat,
    calculateMM,
    calculateH2O,
    calculateAge,
    parseNumber
} from "@/lib/utils/bodyMetrics";

interface UsePesagemFormProps {
    gender: string;
    userBirth?: Date | string | null; // For Watson H2O formula
    onSave: (e: React.FormEvent<HTMLFormElement>, editingId?: number, originalRecord?: Pesagem) => Promise<void>;
}

// Fields that are auto-calculated and can be manually overridden
const AUTO_CALCULATED_FIELDS: (keyof Pesagem)[] = ['mm', 'h2o', 'imc', 'resultadoIMC', 'resultadoPercentMG'];

export function usePesagemForm({ gender, userBirth, onSave }: UsePesagemFormProps) {
    // Calculate user age from birth date for Watson H2O formula
    const userAge = userBirth ? calculateAge(userBirth) : null;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Partial<Pesagem> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Pesagem>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Track which auto-calculated fields have been manually overridden
    const [manualOverrides, setManualOverrides] = useState<Set<keyof Pesagem>>(new Set());

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

        const overrides = new Set<keyof Pesagem>();

        if (record) {
            // Check for manual overrides by comparing saved values with calculated ones
            const { peso, height, percentualMG, massaOssea } = record;

            // Check IMC override
            if (peso && height) {
                const calculatedBMI = calculateBMI(peso, height);
                // If saved IMC is significantly different from calculated, it's an override
                if (record.imc && calculatedBMI && Math.abs(record.imc - calculatedBMI) > 0.1) {
                    overrides.add('imc');
                }
                const expectedClass = classifyBMI(calculatedBMI);
                if (record.resultadoIMC && record.resultadoIMC !== expectedClass) {
                    overrides.add('resultadoIMC');
                }
            }

            // Check MM override - LBM formula only needs peso and %MG
            if (peso && percentualMG) {
                const calculatedMM = calculateMM(peso, percentualMG);
                if (record.mm && calculatedMM && Math.abs(record.mm - calculatedMM) > 0.1) {
                    overrides.add('mm');
                }
            }

            // Check H2O override - Watson formula needs peso, height, age, gender
            if (peso && record.height) {
                const calculatedH2O = calculateH2O(peso, record.height, userAge, gender);
                if (record.h2o && calculatedH2O && Math.abs(record.h2o - calculatedH2O) > 0.1) {
                    overrides.add('h2o');
                }
            }

            // Check Fat Class override
            if (percentualMG) {
                const expectedClass = classifyBodyFat(percentualMG, gender);
                if (record.resultadoPercentMG && record.resultadoPercentMG !== expectedClass) {
                    overrides.add('resultadoPercentMG');
                }
            }
        } else {
            // New record logic (keep existing)
            if (initialData.peso) {
                const bmi = calculateBMI(initialData.peso, initialData.height);
                if (bmi) {
                    initialData.imc = bmi;
                    initialData.resultadoIMC = classifyBMI(bmi) || '';
                }
                const mm = calculateMM(initialData.peso, initialData.percentualMG);
                if (mm) initialData.mm = mm;
                const h2o = calculateH2O(initialData.peso, initialData.height ?? null, userAge, gender);
                if (h2o) initialData.h2o = h2o;
            }
            if (initialData.percentualMG) {
                initialData.resultadoPercentMG = classifyBodyFat(initialData.percentualMG, gender) || '';
            }
        }

        setEditingRecord(record || null);
        setFormData(initialData);
        setManualOverrides(overrides);
        setIsModalOpen(true);
        setError(null);
    };

    const handleFieldChange = (field: keyof Pesagem, value: any) => {
        const newFormData = { ...formData, [field]: value };
        const newOverrides = new Set(manualOverrides);

        // If user is directly editing an auto-calculated field, mark it as manually overridden
        if (AUTO_CALCULATED_FIELDS.includes(field)) {
            newOverrides.add(field);
        }

        // Auto-calculate BMI (IMC) - only if not manually overridden
        if (field === 'peso' || field === 'height') {
            const p = field === 'peso' ? parseNumber(value) : parseNumber(formData.peso);
            const h = field === 'height' ? parseNumber(value) : parseNumber(formData.height);
            const bmi = calculateBMI(p, h);
            if (bmi) {
                if (!newOverrides.has('imc')) {
                    newFormData.imc = bmi;
                }
                if (!newOverrides.has('resultadoIMC')) {
                    newFormData.resultadoIMC = classifyBMI(bmi) || '';
                }
            }
        }

        // Auto-calculate Fat classification - only if not manually overridden
        if (field === 'percentualMG' && !newOverrides.has('resultadoPercentMG')) {
            newFormData.resultadoPercentMG = classifyBodyFat(parseNumber(value), gender) || '';
        }

        // Auto-calculate MM (Massa Muscular / LBM) - only if not manually overridden
        if ((field === 'peso' || field === 'percentualMG') && !newOverrides.has('mm')) {
            const p = field === 'peso' ? parseNumber(value) : parseNumber(formData.peso);
            const mg = field === 'percentualMG' ? parseNumber(value) : parseNumber(formData.percentualMG);
            const mm = calculateMM(p, mg);
            if (mm) {
                newFormData.mm = mm;
            }
        }

        // Auto-calculate H2O using Watson formula - only if not manually overridden
        if ((field === 'peso' || field === 'height') && !newOverrides.has('h2o')) {
            const p = field === 'peso' ? parseNumber(value) : parseNumber(formData.peso);
            const h = field === 'height' ? parseNumber(value) : parseNumber(formData.height);
            const h2o = calculateH2O(p, h, userAge, gender);
            if (h2o) {
                newFormData.h2o = h2o;
            }
        }

        setManualOverrides(newOverrides);
        setFormData(newFormData);
    };

    // Mark a field as manually overridden (for UI toggle)
    const setManualOverride = (field: keyof Pesagem) => {
        setManualOverrides(prev => new Set(prev).add(field));
    };

    // Clear manual override and recalculate the field's auto value
    const clearManualOverride = (field: keyof Pesagem) => {
        const newOverrides = new Set(manualOverrides);
        newOverrides.delete(field);
        setManualOverrides(newOverrides);

        // Recalculate the cleared field
        const newFormData = { ...formData };
        if (field === 'imc' && formData.peso && formData.height) {
            const bmi = calculateBMI(parseNumber(formData.peso), parseNumber(formData.height));
            if (bmi) newFormData.imc = bmi;
        }
        if (field === 'resultadoIMC' && formData.imc) {
            newFormData.resultadoIMC = classifyBMI(formData.imc as number) || '';
        }
        if (field === 'resultadoPercentMG' && formData.percentualMG) {
            newFormData.resultadoPercentMG = classifyBodyFat(parseNumber(formData.percentualMG), gender) || '';
        }
        if (field === 'mm' && formData.peso) {
            const mm = calculateMM(parseNumber(formData.peso), parseNumber(formData.percentualMG));
            if (mm) newFormData.mm = mm;
        }
        if (field === 'h2o' && formData.peso) {
            const h2o = calculateH2O(parseNumber(formData.peso), parseNumber(formData.height), userAge, gender);
            if (h2o) newFormData.h2o = h2o;
        }
        setFormData(newFormData);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(e, editingRecord?.id, editingRecord ? (editingRecord as Pesagem) : undefined);
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
        setManualOverrides(new Set());
    };

    return {
        isModalOpen,
        editingRecord,
        error,
        formData,
        isSubmitting,
        manualOverrides,
        handleOpenModal,
        handleFieldChange,
        handleSubmit,
        handleCloseModal,
        setManualOverride,
        clearManualOverride
    };
}
