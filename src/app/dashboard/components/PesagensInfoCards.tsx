/**
 * Info cards displayed on the Pesagens tab
 */

interface InfoCardProps {
    emoji: string;
    title: string;
    formula: string;
    example: string;
    colorClass: "violet" | "blue";
}

function InfoCard({ emoji, title, formula, example, colorClass }: InfoCardProps) {
    const colors = {
        violet: {
            text: "text-violet-700",
            textLight: "text-violet-600",
            textLighter: "text-violet-500",
        },
        blue: {
            text: "text-blue-700",
            textLight: "text-blue-600",
            textLighter: "text-blue-500",
        },
    };

    const c = colors[colorClass];

    return (
        <div className="flex items-start gap-3">
            <span className="text-2xl">{emoji}</span>
            <div>
                <h4 className={`font-bold ${c.text} text-sm mb-1`}>{title}</h4>
                <p className={`text-xs ${c.textLight} leading-relaxed`}>
                    <strong>Fórmula:</strong> {formula}
                    <br />
                    <span className={c.textLighter}>
                        Ex: {example}
                    </span>
                </p>
            </div>
        </div>
    );
}

export function PesagensInfoCards() {
    return (
        <div className="flex flex-wrap gap-3">
            {/* Auto-Calculations Info (IMC + Δ Peso) */}
            <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200 rounded-xl p-4 max-w-md">
                <div className="space-y-4">
                    {/* IMC Section */}
                    <InfoCard
                        emoji="🤖"
                        title="Cálculo Automático do IMC"
                        formula="IMC = Peso (kg) ÷ Altura² (m)"
                        example="80kg ÷ (1.75m)² = 26.1"
                        colorClass="violet"
                    />

                    {/* Delta Peso Section */}
                    <div className="border-t border-violet-200 pt-3">
                        <InfoCard
                            emoji="✨"
                            title="Variação de Peso (Δ)"
                            formula="Δ = Peso atual − Peso anterior"
                            example="80kg − 82kg = -2 kg"
                            colorClass="violet"
                        />
                    </div>
                </div>
            </div>

            {/* Data Refresh Info */}
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200 rounded-xl p-4 max-w-xs">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">🔄</span>
                    <div>
                        <h4 className="font-bold text-blue-700 text-sm mb-1">Atualização de Dados</h4>
                        <p className="text-xs text-blue-600 leading-relaxed">
                            Os dados são atualizados automaticamente.
                            <br />
                            <span className="text-blue-500">
                                Para forçar atualização, clique no <strong>ícone de refresh</strong> no header.
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
