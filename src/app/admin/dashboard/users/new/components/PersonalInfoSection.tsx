import { CreateUserFormData, INPUT_CLASSES, LABEL_CLASSES } from "./types";
import { RoleSelector } from "./RoleSelector";

interface PersonalInfoSectionProps {
    formData: CreateUserFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    availableRoles: string[];
    showPassword: boolean;
    togglePassword: () => void;
    generatePassword: () => void;
}

export function PersonalInfoSection({
    formData,
    handleChange,
    availableRoles,
    showPassword,
    togglePassword,
    generatePassword
}: PersonalInfoSectionProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-gray-100">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-orange-100 flex items-center justify-center">
                    <i className="fa-duotone fa-user text-primary text-[10px]"></i>
                </div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Dados Pessoais & Acesso</h4>
            </div>

            {/* Role Selection */}
            <RoleSelector
                currentRole={formData.role}
                availableRoles={availableRoles}
                onChange={handleChange as any}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-signature text-primary/60 text-[10px]"></i>
                        Nome <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase tracking-wider">Obrigatório</span>
                    </label>
                    <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Primeiro nome"
                        className={INPUT_CLASSES}
                    />
                </div>

                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-user-tag text-primary/60 text-[10px]"></i>
                        Apelido <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase tracking-wider">Obrigatório</span>
                    </label>
                    <input
                        required
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        placeholder="Sobrenome"
                        className={INPUT_CLASSES}
                    />
                </div>

                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-envelope text-primary/60 text-[10px]"></i>
                        Email <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase tracking-wider">Obrigatório</span>
                    </label>
                    <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@exemplo.com"
                        className={INPUT_CLASSES}
                    />
                </div>

                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-phone text-primary/60 text-[10px]"></i>
                        Telefone
                    </label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        placeholder="+351 000 000 000"
                        className={INPUT_CLASSES}
                    />
                </div>

                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-calendar text-primary/60 text-[10px]"></i>
                        Data de Nascimento <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase tracking-wider">Obrigatório</span>
                    </label>
                    <input
                        required
                        type="date"
                        name="birth"
                        value={formData.birth}
                        onChange={handleChange}
                        className={INPUT_CLASSES}
                    />
                </div>

                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-venus-mars text-primary/60 text-[10px]"></i>
                        Género <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase tracking-wider">Obrigatório</span>
                    </label>
                    <div className="relative">
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className={`${INPUT_CLASSES} mt-1 appearance-none pr-10 cursor-pointer`}
                        >
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Outro">Outro</option>
                        </select>
                        <div className="absolute right-4 top-[calc(50%+2px)] -translate-y-1/2 pointer-events-none text-gray-500">
                            <i className="fa-duotone fa-caret-down"></i>
                        </div>
                    </div>
                </div>

                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-key text-primary/60 text-[10px]"></i>
                        Palavra-passe <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase tracking-wider">Obrigatório</span>
                    </label>
                    <div className="relative">
                        <input
                            required
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Mínimo 8 caracteres"
                            className={`${INPUT_CLASSES} pr-24`}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                                type="button"
                                onClick={togglePassword}
                                className="p-1.5 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-gray-50 cursor-pointer"
                                title={showPassword ? "Ocultar" : "Mostrar"}
                            >
                                <i className={`fa-duotone ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                            <button
                                type="button"
                                onClick={generatePassword}
                                className="p-1.5 text-primary hover:text-primary/80 transition-colors rounded-lg hover:bg-primary/5 bg-primary/10 cursor-pointer"
                                title="Gerar senha segura"
                            >
                                <i className="fa-duotone fa-wand-magic-sparkles"></i>
                            </button>
                        </div>
                    </div>

                    {/* Notification Checkbox */}
                    <div className="mt-3 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-start gap-2.5">
                            <div className="flex items-center h-5 mt-0.5">
                                <input
                                    type="checkbox"
                                    name="sendNotification"
                                    checked={formData.sendNotification}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20 cursor-pointer"
                                />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-700 block mb-1">
                                    Enviar credenciais por email
                                </span>
                                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                                    Ao ser criado, o utilizador receberá automaticamente um email para <span className="text-gray-900 font-bold">{formData.email || 'o endereço definido'}</span> contendo os seus dados de acesso (Email e Password) e o link para entrar na plataforma.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
