"use client";

import { useState } from "react";
import { ReferenceTables } from "../types";
import NewButton from "@/app/components/newButton";
import { cn } from "@/lib/utils";

interface ReferencesTabProps {
    referenceTables: ReferenceTables;
}

type Gender = "MALE" | "FEMALE";
type Category = "massaGorda" | "flexoes" | "abdominais" | "milha";

export function ReferencesTab({ referenceTables }: ReferencesTabProps) {
    const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category>("massaGorda");

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
            default:
                return null;
        }
    };

    const currentData = getData();

    return (
        <div className="space-y-8">
            {/* Header & Main Navigation */}
            <div className="flex flex-col items-center gap-6">
                <div className="flex items-center justify-center gap-4 w-full max-w-lg">
                    <NewButton
                        variant={selectedGender === "MALE" ? "primary" : "outline"}
                        onClick={() => setSelectedGender("MALE")}
                        className="w-full"
                        icon={<i className="fa-duotone fa-person text-lg"></i>}
                    >
                        MALE
                    </NewButton>
                    <NewButton
                        variant={selectedGender === "FEMALE" ? "primary" : "outline"}
                        onClick={() => setSelectedGender("FEMALE")}
                        className="w-full"
                        icon={<i className="fa-duotone fa-person-dress text-lg"></i>}
                    >
                        FEMALE
                    </NewButton>
                </div>
            </div>

            {/* Default View: IMC Table */}
            {!selectedGender && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden max-w-4xl mx-auto animate-in fade-in duration-500">
                    <div className="border-b border-gray-100 px-6 py-5 bg-gray-50/50">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <i className="fa-duotone fa-scale-balanced"></i>
                            </div>
                            ⚖️ ÍNDICE DE MASSA CORPORAL (IMC)
                        </h4>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-left text-sm">
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
                                    <td className="px-6 py-4 text-orange-600">Obesidade I</td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-900">30,0 - 34,9</td>
                                </tr>
                                <tr className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 text-orange-700">Obesidade II</td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-900">35,0 - 39,9</td>
                                </tr>
                                <tr className="hover:bg-gray-50/50 bg-red-50/30">
                                    <td className="px-6 py-4 text-red-700 font-medium">Obesidade III ❌</td>
                                    <td className="px-6 py-4 text-right font-bold text-red-700">40,0+</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Gender Selected View */}
            {selectedGender && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

                    {/* Back Button */}
                    <div className="flex justify-start">
                        <NewButton
                            variant="ghost"
                            onClick={() => {
                                setSelectedGender(null);
                                setSelectedCategory("massaGorda");
                            }}
                            className="text-gray-500 hover:text-gray-900"
                            icon={<i className="fa-duotone fa-arrow-left"></i>}
                        >
                            Voltar
                        </NewButton>
                    </div>

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
                    </div>

                    {/* Data Table */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden max-w-5xl mx-auto">
                        <div className="border-b border-gray-100 px-6 py-5 bg-gray-50/50 flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-gray-900">
                                {selectedCategory === "massaGorda" && "Massa Gorda"}
                                {selectedCategory === "flexoes" && "Flexões (1 min)"}
                                {selectedCategory === "abdominais" && "Abdominais (1 min)"}
                                {selectedCategory === "milha" && "Teste da Milha (1609m)"}
                                <span className="text-gray-400 font-normal ml-2">| {selectedGender === "MALE" ? "Masculino" : "Feminino"}</span>
                            </h4>
                        </div>
                        <div className="overflow-x-auto">
                            {selectedCategory === "massaGorda" ? (
                                /* MSA GORDA TABLE (Category based) */
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-left font-semibold text-gray-700">Categoria</th>
                                            <th className="px-6 py-4 text-center font-semibold text-gray-700">Percentagem</th>
                                            <th className="px-6 py-4 text-left font-semibold text-gray-700">Descrição</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {currentData && Object.entries(currentData).map(([category, values]: [string, any]) => (
                                            <tr key={category} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">{category}</td>
                                                <td className="px-6 py-4 text-center font-bold text-blue-600">{values.percent || '-'}</td>
                                                <td className="px-6 py-4 text-gray-600 italic">{values.description || '-'}</td>
                                            </tr>
                                        ))}
                                        {(!currentData || Object.keys(currentData).length === 0) && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                                    Dados indisponíveis. Tente recarregar a página.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                /* PERFORMANCE TABLES (Age based) */
                                <table className="w-full text-sm">
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
                                        {currentData && Object.entries(currentData).map(([ageRange, values]: [string, any]) => (
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

                    {/* DEBUG SECTION */}
                    <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs font-mono overflow-auto max-h-60 border border-gray-300">
                        <p className="font-bold mb-2">Debug Info:</p>
                        <p>Selected Gender: {selectedGender || 'null'}</p>
                        <p>Selected Category: {selectedCategory}</p>
                        <p>Data Keys Available: {referenceTables ? Object.keys(referenceTables).join(', ') : 'None'}</p>
                        <p>Current Data Entry Count: {currentData ? Object.keys(currentData).length : '0'}</p>
                        <details>
                            <summary className="cursor-pointer font-bold text-blue-600">View Raw Current Data</summary>
                            <pre className="mt-2 text-[10px]">{JSON.stringify(currentData, null, 2)}</pre>
                        </details>
                        <details>
                            <summary className="cursor-pointer font-bold text-blue-600 mt-2">View All Tables Keys</summary>
                            <pre className="mt-2 text-[10px]">{JSON.stringify(referenceTables ? Object.keys(referenceTables) : {}, null, 2)}</pre>
                        </details>
                    </div>
                </div>
            )}
        </div>
    );
}
