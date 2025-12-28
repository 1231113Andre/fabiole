import NewButton from "@/app/components/newButton";

interface FormActionsProps {
    loading: boolean;
    role: string;
}

// Inline spinner component matching PesagemModal used in original code
const InlineSpinner = () => (
    <div className="w-4 h-4 relative">
        <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
    </div>
);

export function FormActions({ loading, role }: FormActionsProps) {
    return (
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className={`flex flex-col gap-1 text-xs ${role === 'ADMINISTRATOR' ? 'text-red-600' : 'text-gray-600'}`}>
                <div className="flex items-center gap-2 font-bold uppercase tracking-wide">
                    <i className={`fa-duotone ${role === 'ADMINISTRATOR' ? 'fa-shield-halved' : 'fa-user'} text-lg`}></i>
                    {role === 'ADMINISTRATOR'
                        ? "A CRIAR ADMINISTRATOR"
                        : "A CRIAR CLIENTE (USER)"}
                </div>
                <p className="opacity-80 pl-7 max-w-md">
                    {role === 'ADMINISTRATOR'
                        ? "Acesso total ao sistema. Pode gerir utilizadores, criar planos de treino, editar exercícios e configurar a aplicação."
                        : "Acesso padrão à aplicação. Pode visualizar planos de treino, registar progresso e gerir o seu perfil."}
                </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
                <NewButton
                    href="/admin/dashboard/users"
                    variant="new_primary_no_bg_rounded"
                    className="px-6 h-11 flex-1 sm:flex-none"
                >
                    CANCELAR <i className="fa-duotone fa-xmark ml-2"></i>
                </NewButton>
                <NewButton
                    type="submit"
                    variant="new_primary_rounded"
                    disabled={loading}
                    className="px-8 h-11 shadow-lg hover:shadow-primary/20 flex-1 sm:flex-none"
                    icon={loading ? <InlineSpinner /> : <i className="fa-duotone fa-user-plus"></i>}
                >
                    {loading ? "A CRIAR..." : "CRIAR"}
                </NewButton>
            </div>
        </div>
    );
}
