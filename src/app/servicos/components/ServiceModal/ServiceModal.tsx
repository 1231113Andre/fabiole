"use client";
import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import NewButton from "@/app/components/newButton";
import { TrainingDuration, TrainingType } from "../../types";
import { calculatePrice } from "../../utils/priceCalculator";

interface ServiceModalProps {
    serviceTitle: string | null;
    onClose: () => void;
    pricingConfig?: Record<string, any>;
}

const DURATIONS: TrainingDuration[] = ["30 minutos", "45 minutos", "1 hora"];
const TRAINING_TYPES: Array<{ value: TrainingType; label: string; desc: string }> = [
    { value: "individual", label: "Individual", desc: "Treino 1:1" },
    { value: "dupla", label: "Dupla", desc: "+€2-5" },
    { value: "trio", label: "Trio", desc: "+€4-8" }
];
const FREQUENCIES = [1, 2, 3, 4, 5];

export function ServiceModal({ serviceTitle, onClose, pricingConfig }: ServiceModalProps) {
    const router = useRouter();
    const [trainingFrequency, setTrainingFrequency] = useState<number>(1);
    const [trainingDuration, setTrainingDuration] = useState<TrainingDuration>("30 minutos");
    const [trainingType, setTrainingType] = useState<TrainingType>("individual");

    const handleContinue = useCallback(() => {
        if (!serviceTitle) return;

        const selectionData = {
            service: serviceTitle,
            frequency: trainingFrequency.toString(),
            duration: trainingDuration,
            type: trainingType
        };

        // Save to sessionStorage for persistence without URL params
        sessionStorage.setItem('contact_selection', JSON.stringify(selectionData));

        router.push('/contacto');
    }, [serviceTitle, trainingFrequency, trainingDuration, trainingType, router]);

    // Memoize price calculation to avoid recalculating on every render
    const price = useMemo(() => {
        return serviceTitle ? calculatePrice(serviceTitle, trainingFrequency, trainingDuration, trainingType, pricingConfig) : 0;
    }, [serviceTitle, trainingFrequency, trainingDuration, trainingType, pricingConfig]);

    if (!serviceTitle) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-lg w-full shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto animate-modal-in">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    <i className="fa-duotone fa-xmark text-xl"></i>
                </button>
                <div className="text-center mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 font-fugazone uppercase">
                        Personalizar {serviceTitle.toUpperCase()}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-montserrat">
                        Escolhe a frequência e duração dos teus treinos
                    </p>
                </div>

                <div className="space-y-3 sm:space-y-5">
                    {/* Training Frequency */}
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3 font-montserrat">
                            Frequência de Treinos por Semana
                        </label>
                        <div className="grid grid-cols-5 gap-1 sm:gap-2">
                            {FREQUENCIES.map((freq) => (
                                <NewButton
                                    key={freq}
                                    onClick={() => setTrainingFrequency(freq)}
                                    variant={trainingFrequency === freq ? "new_primary_rounded" : "ghost"}
                                    className="!px-2 !py-2 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm !bg-gray-100 !text-gray-700 hover:!bg-gray-200 !rounded-lg sm:!rounded-xl !font-bold"
                                >
                                    {freq}x
                                </NewButton>
                            ))}
                        </div>
                    </div>

                    {/* Training Duration and Type in Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Training Duration */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3 font-montserrat">
                                Duração do Treino
                            </label>
                            <div className="space-y-2">
                                {DURATIONS.map((duration) => (
                                    <NewButton
                                        key={duration}
                                        onClick={() => setTrainingDuration(duration)}
                                        variant={trainingDuration === duration ? "new_primary_rounded" : "ghost"}
                                        className="w-full !justify-start !py-2.5 !text-sm !bg-gray-100 !text-gray-700 hover:!bg-gray-200 !rounded-xl !font-semibold"
                                    >
                                        {duration}
                                    </NewButton>
                                ))}
                            </div>
                        </div>

                        {/* Training Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3 font-montserrat">
                                Tipo de Treino
                            </label>
                            <div className="space-y-2">
                                {TRAINING_TYPES.map((type) => (
                                    <NewButton
                                        key={type.value}
                                        onClick={() => setTrainingType(type.value)}
                                        variant={trainingType === type.value ? "new_primary_rounded" : "ghost"}
                                        className="w-full !justify-between !py-2.5 !text-sm !bg-gray-100 !text-gray-700 hover:!bg-gray-200 !rounded-xl !font-semibold"
                                    >
                                        <span>{type.label}</span>
                                        <small className={`text-xs ${trainingType === type.value ? 'opacity-75' : 'text-gray-500'}`}>{type.desc}</small>
                                    </NewButton>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Price Display */}
                    <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-3 sm:mt-4 border border-gray-100">
                        <div className="flex flex-col items-center">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 sm:mb-2 font-montserrat">
                                Preço/Semana
                            </p>
                            <p className="text-3xl sm:text-5xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tight font-montserrat">
                                €{price}
                            </p>

                            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 w-full">
                                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-700 shadow-sm">
                                    <i className="fa-duotone fa-calendar-check text-emerald-500"></i>
                                    {trainingFrequency}x por semana
                                </span>
                                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-700 shadow-sm">
                                    <i className="fa-duotone fa-timer text-amber-500"></i>
                                    {trainingDuration}
                                </span>
                                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-700 shadow-sm">
                                    <i className="fa-duotone fa-user text-blue-500"></i>
                                    {trainingType === "individual" ? "Individual" : trainingType === "dupla" ? "Dupla" : "Trio"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-3 pt-2">
                        <NewButton
                            onClick={onClose}
                            variant="new_destructive_rounded"
                            className="flex-1 uppercase text-xs sm:text-base"
                            icon={<i className="fa-duotone fa-xmark"></i>}
                            iconPosition="left"
                        >
                            Cancelar
                        </NewButton>
                        <NewButton
                            onClick={handleContinue}
                            variant="new_primary_rounded"
                            className="flex-1 uppercase text-xs sm:text-base"
                            icon={<i className="fa-duotone fa-check"></i>}
                            iconPosition="left"
                        >
                            Continuar
                        </NewButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

