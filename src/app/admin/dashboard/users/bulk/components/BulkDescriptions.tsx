import React, { memo } from "react";

export const PesagensDescription = memo(function PesagensDescription() {
    return (
        <span className="inline-flex items-center gap-1.5 flex-wrap justify-end">
            <span className="inline-flex items-center gap-1 text-violet-700 font-semibold">
                <i className="fa-duotone fa-robot text-xs"></i>
                <span>Cálculo automático:</span>
            </span>
            <span className="text-gray-700">IMC, MM, H2O</span>
            <span className="text-gray-400">•</span>
            <span className="inline-flex items-center gap-1 text-violet-700 font-semibold">
                <i className="fa-duotone fa-weight-scale text-xs"></i>
                <span>Delta de peso</span>
            </span>
            <span className="text-gray-400">•</span>
            <span className="inline-flex items-center gap-1 text-violet-600">
                <span className="text-sm">🤖</span>
                <span>Campos automáticos</span>
            </span>
            <span className="text-gray-400">•</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                <i className="fa-duotone fa-tags text-xs"></i>
                <span>Classificação IMC e %MG</span>
            </span>
        </span>
    );
});

export const PerimetrosDescription = memo(function PerimetrosDescription() {
    return (
        <span className="flex flex-col items-end gap-0.5">
            <span className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                <span className="text-violet-700 font-semibold inline-flex items-center gap-1">
                    <i className="fa-duotone fa-ruler-combined text-xs"></i>
                    <span>Registo completo</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-700">Atualização em tempo real</span>
                <span className="text-gray-400">•</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <i className="fa-duotone fa-body-text text-xs"></i>
                    <span>Medidas corporais</span>
                </span>
            </span>
            <span className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                    <i className="fa-duotone fa-arrows-left-right text-xs"></i>
                    <span>Braços, Peito, Cintura, Anca, Coxas</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                    <i className="fa-duotone fa-chart-line-up text-xs"></i>
                    <span>Evolução física</span>
                </span>
            </span>
        </span>
    );
});

export const AvaliacoesDescription = memo(function AvaliacoesDescription() {
    return (
        <span className="inline-flex items-center gap-1.5 flex-wrap justify-end">
            <span className="text-violet-700 font-semibold inline-flex items-center gap-1">
                <i className="fa-duotone fa-dumbbell text-xs"></i>
                <span>Registo completo</span>
            </span>
            <span className="text-gray-400">•</span>
            <span className="inline-flex items-center gap-1 text-violet-700 font-semibold">
                <i className="fa-duotone fa-robot text-xs"></i>
                <span>Cálculo automático</span>
            </span>
            <span className="text-gray-400">•</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                <i className="fa-duotone fa-ranking-star text-xs"></i>
                <span>Avaliação de performance</span>
            </span>
            <span className="text-gray-400">•</span>
            <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                <i className="fa-duotone fa-person-running text-xs"></i>
                <span>Flexões, Abdominais, Milha</span>
            </span>
        </span>
    );
});

export const getDescription = (type: 'pesagens' | 'perimetros' | 'avaliacoes') => {
    switch (type) {
        case 'pesagens': return <PesagensDescription />;
        case 'perimetros': return <PerimetrosDescription />;
        case 'avaliacoes': return <AvaliacoesDescription />;
    }
};

