import { LABEL_CLASSES } from "./types";

interface RoleSelectorProps {
    currentRole: string;
    availableRoles: string[];
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function RoleSelector({ currentRole, availableRoles, onChange }: RoleSelectorProps) {
    return (
        <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200">
            <label className={LABEL_CLASSES}>
                <i className="fa-duotone fa-shield-check text-primary/60 text-[10px]"></i>
                Tipo de Conta
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {availableRoles.length === 0 ? (
                    <span className="text-xs text-gray-400">A carregar tipos de conta...</span>
                ) : (
                    availableRoles.map(role => {
                        const isUser = role === 'USER';
                        const isAdmin = role === 'ADMINISTRATOR';

                        const isSelected = currentRole === role;
                        const borderColor = isSelected
                            ? (isAdmin ? 'border-red-500' : isUser ? 'border-primary' : 'border-gray-400')
                            : 'border-gray-200';
                        const bgColor = isSelected
                            ? (isAdmin ? 'bg-red-50/10' : isUser ? 'bg-primary/5' : 'bg-gray-50')
                            : 'bg-white';

                        const iconColor = isSelected
                            ? (isAdmin ? 'bg-red-500 text-white' : isUser ? 'bg-primary text-white' : 'bg-gray-400 text-white')
                            : 'bg-gray-100 text-gray-400';

                        const textColor = isSelected
                            ? (isAdmin ? 'text-red-900' : isUser ? 'text-primary' : 'text-gray-900')
                            : 'text-gray-700';

                        const descriptionColor = isSelected
                            ? (isAdmin ? 'text-red-700/80' : isUser ? 'text-gray-600' : 'text-gray-500')
                            : 'text-gray-500';

                        return (
                            <label key={role} className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${borderColor} ${bgColor} hover:border-gray-300 hover:shadow-md`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value={role}
                                    checked={isSelected}
                                    onChange={onChange}
                                    className="hidden"
                                />
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${iconColor} transition-colors duration-300`}>
                                    <i className={`fa-duotone ${isAdmin ? 'fa-user-shield text-xl' : isUser ? 'fa-mobile-screen-button text-xl' : 'fa-id-badge text-xl'}`}></i>
                                </div>
                                <div className="flex-1">
                                    <span className={`block text-base font-bold mb-1 ${textColor}`}>
                                        {isAdmin ? 'ADMINISTRATOR' : isUser ? 'CLIENTE (USER)' : role}
                                    </span>
                                    <p className={`text-xs leading-relaxed font-medium ${descriptionColor}`}>
                                        {isAdmin
                                            ? 'Gestão total da plataforma. Permite gerir utilizadores, processar pagamentos, editar configurações e visualizar relatórios financeiros completos.'
                                            : isUser
                                                ? 'Conta pessoal para atletas. Acesso à aplicação móvel para consulta de planos de treino, registo de métricas e acompanhamento da evolução.'
                                                : role}
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className={`absolute top-3 right-3 ${isAdmin ? 'text-red-500' : isUser ? 'text-primary' : 'text-gray-400'}`}>
                                        <i className="fa-solid fa-circle-check text-lg"></i>
                                    </div>
                                )}
                            </label>
                        );
                    })
                )}
            </div>

            {/* Admin Warning */}
            {currentRole === 'ADMINISTRATOR' && (
                <div className="mt-4 flex items-start gap-3 p-3 bg-red-50 text-red-800 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <i className="fa-duotone fa-triangle-exclamation text-xl shrink-0 mt-0.5"></i>
                    <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider mb-1">Importante / Atenção</h5>
                        <p className="text-xs leading-relaxed opacity-90">
                            Está a criar uma conta com privilégios de <strong>Administrador</strong>.
                            Este utilizador terá acesso total para gerir outros utilizadores, editar dados financeiros e alterar configurações do sistema.
                            <br className="mb-2" />
                            Será enviado um alerta especial no email de boas-vindas.
                        </p>
                    </div>
                </div>
            )}

            {/* Redirection Info */}
            <div className="mt-4 flex items-start gap-3 p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                <i className="fa-duotone fa-arrow-right-to-bracket text-xl shrink-0 mt-0.5"></i>
                <div className="flex-1">
                    <h5 className="text-xs font-bold uppercase tracking-wider mb-1">Redirecionamento Automático</h5>
                    <p className="text-xs leading-relaxed opacity-90">
                        Após a criação da conta, será automaticamente redirecionado para a página de perfil do utilizador para completar o preenchimento de dados, editar informações ou ajustar configurações adicionais.
                        <br className="mb-2" />
                        O utilizador será criado com um <strong>avatar padrão</strong> definido pelo sistema.
                    </p>
                </div>
            </div>
        </div>
    );
}
