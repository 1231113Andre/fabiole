"use client";

import { ReferenceTables } from "../types";

interface ReferencesTabProps {
    referenceTables: ReferenceTables;
}

export function ReferencesTab({ referenceTables }: ReferencesTabProps) {
    return (
        <div className="space-y-6">
            <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                <h4 className="mb-6 text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <i className="fas fa-clipboard-list text-primary text-sm"></i>
                    </div>
                    Tabelas de Referência
                </h4>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {referenceTables?.massaGordaMasculino && (
                            <div className="bg-muted rounded-lg border border-border overflow-hidden">
                                <div className="px-5 py-4 bg-card border-b border-border">
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                                        <i className="fas fa-weight text-primary"></i>
                                        Massa Gorda | Masculino
                                    </h3>
                                </div>
                                <div className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                            <thead className="bg-card">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Idade</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Excelente</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Bom</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Médio</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Mau</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground">20-29</td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.massaGordaMasculino?.['20-29']?.excelente || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.massaGordaMasculino?.['20-29']?.bom || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.massaGordaMasculino?.['20-29']?.medio || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.massaGordaMasculino?.['20-29']?.mau || '--'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground">30-39</td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.massaGordaMasculino?.['30-39']?.excelente || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.massaGordaMasculino?.['30-39']?.bom || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.massaGordaMasculino?.['30-39']?.medio || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.massaGordaMasculino?.['30-39']?.mau || '--'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        {referenceTables?.massaGordaFeminino && (
                            <div className="bg-muted rounded-lg border border-border overflow-hidden">
                                <div className="px-5 py-4 bg-card border-b border-border">
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                                        <i className="fas fa-weight text-primary"></i>
                                        Massa Gorda | Feminino
                                    </h3>
                                </div>
                                <div className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                            <thead className="bg-card">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Idade</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Excelente</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Bom</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Médio</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Mau</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground">20-29</td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.massaGordaFeminino?.['20-29']?.excelente || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.massaGordaFeminino?.['20-29']?.bom || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.massaGordaFeminino?.['20-29']?.medio || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.massaGordaFeminino?.['20-29']?.mau || '--'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground">30-39</td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.massaGordaFeminino?.['30-39']?.excelente || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.massaGordaFeminino?.['30-39']?.bom || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.massaGordaFeminino?.['30-39']?.medio || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.massaGordaFeminino?.['30-39']?.mau || '--'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        {referenceTables?.imc && (
                            <div className="bg-muted rounded-lg border border-border overflow-hidden">
                                <div className="px-5 py-4 bg-card border-b border-border">
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                                        <i className="fas fa-ruler-vertical text-primary"></i>
                                        IMC
                                    </h3>
                                </div>
                                <div className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                            <thead className="bg-card">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Classificação</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">IMC</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground flex items-center gap-2">
                                                        <i className="fas fa-arrow-down text-color-error"></i>
                                                        <span>Magreza</span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.imc?.magreza || '--'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground flex items-center gap-2">
                                                        <i className="fas fa-check text-color-success"></i>
                                                        <span>Normal</span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.imc?.normal || '--'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground flex items-center gap-2">
                                                        <i className="fas fa-arrow-up text-color-warning"></i>
                                                        <span>Sobrepeso</span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.imc?.sobrepeso || '--'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground flex items-center gap-2">
                                                        <i className="fas fa-exclamation-triangle text-color-error"></i>
                                                        <span>Obesidade</span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.imc?.obesidade || '--'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        {referenceTables?.flexoesFeminino && (
                            <div className="bg-muted rounded-lg border border-border overflow-hidden">
                                <div className="px-5 py-4 bg-card border-b border-border">
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                                        <i className="fas fa-dumbbell text-primary"></i>
                                        Flexões 1&apos; | Feminino
                                    </h3>
                                </div>
                                <div className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                            <thead className="bg-card">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Idade</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Excelente</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Bom</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Médio</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Mau</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground">20-29</td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.flexoesFeminino?.['20-29']?.excelente || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.flexoesFeminino?.['20-29']?.bom || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.flexoesFeminino?.['20-29']?.medio || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.flexoesFeminino?.['20-29']?.mau || '--'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground">30-39</td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.flexoesFeminino?.['30-39']?.excelente || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.flexoesFeminino?.['30-39']?.bom || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.flexoesFeminino?.['30-39']?.medio || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.flexoesFeminino?.['30-39']?.mau || '--'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        {referenceTables?.flexoesMasculino && (
                            <div className="bg-muted rounded-lg border border-border overflow-hidden">
                                <div className="px-5 py-4 bg-card border-b border-border">
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                                        <i className="fas fa-dumbbell text-primary"></i>
                                        Flexões 1&apos; | Masculino
                                    </h3>
                                </div>
                                <div className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                            <thead className="bg-card">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Idade</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Excelente</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Bom</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Médio</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Mau</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground">20-29</td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.flexoesMasculino?.['20-29']?.excelente || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.flexoesMasculino?.['20-29']?.bom || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.flexoesMasculino?.['20-29']?.medio || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.flexoesMasculino?.['20-29']?.mau || '--'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground">30-39</td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.flexoesMasculino?.['30-39']?.excelente || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.flexoesMasculino?.['30-39']?.bom || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.flexoesMasculino?.['30-39']?.medio || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.flexoesMasculino?.['30-39']?.mau || '--'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        {referenceTables?.abdominaisFeminino && (
                            <div className="bg-muted rounded-lg border border-border overflow-hidden">
                                <div className="px-5 py-4 bg-card border-b border-border">
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                                        <i className="fas fa-fire text-primary"></i>
                                        Abdominais 1&apos; | Feminino
                                    </h3>
                                </div>
                                <div className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                            <thead className="bg-card">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Idade</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Excelente</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Bom</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Médio</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Mau</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground">20-29</td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.abdominaisFeminino?.['20-29']?.excelente || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.abdominaisFeminino?.['20-29']?.bom || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.abdominaisFeminino?.['20-29']?.medio || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.abdominaisFeminino?.['20-29']?.mau || '--'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground">30-39</td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.abdominaisFeminino?.['30-39']?.excelente || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.abdominaisFeminino?.['30-39']?.bom || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.abdominaisFeminino?.['30-39']?.medio || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.abdominaisFeminino?.['30-39']?.mau || '--'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        {referenceTables?.abdominaisMasculino && (
                            <div className="bg-muted rounded-lg border border-border overflow-hidden">
                                <div className="px-5 py-4 bg-card border-b border-border">
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                                        <i className="fas fa-fire text-primary"></i>
                                        Abdominais 1&apos; | Masculino
                                    </h3>
                                </div>
                                <div className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                            <thead className="bg-card">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Idade</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Excelente</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Bom</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Médio</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Mau</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground">20-29</td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.abdominaisMasculino?.['20-29']?.excelente || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.abdominaisMasculino?.['20-29']?.bom || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.abdominaisMasculino?.['20-29']?.medio || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.abdominaisMasculino?.['20-29']?.mau || '--'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground">30-39</td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.abdominaisMasculino?.['30-39']?.excelente || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.abdominaisMasculino?.['30-39']?.bom || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.abdominaisMasculino?.['30-39']?.medio || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.abdominaisMasculino?.['30-39']?.mau || '--'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        {referenceTables?.milhaFeminino && (
                            <div className="bg-muted rounded-lg border border-border overflow-hidden">
                                <div className="px-5 py-4 bg-card border-b border-border">
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                                        <i className="fas fa-running text-primary"></i>
                                        Teste da Milha | Feminino
                                    </h3>
                                </div>
                                <div className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                            <thead className="bg-card">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Idade</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Excelente</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Bom</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Médio</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Mau</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground">20-29</td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.milhaFeminino?.['20-29']?.excelente || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.milhaFeminino?.['20-29']?.bom || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.milhaFeminino?.['20-29']?.medio || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.milhaFeminino?.['20-29']?.mau || '--'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground">30-39</td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.milhaFeminino?.['30-39']?.excelente || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.milhaFeminino?.['30-39']?.bom || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.milhaFeminino?.['30-39']?.medio || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.milhaFeminino?.['30-39']?.mau || '--'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        {referenceTables?.milhaMasculino && (
                            <div className="bg-muted rounded-lg border border-border overflow-hidden">
                                <div className="px-5 py-4 bg-card border-b border-border">
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 m-0">
                                        <i className="fas fa-running text-primary"></i>
                                        Teste da Milha | Masculino
                                    </h3>
                                </div>
                                <div className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                            <thead className="bg-card">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Idade</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Excelente</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Bom</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Médio</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Mau</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground">20-29</td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.milhaMasculino?.['20-29']?.excelente || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.milhaMasculino?.['20-29']?.bom || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.milhaMasculino?.['20-29']?.medio || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.milhaMasculino?.['20-29']?.mau || '--'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-3 py-2 text-foreground">30-39</td>
                                                    <td className="px-3 py-2 text-center text-color-success font-semibold">{referenceTables?.milhaMasculino?.['30-39']?.excelente || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-blue-600 font-semibold">{referenceTables?.milhaMasculino?.['30-39']?.bom || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-warning font-semibold">{referenceTables?.milhaMasculino?.['30-39']?.medio || '--'}</td>
                                                    <td className="px-3 py-2 text-center text-color-error font-semibold">{referenceTables?.milhaMasculino?.['30-39']?.mau || '--'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
