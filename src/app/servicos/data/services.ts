import { Service } from "../types";

export const services: Service[] = [
    {
        title: "Treinos Presenciais",
        titleIcon: "fa-dumbbell",
        desc: "Sessões 1:1 com acompanhamento personalizado no ginásio ou ao ar livre. Correção técnica em tempo real e motivação constante.",
        price: { amount: "€40", unit: "por hora", prefix: "Preço" },
        features: [
            { text: "Acompanhamento 1:1", icon: "fa-user", important: true, highlightWords: ["Acompanhamento"] },
            { text: "Correção técnica", icon: "fa-chart-line", important: true, highlightWords: ["Correção", "técnica"] },
            { text: "Flexibilidade total", icon: "fa-clock", highlightWords: ["Flexibilidade"] },
            { text: "Ajustes imediatos", icon: "fa-bolt", highlightWords: ["Ajustes"] },
            { text: "Motivação constante", icon: "fa-fire", important: true, highlightWords: ["Motivação"] },
            { text: "Equipamentos profissionais", icon: "fa-dumbbell", important: true, highlightWords: ["Equipamentos"] }
        ],
        icon: "/images/services/training-sessions.png",
        color: "from-[#1E90FF] to-blue-600",
        popular: true
    },
    {
        title: "Treinos Online",
        titleIcon: "fa-video",
        desc: "Planos remotos com acompanhamento semanal e ajustes personalizados. Ideal para quem prefere treinar em casa.",
        price: { amount: "€30", unit: "por hora", prefix: "Preço" },
        features: [
            { text: "Planos personalizados", icon: "fa-clipboard-list", important: true, highlightWords: ["Planos"] },
            { text: "Acompanhamento semanal", icon: "fa-calendar-week", important: true, highlightWords: ["Acompanhamento"] },
            { text: "Ajustes contínuos", icon: "fa-sync-alt", highlightWords: ["Ajustes"] },
            { text: "Videochamada", icon: "fa-video", important: true, highlightWords: ["Videochamada"] },
            { text: "Suporte por mensagem", icon: "fa-comments", highlightWords: ["mensagem"] },
            { text: "Treina em casa", icon: "fa-home", highlightWords: ["Treina"] }
        ],
        icon: "/images/online1.png",
        color: "from-[#FF6B35] to-orange-600",
        popular: false
    },
    {
        title: "Acompanhamento Online",
        titleIcon: "fa-chart-line",
        desc: "Através de uma app e contacto regular, recebe um plano de treino personalizado com exercícios detalhados (vídeo e imagem).",
        price: { amount: "€35", unit: "/ mês", prefix: "Preço" },
        features: [
            { text: "Plano personalizado", icon: "fa-clipboard-list", important: true, highlightWords: ["Plano"] },
            { text: "App dedicada", icon: "fa-mobile-alt", important: true, highlightWords: ["App"] },
            { text: "Vídeos e imagens", icon: "fa-photo-video", highlightWords: ["Vídeos"] },
            { text: "Contacto regular", icon: "fa-phone", highlightWords: ["Contacto"] },
            { text: "Acompanhamento mensal", icon: "fa-calendar-alt", important: true, highlightWords: ["Acompanhamento"] },
            { text: "Flexibilidade total", icon: "fa-clock", highlightWords: ["Flexibilidade"] }
        ],
        icon: "/images/services/tracking-monitor.png",
        color: "from-purple-500 to-pink-600",
        popular: false,
        contactOnly: true
    },
    {
        title: "Movequi — Ginástica laboral para empresas",
        titleIcon: "fa-building",
        desc: "Sessões orientadas de 15 minutos no local de trabalho, ajustadas às tarefas e aos horários da equipa. Porto, Gaia, Espinho, Ovar e Santa Maria da Feira.",
        price: "Sob consulta",
        priceSettingKey: "price_ginastica_laboral",
        icon: "/images/coletivo.jpg",
        color: "from-green-500 to-emerald-600",
        popular: false,
        pdf: {
            label: "Conhecer a Movequi · PDF",
            href: "/docs/movequi-ginastica-laboral-empresas.pdf",
            icon: "fa-file-pdf"
        },
        secondaryAction: {
            label: "Pedir proposta para a empresa",
            href:
                "mailto:movequi.pt@gmail.com" +
                "?subject=" + encodeURIComponent("Pedido de proposta — Ginástica laboral Movequi") +
                "&body=" + encodeURIComponent(
                    "Olá,\n\nGostaríamos de receber uma proposta de ginástica laboral para a nossa empresa.\n\n" +
                    "Empresa:\nLocalidade:\nTarefas da equipa:\nNúmero de pessoas:\nTurnos:\n\nObrigado."
                ),
            icon: "fa-envelope"
        }
    },
    {
        title: "Teambuilding para Empresas",
        titleIcon: "fa-users",
        desc: "Atividades de teambuilding à medida para promover o espírito de equipa, a comunicação e o bem-estar dos colaboradores.",
        price: "Sob consulta",
        icon: "/images/grupo.png",
        color: "from-teal-500 to-cyan-600",
        popular: false,
        contactOnly: true
    }
];

