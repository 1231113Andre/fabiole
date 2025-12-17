"use client";

import { AvaliacaoFisica } from "../types";

interface AvaliacoesTabProps {
    avaliacoes: AvaliacaoFisica[];
}

export function AvaliacoesTab({ avaliacoes }: AvaliacoesTabProps) {
    return (
        <div className="space-y-6">
            {avaliacoes.length > 0 ? (
                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <h4 className="mb-6 text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <i className="fas fa-dumbbell text-primary text-sm"></i>
                        </div>
                        Avaliação Física
                    </h4>
                    <div className="max-w-full overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">Data</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white text-center">Flexões 1'</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white text-center">Abdominais 1'</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white text-center hidden md:table-cell">Milha</th>
                                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white text-center">Resultado Milha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {avaliacoes.map((avaliacao, index) => (
                                    <tr key={index} className="border-b border-stroke dark:border-strokedark">
                                        <td className="py-5 px-4 pl-9 xl:pl-11">
                                            <h5 className="font-medium text-black dark:text-white">{avaliacao.data}</h5>
                                        </td>
                                        <td className="py-5 px-4 text-center">
                                            <p className="text-black dark:text-white font-semibold">{avaliacao.flexoes1min || "-"}</p>
                                        </td>
                                        <td className="py-5 px-4 text-center">
                                            <p className="text-black dark:text-white font-semibold">{avaliacao.abdominais1min || "-"}</p>
                                        </td>
                                        <td className="py-5 px-4 text-center hidden md:table-cell">
                                            <p className="text-black dark:text-white font-mono">{avaliacao.milha || "-"}</p>
                                        </td>
                                        <td className="py-5 px-4 text-center">
                                            <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${avaliacao.resultadoMilha?.toLowerCase().includes('excelente') ? 'bg-success text-success' :
                                                avaliacao.resultadoMilha?.toLowerCase().includes('bom') ? 'bg-primary text-primary' :
                                                    avaliacao.resultadoMilha?.toLowerCase().includes('médio') || avaliacao.resultadoMilha?.toLowerCase().includes('medio') ? 'bg-warning text-warning' :
                                                        avaliacao.resultadoMilha?.toLowerCase().includes('mau') ? 'bg-danger text-danger' :
                                                            'bg-gray-200 text-gray-500'
                                                }`}>
                                                {avaliacao.resultadoMilha || "-"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-card rounded-lg border border-border p-12 text-center">
                    <i className="fas fa-dumbbell text-muted-foreground text-4xl mb-4"></i>
                    <p className="text-muted-foreground">Nenhuma avaliação registada</p>
                </div>
            )}
        </div>
    );
}
