import React from "react";
import { UserData } from "../../types";

interface PersonalInfoSectionProps {
    user: UserData;
    onChange: (field: keyof UserData, value: any) => void;
}

const inputClasses = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 hover:border-gray-300";
const labelClasses = "block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5";

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = React.memo(({ user, onChange }) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-gray-100">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-orange-100 flex items-center justify-center">
                    <i className="fa-duotone fa-user text-primary text-[10px]"></i>
                </div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Dados Pessoais</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label className={labelClasses}>
                        <i className="fa-duotone fa-signature text-primary/60 text-[10px]"></i>
                        Nome
                    </label>
                    <input
                        type="text"
                        value={user.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        className={inputClasses}
                        placeholder="Primeiro nome"
                    />
                </div>
                <div>
                    <label className={labelClasses}>
                        <i className="fa-duotone fa-user-tag text-primary/60 text-[10px]"></i>
                        Apelido
                    </label>
                    <input
                        type="text"
                        value={user.surname}
                        onChange={(e) => onChange('surname', e.target.value)}
                        className={inputClasses}
                        placeholder="Sobrenome"
                    />
                </div>
                <div>
                    <label className={labelClasses}>
                        <i className="fa-duotone fa-envelope text-primary/60 text-[10px]"></i>
                        Email
                    </label>
                    <input
                        type="email"
                        value={user.email}
                        onChange={(e) => onChange('email', e.target.value)}
                        className={inputClasses}
                        placeholder="email@exemplo.com"
                    />
                </div>
                <div>
                    <label className={labelClasses}>
                        <i className="fa-duotone fa-phone text-primary/60 text-[10px]"></i>
                        Telefone
                    </label>
                    <input
                        type="text"
                        value={user.phone}
                        onChange={(e) => onChange('phone', e.target.value)}
                        className={inputClasses}
                        placeholder="+351 000 000 000"
                    />
                </div>
                <div>
                    <label className={labelClasses}>
                        <i className="fa-duotone fa-cake-candles text-primary/60 text-[10px]"></i>
                        Data Nascimento
                    </label>
                    <input
                        type="date"
                        value={user.birth ? new Date(user.birth).toISOString().split('T')[0] : ''}
                        onChange={(e) => onChange('birth', e.target.value)}
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label className={labelClasses}>
                        <i className="fa-duotone fa-venus-mars text-primary/60 text-[10px]"></i>
                        Género
                    </label>
                    <div className="relative">
                        <select
                            value={user.gender || 'Masculino'}
                            onChange={(e) => onChange('gender', e.target.value)}
                            className={`${inputClasses} appearance-none pr-10 cursor-pointer`}
                        >
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Outro">Outro</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <i className="fa-duotone fa-caret-down"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

PersonalInfoSection.displayName = 'PersonalInfoSection';

