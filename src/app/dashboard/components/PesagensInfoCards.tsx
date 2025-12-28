/**
 * Compact info cards displayed on the Pesagens tab
 */

export function PesagensInfoCards() {
    return (
        <div className="flex flex-wrap gap-3">
            {/* IMC */}
            <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200 rounded-xl px-4 py-3 max-w-xs">
                <div className="flex items-start gap-3">
                    <span className="text-xl">🤖</span>
                    <div>
                        <h4 className="font-bold text-violet-700 text-sm mb-1">IMC (AUTO)</h4>
                        <p className="text-xs text-violet-600 leading-relaxed">
                            <strong>Fórmula:</strong> Peso (kg) ÷ Altura² (m)
                            <br />
                            <span className="text-violet-500">Ex: 80kg ÷ (1.75m)² = 26.1</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Delta Peso */}
            <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200 rounded-xl px-4 py-3 max-w-xs">
                <div className="flex items-start gap-3">
                    <span className="text-xl">✨</span>
                    <div>
                        <h4 className="font-bold text-violet-700 text-sm mb-1">Δ Peso (AUTO)</h4>
                        <p className="text-xs text-violet-600 leading-relaxed">
                            <strong>Fórmula:</strong> Peso atual − Peso anterior
                            <br />
                            <span className="text-violet-500">Ex: 80kg − 82kg = -2kg</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* %MG Result */}
            <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200 rounded-xl px-4 py-3 max-w-xs">
                <div className="flex items-start gap-3">
                    <span className="text-xl">🎯</span>
                    <div>
                        <h4 className="font-bold text-violet-700 text-sm mb-1">%MG (AUTO)</h4>
                        <p className="text-xs text-violet-600 leading-relaxed">
                            <strong>Classificação:</strong> Por género e idade
                            <br />
                            <span className="text-violet-500">Ex: Homem 25% → Nível Médio</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Refresh Info */}
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200 rounded-xl px-4 py-3 max-w-xs">
                <div className="flex items-start gap-3">
                    <span className="text-xl">🔄</span>
                    <div>
                        <h4 className="font-bold text-blue-700 text-sm mb-1">Atualização</h4>
                        <p className="text-xs text-blue-600 leading-relaxed">
                            Dados atualizados automaticamente.
                            <br />
                            <span className="text-blue-500">Clique no <strong>⟳</strong> no header para forçar.</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
