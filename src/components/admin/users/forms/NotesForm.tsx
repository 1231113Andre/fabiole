import React from "react";

interface NotesData {
    goals: string;
    notes: string;
}

interface NotesFormProps {
    data: NotesData;
    onChange: (field: keyof NotesData, value: string) => void;
}

const INPUT_CLASSES = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 hover:border-gray-300";
const LABEL_CLASSES = "block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5";

export const NotesForm: React.FC<NotesFormProps> = React.memo(({ data, onChange }) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-gray-100">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-100 to-purple-50 flex items-center justify-center">
                    <i className="fa-duotone fa-clipboard-list text-violet-600 text-[10px]"></i>
                </div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Notas & Objetivos</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-bullseye-arrow text-violet-500/70 text-[10px]"></i>
                        Objetivos
                    </label>
                    <textarea
                        value={data.goals}
                        onChange={(e) => onChange('goals', e.target.value)}
                        rows={3}
                        placeholder="Descreva os objetivos de treino do cliente..."
                        className={`${INPUT_CLASSES} min-h-[100px] resize-none`}
                    />
                </div>
                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-note-sticky text-violet-500/70 text-[10px]"></i>
                        Notas Administrativas
                    </label>
                    <textarea
                        value={data.notes}
                        onChange={(e) => onChange('notes', e.target.value)}
                        rows={3}
                        placeholder="Adicione notas internas sobre o cliente..."
                        className={`${INPUT_CLASSES} min-h-[100px] resize-none`}
                    />
                </div>
            </div>
        </div>
    );
});

NotesForm.displayName = 'NotesForm';
