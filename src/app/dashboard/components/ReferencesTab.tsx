"use client";

import { useState } from "react";
import { ReferenceTables, Gender, Category } from "../types";
import NewButton from "@/app/components/newButton";
import { cn } from "@/lib/utils";

interface ReferencesTabProps {
    referenceTables: ReferenceTables;
    selectedGender: Gender | null;
    setSelectedGender: (gender: Gender | null) => void;
    selectedCategory: Category;
    setSelectedCategory: (category: Category) => void;
}

export function ReferencesTab({
    referenceTables,
    selectedGender,
    setSelectedGender,
    selectedCategory,
    setSelectedCategory
}: ReferencesTabProps) {

    // Helper to get data based on selection
    const getData = () => {
        if (!selectedGender) return null;
        const genderKey = selectedGender === "MALE" ? "Masculino" : "Feminino";

        switch (selectedCategory) {
            case "massaGorda":
                return referenceTables?.[`massaGorda${genderKey}` as keyof ReferenceTables];
            case "flexoes":
                return referenceTables?.[`flexoes${genderKey}` as keyof ReferenceTables];
            case "abdominais":
                return referenceTables?.[`abdominais${genderKey}` as keyof ReferenceTables];
            case "milha":
                return referenceTables?.[`milha${genderKey}` as keyof ReferenceTables];
            case "smi":
                return referenceTables?.[`smi${genderKey}` as keyof ReferenceTables];
            default:
                return null;
        }
    };

    const currentData = getData();

    return (
        <div className="space-y-8">
            {/* Gender Selection - Initial View */}
            {!selectedGender && (
                <div className="flex flex-wrap justify-center gap-6 animate-in fade-in zoom-in duration-500">
                    <NewButton
                        onClick={() => setSelectedGender("MALE")}
                        variant="new_primary_rounded"
                        className="w-full sm:w-auto min-w-[200px] uppercase font-bold"
                        icon={<i className="fa-duotone fa-mars text-lg"></i>}
                    >
                        Masculino
                    </NewButton>
                    <NewButton
                        onClick={() => setSelectedGender("FEMALE")}
                        variant="new_primary_rounded"
                        className="w-full sm:w-auto min-w-[200px] uppercase font-bold"
                        icon={<i className="fa-duotone fa-venus text-lg"></i>}
                    >
                        Feminino
                    </NewButton>
                </div>
            )}

            {/* Default View: IMC Table */}
            {!selectedGender && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden max-w-7xl mx-auto animate-in fade-in duration-500">
                    <div className="border-b border-gray-100 px-6 py-5 bg-gray-50/50">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <i className="fa-duotone fa-scale-balanced"></i>
                            </div>
                            ⚖️ ÍNDICE DE MASSA CORPORAL (IMC)
                        </h4>
                    </div>
                    <div className="p-0">
                        <div className="overflow-x-auto premium-scrollbar shadow-inner">
                            <table className="w-full text-left text-sm min-w-max">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="px-6 py-4 font-semibold text-gray-700">Categoria</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700 text-right">Intervalo IMC</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 text-gray-600">Baixo Peso</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">&lt; 18,5</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50/50 bg-green-50/30">
                                        <td className="px-6 py-4 text-green-700 font-medium">Peso Normal ✅</td>
                                        <td className="px-6 py-4 text-right font-bold text-green-700">18,5 - 24,9</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50/50 bg-yellow-50/30">
                                        <td className="px-6 py-4 text-yellow-700 font-medium">Pré-obesidade ⚠️</td>
                                        <td className="px-6 py-4 text-right font-bold text-yellow-700">25,0 - 29,9</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 text-orange-600">Obesidade Grau I</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">30,0 - 34,9</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 text-orange-700">Obesidade Grau II</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">35,0 - 39,9</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50/50 bg-red-50/30">
                                        <td className="px-6 py-4 text-red-700 font-medium">Obesidade Grau III ❌</td>
                                        <td className="px-6 py-4 text-right font-bold text-red-700">40,0+</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Gender Selected View */}
            {selectedGender && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">



                    {/* Category Navigation */}
                    <div className="flex flex-wrap justify-center gap-3">
                        <NewButton
                            variant={selectedCategory === "massaGorda" ? "new_primary_rounded" : "new_secondary_no_border_on_idle"}
                            onClick={() => setSelectedCategory("massaGorda")}
                            className="w-full sm:w-auto min-w-[160px]"
                        >
                            MASSA GORDA 💪
                        </NewButton>
                        <NewButton
                            variant={selectedCategory === "flexoes" ? "new_primary_rounded" : "new_secondary_no_border_on_idle"}
                            onClick={() => setSelectedCategory("flexoes")}
                            className="w-full sm:w-auto min-w-[160px]"
                        >
                            FLEXÕES 1&apos; 🏋️
                        </NewButton>
                        <NewButton
                            variant={selectedCategory === "abdominais" ? "new_primary_rounded" : "new_secondary_no_border_on_idle"}
                            onClick={() => setSelectedCategory("abdominais")}
                            className="w-full sm:w-auto min-w-[160px]"
                        >
                            ABDOMINAIS 1&apos; 🏋️
                        </NewButton>
                        <NewButton
                            variant={selectedCategory === "milha" ? "new_primary_rounded" : "new_secondary_no_border_on_idle"}
                            onClick={() => setSelectedCategory("milha")}
                            className="w-full sm:w-auto min-w-[160px]"
                        >
                            TESTE DA MILHA 🏃
                        </NewButton>
                        <NewButton
                            variant={selectedCategory === "smi" ? "new_primary_rounded" : "new_secondary_no_border_on_idle"}
                            onClick={() => setSelectedCategory("smi")}
                            className="w-full sm:w-auto min-w-[160px]"
                        >
                            SMI 💪
                        </NewButton>
                    </div>

                    {/* Data Table */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden max-w-7xl mx-auto">
                        <div className="border-b border-gray-100 px-6 py-5 bg-gray-50/50 flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-gray-900">
                                {selectedCategory === "massaGorda" && "Massa Gorda"}
                                {selectedCategory === "flexoes" && "Flexões (1 min)"}
                                {selectedCategory === "abdominais" && "Abdominais (1 min)"}
                                {selectedCategory === "milha" && "Teste da Milha (1609m)"}
                                {selectedCategory === "smi" && `SMI | ${selectedGender === "MALE" ? "MASCULINO" : "FEMININO"}`}
                                {selectedCategory !== "smi" && <span className="text-gray-400 font-normal ml-2">| {selectedGender === "MALE" ? "Masculino" : "Feminino"}</span>}
                            </h4>
                        </div>
                        <div className="overflow-x-auto premium-scrollbar shadow-inner">
                            {selectedCategory === "massaGorda" ? (
                                /* MASSA GORDA (Idade + níveis – Masculino e Feminino) */
                                <table className="w-full text-sm min-w-max">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Idade</th>
                                            <th className="px-4 py-3 text-center font-semibold text-green-700">Atleta/Excelente</th>
                                            <th className="px-4 py-3 text-center font-semibold text-blue-600">Bom/Saudável</th>
                                            <th className="px-4 py-3 text-center font-semibold text-yellow-600">Médio/Aceitável</th>
                                            <th className="px-4 py-3 text-center font-semibold text-red-600">Risco/Obesidade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {currentData && Object.entries(currentData)
                                            .sort(([a], [b]) => {
                                                const getStartAge = (key: string) => {
                                                    if (key.includes('+')) return 60;
                                                    const match = key.match(/^(\d+)/);
                                                    return match ? parseInt(match[1]) : 0;
                                                };
                                                return getStartAge(a) - getStartAge(b);
                                            })
                                            .map(([ageRange, values]: [string, any]) => (
                                                <tr key={ageRange} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{ageRange}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-green-700">{values.excelente || '-'}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-blue-700">{values.bom || '-'}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-yellow-700">{values.medio || '-'}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-red-700">{values.mau || '-'}</td>
                                                </tr>
                                            ))}
                                        {(!currentData || Object.keys(currentData).length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                    Dados indisponíveis. Tente recarregar a página.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : selectedCategory === "milha" ? (
                                /* TESTE DA MILHA (Idade + níveis – Masculino e Feminino) */
                                <table className="w-full text-sm min-w-max">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Idade</th>
                                            <th className="px-4 py-3 text-center font-semibold text-green-700">Excelente</th>
                                            <th className="px-4 py-3 text-center font-semibold text-blue-600">Bom</th>
                                            <th className="px-4 py-3 text-center font-semibold text-yellow-600">Médio</th>
                                            <th className="px-4 py-3 text-center font-semibold text-red-600">Fraco</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {currentData && Object.entries(currentData)
                                            .sort(([a], [b]) => {
                                                const getStartAge = (key: string) => {
                                                    if (key.includes('+')) return 60;
                                                    const match = key.match(/^(\d+)/);
                                                    return match ? parseInt(match[1]) : 0;
                                                };
                                                return getStartAge(a) - getStartAge(b);
                                            })
                                            .map(([ageRange, values]: [string, any]) => (
                                                <tr key={ageRange} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{ageRange}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-green-700">{values.excelente || '-'}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-blue-700">{values.bom || '-'}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-yellow-700">{values.medio || '-'}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-red-700">{values.fraco || '-'}</td>
                                                </tr>
                                            ))}
                                        {(!currentData || Object.keys(currentData).length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                    Dados indisponíveis. Tente recarregar a página.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : selectedCategory === "abdominais" ? (
                                /* ABDOMINAIS 1' (Idade + níveis – Homens e Mulheres) */
                                <table className="w-full text-sm min-w-max">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Idade</th>
                                            <th className="px-4 py-3 text-center font-semibold text-green-700">Excelente</th>
                                            <th className="px-4 py-3 text-center font-semibold text-blue-600">Bom</th>
                                            <th className="px-4 py-3 text-center font-semibold text-yellow-600">Médio</th>
                                            <th className="px-4 py-3 text-center font-semibold text-red-600">Abaixo da Média</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {currentData && Object.entries(currentData)
                                            .sort(([a], [b]) => {
                                                const getStartAge = (key: string) => {
                                                    const match = key.match(/^(\d+)/);
                                                    return match ? parseInt(match[1]) : 0;
                                                };
                                                return getStartAge(a) - getStartAge(b);
                                            })
                                            .map(([ageRange, values]: [string, any]) => (
                                                <tr key={ageRange} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{ageRange}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-green-700">{values.excelente || '-'}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-blue-700">{values.bom || '-'}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-yellow-700">{values.medio || '-'}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-red-700">{values.abaixoMedia || '-'}</td>
                                                </tr>
                                            ))}
                                        {(!currentData || Object.keys(currentData).length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                    Dados indisponíveis. Tente recarregar a página.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : selectedCategory === "smi" ? (
                                /* SMI – Categoria, SMI (kg/m²), Interpretação – cores como MASSA GORDA */
                                <>
                                    <div className="px-6 py-4 bg-gray-900 text-white font-mono text-sm rounded-lg mx-4 mt-4 mb-2">
                                        SMI = Massa Muscular (kg) / Altura (m)²
                                    </div>
                                    <table className="w-full text-sm min-w-max">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Categoria</th>
                                                <th className="px-4 py-3 text-center font-semibold text-gray-600">SMI (kg/m²)</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Interpretação</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {currentData && [
                                                { cat: "Excelente (Atleta)", bg: "bg-green-50/30", catColor: "text-green-700" },
                                                { cat: "Bom (Saudável)", bg: "bg-blue-50/30", catColor: "text-blue-700" },
                                                { cat: "Médio (Normal)", bg: "bg-yellow-50/30", catColor: "text-yellow-700" },
                                                { cat: "Baixo (Risco)", bg: "bg-red-50/30", catColor: "text-red-700" },
                                                { cat: "Crítico", bg: "bg-red-50/30", catColor: "text-red-700" },
                                            ].map(({ cat, bg, catColor }) => {
                                                const row = (currentData as Record<string, { percent?: string; description?: string }>)[cat];
                                                if (!row) return null;
                                                const desc = row.description || '';
                                                const hasSarcopeniaMod = desc.includes('Sarcopenia moderada');
                                                const hasSarcopeniaGrave = desc.includes('Sarcopenia grave');
                                                return (
                                                    <tr key={cat} className={cn("hover:bg-gray-50/50 transition-colors", bg)}>
                                                        <td className={cn("px-4 py-3 font-semibold", catColor)}>{cat}</td>
                                                        <td className={cn("px-4 py-3 text-center font-medium", catColor)}>{row.percent ?? '-'}</td>
                                                        <td className="px-4 py-3 text-gray-700">
                                                            {hasSarcopeniaMod || hasSarcopeniaGrave ? (
                                                                <span className="underline decoration-red-500 text-red-600 decoration-2">{desc}</span>
                                                            ) : (
                                                                desc
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {(!currentData || Object.keys(currentData).length === 0) && (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                                        Dados indisponíveis. Tente recarregar a página.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </>
                            ) : (
                                /* FLEXÕES (Age based) */
                                <table className="w-full text-sm min-w-max">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Idade</th>
                                            <th className="px-4 py-3 text-center font-semibold text-green-700">Excelente</th>
                                            <th className="px-4 py-3 text-center font-semibold text-blue-600">Bom</th>
                                            <th className="px-4 py-3 text-center font-semibold text-yellow-600">Médio</th>
                                            <th className="px-4 py-3 text-center font-semibold text-red-600">Fraco / Mau</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {currentData && Object.entries(currentData)
                                            .sort(([a], [b]) => {
                                                const getStartAge = (key: string) => {
                                                    if (key.includes('+')) return 60;
                                                    const match = key.match(/^(\d+)/);
                                                    return match ? parseInt(match[1]) : 0;
                                                };
                                                return getStartAge(a) - getStartAge(b);
                                            })
                                            .map(([ageRange, values]: [string, any]) => (
                                                <tr key={ageRange} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{ageRange}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-green-700">{values.excelente || '-'}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-blue-700">{values.bom || '-'}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-yellow-700">{values.medio || '-'}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-red-700">{values.mau || '-'}</td>
                                                </tr>
                                            ))}
                                        {(!currentData || Object.keys(currentData).length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                    Dados indisponíveis. Tente recarregar a página.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>


                </div>
            )}
        </div>
    );
}
