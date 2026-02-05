"use client";

import React from 'react';
import { StepItem, LoadingSpinner as UiSpinner } from "@/components/ui/spinner";

interface LoadingSpinnerProps {
    // Component size classes (e.g. h-10 w-10)
    size?: string;
    className?: string;
    steps?: StepItem[];
    stepInterval?: number;
}

const DEFAULT_STEPS: StepItem[] = [
    { label: "A carregar...", description: "Estamos a preparar o seu dashboard." },
    { label: "Verificando sessão", description: "A validar as suas credenciais de acesso." },
    { label: "Sincronizando dados", description: "A obter as informações mais recentes." },
    { label: "Quase pronto", description: "A finalizar a configuração da interface." }
];

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    className,
    size = "text-6xl", // Using larger text size for FA icon
    steps = DEFAULT_STEPS,
    stepInterval = 1200 // Faster cycling by default
}) => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-boxdark-2 z-50">
            <UiSpinner
                size={size}
                steps={steps}
                stepInterval={stepInterval}
                className={className}
            />
        </div>
    );
};
