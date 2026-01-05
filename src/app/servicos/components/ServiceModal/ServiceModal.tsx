"use client";
import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import NewButton from "@/app/components/newButton";
import { TrainingDuration, TrainingType } from "../../types";
import { calculatePrice } from "../../utils/priceCalculator";

interface ServiceModalProps {
    serviceTitle: string | null;
    onClose: () => void;
}

const DURATIONS: TrainingDuration[] = ["30 minutos", "45 minutos", "1 hora"];
const TRAINING_TYPES: Array<{ value: TrainingType; label: string; desc: string }> = [
    { value: "individual", label: "Individual", desc: "Treino 1:1" },
    { value: "dupla", label: "Dupla", desc: "+€2-5" },
    { value: "trio", label: "Trio", desc: "+€4-8" }
];
const FREQUENCIES = [1, 2, 3, 4, 5];

export function ServiceModal({ serviceTitle, onClose }: ServiceModalProps) {
    const router = useRouter();
    const [trainingFrequency, setTrainingFrequency] = useState<number>(1);
    const [trainingDuration, setTrainingDuration] = useState<TrainingDuration>("30 minutos");
    const [trainingType, setTrainingType] = useState<TrainingType>("individual");

    const handleContinue = useCallback(() => {
        if (!serviceTitle) return;
        
        const params = new URLSearchParams({
            service: serviceTitle,
            frequency: trainingFrequency.toString(),
            duration: trainingDuration,
            type: trainingType
        });

        router.push(`/contacto?${params.toString()}`);
    }, [serviceTitle, trainingFrequency, trainingDuration, trainingType, router]);

    // Memoize price calculation to avoid recalculating on every render
    const price = useMemo(() => {
        return serviceTitle ? calculatePrice(serviceTitle, trainingFrequency, trainingDuration, trainingType) : 0;
    }, [serviceTitle, trainingFrequency, trainingDuration, trainingType]);

    if (!serviceTitle) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl relative border border-gray-100">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    <i className="fa-duotone fa-xmark text-xl"></i>
                </button>
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 font-fugazone uppercase">
                        Personalizar {serviceTitle.toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 font-montserrat">
                        Escolhe a frequência e duração dos teus treinos
                    </p>
                </div>

                <div className="space-y-5">
                    {/* Training Frequency */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3 font-montserrat">
                            Frequência de Treinos por Semana
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {FREQUENCIES.map((freq) => (
                                <button
                                    key={freq}
                                    onClick={() => setTrainingFrequency(freq)}
                                    className={`py-3 px-4 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
                                        trainingFrequency === freq
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {freq}x
                                </button>
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
                                    <button
                                        key={duration}
                                        onClick={() => setTrainingDuration(duration)}
                                        className={`w-full py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 text-left text-sm cursor-pointer ${
                                            trainingDuration === duration
                                                ? 'bg-primary text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {duration}
                                    </button>
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
                                    <button
                                        key={type.value}
                                        onClick={() => setTrainingType(type.value)}
                                        className={`w-full text-left py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 text-sm cursor-pointer ${
                                            trainingType === type.value
                                                ? 'bg-primary text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span>{type.label}</span>
                                            <small className="opacity-75 text-xs">{type.desc}</small>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Price Display */}
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 mt-2 border border-primary/20">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2 font-montserrat font-medium">Preço/Semana</p>
                            <p className="text-4xl font-bold text-primary mb-2 font-fugazone">€{price}</p>
                            <p className="text-xs text-gray-500 font-montserrat">
                                {trainingFrequency}x por semana • {trainingDuration} • {trainingType === "individual" ? "Individual" : trainingType === "dupla" ? "Dupla" : "Trio"}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <NewButton
                            onClick={onClose}
                            variant="new_destructive_rounded"
                            className="flex-1 uppercase"
                            icon={<i className="fa-duotone fa-xmark"></i>}
                            iconPosition="left"
                        >
                            Cancelar
                        </NewButton>
                        <NewButton
                            onClick={handleContinue}
                            variant="new_primary_rounded"
                            className="flex-1 uppercase"
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

