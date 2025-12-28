import React from "react";
import { Perimetro } from "../../types";

interface PerimetrosTableProps {
    perimetros: Perimetro[];
    onEdit: (p: Perimetro) => void;
    onDelete: (id: number) => void;
}

export const PerimetrosTable: React.FC<PerimetrosTableProps> = ({
    perimetros,
    onEdit,
    onDelete
}) => {
    if (perimetros.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500">
                <i className="fa-duotone fa-ruler-combined text-4xl mb-3 text-gray-300"></i>
                <p>Nenhum perímetro registado</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-visible pb-16">
            <table className="w-full text-xs border-collapse table-auto">
                <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="py-3 px-2 text-left font-semibold text-gray-700 whitespace-nowrap">Data</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">MS Dir.</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">MS Esq.</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Peito</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Cintura</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Abdómen</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Anca</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Coxa Dir.</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Coxa Esq.</th>
                        <th className="py-3 px-2 text-right font-semibold text-gray-700 whitespace-nowrap">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {perimetros.map((p) => (
                        <tr key={p.id} className="border-b border-gray-300 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-2 whitespace-nowrap font-bold">{new Date(p.date).toLocaleDateString('pt-PT')}</td>
                            <td className="py-3 px-2 text-center text-gray-600">{p.msRight || '-'}</td>
                            <td className="py-3 px-2 text-center text-gray-600">{p.msLeft || '-'}</td>
                            <td className="py-3 px-2 text-center text-gray-600">{p.chest || '-'}</td>
                            <td className="py-3 px-2 text-center font-bold text-gray-800">{p.waist || '-'}</td>
                            <td className="py-3 px-2 text-center font-bold text-gray-800">{p.abdomen || '-'}</td>
                            <td className="py-3 px-2 text-center text-gray-600">{p.hips || '-'}</td>
                            <td className="py-3 px-2 text-center text-gray-600">{p.thighR || '-'}</td>
                            <td className="py-3 px-2 text-center text-gray-600">{p.thighL || '-'}</td>
                            <td className="py-3 px-2 text-right">
                                <div className="flex justify-end gap-1">
                                    <button
                                        onClick={() => onEdit(p)}
                                        className="p-1.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                                        title="Editar"
                                    >
                                        <i className="fa-duotone fa-pen-to-square"></i>
                                    </button>
                                    <button
                                        onClick={() => onDelete(p.id)}
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
