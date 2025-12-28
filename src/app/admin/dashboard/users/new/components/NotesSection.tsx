import { CreateUserFormData, INPUT_CLASSES, LABEL_CLASSES } from "./types";

interface NotesSectionProps {
    formData: CreateUserFormData;
    handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function NotesSection({ formData, handleChange }: NotesSectionProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-gray-100">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-100 to-purple-50 flex items-center justify-center">
                    <i className="fa-duotone fa-clipboard-list text-violet-600 text-[10px]"></i>
                </div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Notas & Objetivos</h4>
            </div>

            <div className="space-y-4">
                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-bullseye-arrow text-violet-500/70 text-[10px]"></i>
                        Objetivos
                    </label>
                    <textarea
                        name="goals"
                        value={formData.goals}
                        onChange={handleChange}
                        placeholder="Descreva os objetivos de treino do cliente..."
                        className={`${INPUT_CLASSES} min-h-[100px] resize-none`}
                        rows={3}
                    />
                </div>
                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-note-sticky text-violet-500/70 text-[10px]"></i>
                        Notas Administrativas
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Adicione notas internas sobre o cliente..."
                        className={`${INPUT_CLASSES} min-h-[100px] resize-none`}
                        rows={3}
                    />
                </div>
            </div>
        </div>
    );
}
