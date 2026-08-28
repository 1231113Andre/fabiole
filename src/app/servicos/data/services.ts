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
        popular: false
    },
    {
        title: "Ginástica Laboral / Teambuilding para Empresas",
        titleIcon: "fa-building",
        desc: "Sessões de ginástica laboral e atividades de teambuilding para promover saúde, bem-estar e espírito de equipa nas empresas.",
        price: "Sob consulta",
        icon: "/images/coletivo.jpg",
        color: "from-green-500 to-emerald-600",
        popular: false,
        pdf: "https://1b7dd9d4-91c7-449f-be0e-7e7479c5029f.filesusr.com/ugd/3342dc_0223ae79b6854f449c15e195b1428f49.pdf"
    }
];

