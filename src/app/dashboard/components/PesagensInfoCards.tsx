/**
 * Info cards with formulas, examples and short descriptions.
 */

const cardBase =
    "flex flex-col min-h-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200/80 rounded-lg px-3 py-2.5 min-w-0 w-full overflow-hidden shadow-sm";

const iconWrap = "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-violet-100 text-base";

const titleClass = "font-semibold text-violet-800 text-sm leading-tight mb-1";
const lineClass = "text-[11px] sm:text-xs text-violet-700/90 leading-snug";
const hintClass = "text-[10px] sm:text-[11px] text-violet-600/80 leading-snug mt-0.5";

export function PesagensInfoCards() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full min-w-0 overflow-hidden">
            {/* IMC */}
            <div className={cardBase}>
                <div className="flex items-start gap-2.5">
                    <div className={iconWrap}>🤖</div>
                    <div className="min-w-0 flex-1">
                        <h4 className={titleClass}>IMC (AUTO)</h4>
                        <p className={lineClass}>
                            <span className="font-semibold text-violet-700">Fórmula:</span> Peso (kg) ÷ Altura² (m). Índice de massa corporal.
                        </p>
                        <p className={lineClass}><span className="font-medium text-violet-600">Ex: 80 kg ÷ (1,75 m)² = 26,1 kg/m²</span></p>
                        <p className={hintClass}>Classificação automática: baixo peso, normal, pré-obesidade, obesidade.</p>
                    </div>
                </div>
            </div>

            {/* Δ Peso */}
            <div className={cardBase}>
                <div className="flex items-start gap-2.5">
                    <div className={iconWrap}>✨</div>
                    <div className="min-w-0 flex-1">
                        <h4 className={titleClass}>Δ Peso (AUTO)</h4>
                        <p className={lineClass}>
                            <span className="font-semibold text-violet-700">Fórmula:</span> Peso da pesagem atual − peso da pesagem anterior.
                        </p>
                        <p className={lineClass}><span className="font-medium text-violet-600">Ex: 80 kg − 82 kg = −2 kg</span></p>
                        <p className={hintClass}>Valor positivo = ganho; negativo = perda. Útil para acompanhar tendência.</p>
                    </div>
                </div>
            </div>

            {/* %MG */}
            <div className={cardBase}>
                <div className="flex items-start gap-2.5">
                    <div className={iconWrap}>🎯</div>
                    <div className="min-w-0 flex-1">
                        <h4 className={titleClass}>%MG (AUTO)</h4>
                        <p className={lineClass}>
                            <span className="font-semibold text-violet-700">Classificação:</span> Percentagem de massa gorda. Critérios por género e idade.
                        </p>
                        <p className={lineClass}><span className="font-medium text-violet-600">Ex: Homem 25% → Médio (Aceitável)</span></p>
                        <p className={hintClass}>Escalas: muito baixo, baixo, excelente, bom, médio, elevado, muito elevado.</p>
                    </div>
                </div>
            </div>

            {/* SMI */}
            <div className={cardBase}>
                <div className="flex items-start gap-2.5">
                    <div className={iconWrap}>💪</div>
                    <div className="min-w-0 flex-1">
                        <h4 className={titleClass}>SMI (AUTO)</h4>
                        <p className={lineClass}>
                            <span className="font-semibold text-violet-700">Fórmula (membros):</span> (MS dir. + MS esq. + MI dir. + MI esq.) ÷ Altura² (m).
                        </p>
                        <p className={lineClass}><span className="font-medium text-violet-600">Ex: (3,2 + 3,1 + 9,5 + 9,4) ÷ (1,75 m)² ≈ 8,2 kg/m²</span></p>
                        <p className={hintClass}>Soma dos quatro membros (kg) a dividir pela altura ao quadrado. Alternativa: MM ÷ Altura². Classificação por género.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
