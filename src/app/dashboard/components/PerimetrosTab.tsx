"use client";

import { PerimetroCorporal } from "../types";

interface PerimetrosTabProps {
    perimetros: PerimetroCorporal[];
}

export function PerimetrosTab({ perimetros }: PerimetrosTabProps) {
    return (
        <div className="space-y-6">
            {perimetros.length > 0 ? (
                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <h4 className="mb-6 text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <i className="fas fa-ruler-combined text-primary text-sm"></i>
                        </div>
                        Perímetros Corporais
                    </h4>
                    <div className="max-w-full overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">Data</th>
                                    <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-center hidden md:table-cell">MS Drt</th>
                                    <th className="min-w-[110px] py-4 px-4 font-medium text-black dark:text-white text-center hidden lg:table-cell">MS Drt Con</th>
                                    <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-center hidden md:table-cell">MS Esq</th>
                                    <th className="min-w-[110px] py-4 px-4 font-medium text-black dark:text-white text-center hidden lg:table-cell">MS Esq Con</th>
                                    <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-center">Peito</th>
                                    <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-center">Cintura</th>
                                    <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-center hidden md:table-cell">Abdominal</th>
                                    <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-center hidden lg:table-cell">Anca</th>
                                    <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-center hidden lg:table-cell">MI Drt</th>
                                    <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-center hidden lg:table-cell">MI Esq</th>
                                </tr>
                            </thead>
                            <tbody>
                                {perimetros.map((perimetro, index) => (
                                    <tr key={index} className="border-b border-stroke dark:border-strokedark">
                                        <td className="py-5 px-4 pl-9 xl:pl-11">
                                            <h5 className="font-medium text-black dark:text-white">{perimetro.data}</h5>
                                        </td>
                                        <td className="py-5 px-4 text-center hidden md:table-cell">
                                            <p className="text-black dark:text-white">{perimetro.msDrt || "-"}</p>
                                        </td>
                                        <td className="py-5 px-4 text-center hidden lg:table-cell">
                                            <p className="text-black dark:text-white">{perimetro.msDrtCon || "-"}</p>
                                        </td>
                                        <td className="py-5 px-4 text-center hidden md:table-cell">
                                            <p className="text-black dark:text-white">{perimetro.msEsq || "-"}</p>
                                        </td>
                                        <td className="py-5 px-4 text-center hidden lg:table-cell">
                                            <p className="text-black dark:text-white">{perimetro.msEsqCon || "-"}</p>
                                        </td>
                                        <td className="py-5 px-4 text-center">
                                            <p className="text-black dark:text-white font-semibold">{perimetro.peito || "-"}</p>
                                        </td>
                                        <td className="py-5 px-4 text-center">
                                            <p className="text-black dark:text-white font-semibold">{perimetro.cintura || "-"}</p>
                                        </td>
                                        <td className="py-5 px-4 text-center hidden md:table-cell">
                                            <p className="text-black dark:text-white">{perimetro.abdominal || "-"}</p>
                                        </td>
                                        <td className="py-5 px-4 text-center hidden lg:table-cell">
                                            <p className="text-black dark:text-white">{perimetro.anca || "-"}</p>
                                        </td>
                                        <td className="py-5 px-4 text-center hidden lg:table-cell">
                                            <p className="text-black dark:text-white">{perimetro.miDrt || "-"}</p>
                                        </td>
                                        <td className="py-5 px-4 text-center hidden lg:table-cell">
                                            <p className="text-black dark:text-white">{perimetro.miEsq || "-"}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-card rounded-lg border border-border p-12 text-center">
                    <i className="fas fa-ruler-combined text-muted-foreground text-4xl mb-4"></i>
                    <p className="text-muted-foreground">Nenhum perímetro registado</p>
                </div>
            )}
        </div>
    );
}
