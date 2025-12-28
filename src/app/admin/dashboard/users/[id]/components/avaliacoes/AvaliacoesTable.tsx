import React from "react";
import { Avaliacao } from "../../types";

interface AvaliacoesTableProps {
    avaliacoes: Avaliacao[];
    onEdit: (a: Avaliacao) => void;
    onDelete: (id: number) => void;
}

export const AvaliacoesTable: React.FC<AvaliacoesTableProps> = ({
    avaliacoes,
    onEdit,
    onDelete
}) => {
    if (avaliacoes.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500">
                <i className="fa-duotone fa-dumbbell text-4xl mb-3 text-gray-300"></i>
                <p>Nenhuma avaliação registada</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-visible pb-16">
            <table className="w-full text-xs border-collapse table-auto">
                <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="py-3 px-2 text-left font-semibold text-gray-700 whitespace-nowrap">Data</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Flexões</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Abdominais</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Milha</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Resultado</th>
                        <th className="py-3 px-2 text-left font-semibold text-gray-700 whitespace-nowrap">Notas</th>
                        <th className="py-3 px-2 text-right font-semibold text-gray-700 whitespace-nowrap">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {avaliacoes.map((a) => (
                        <tr key={a.id} className="border-b border-gray-300 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-2 whitespace-nowrap font-bold">{new Date(a.date).toLocaleDateString('pt-PT')}</td>
                            <td className="py-3 px-2 text-center font-bold text-gray-800">{a.pushUps || '-'}</td>
                            <td className="py-3 px-2 text-center font-bold text-gray-800">{a.sitUps || '-'}</td>
                            <td className="py-3 px-2 text-center text-gray-600">{a.mile || '-'}</td>
                            <td className="py-3 px-2 text-center font-bold text-primary">{a.mileResult || '-'}</td>
                            <td className="py-3 px-2 text-gray-600">{a.notes || '-'}</td>
                            <td className="py-3 px-2 text-right">
                                <div className="flex justify-end gap-1">
                                    <button
                                        onClick={() => onEdit(a)}
                                        className="p-1.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                                        title="Editar"
                                    >
                                        <i className="fa-duotone fa-pen-to-square"></i>
                                    </button>
                                    <button
                                        onClick={() => onDelete(a.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                        title="Eliminar"
                                    >
                                        <i className="fa-duotone fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
