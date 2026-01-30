/** Teste da Milha – Excelente, Bom, Médio, Fraco – aligned with referências table */
export const MILE_REFERENCES = {
    MALE: {
        "20-29": { excelente: "< 07:30", bom: "07:31-08:30", medio: "08:31-09:45", fraco: "> 10:30" },
        "30-39": { excelente: "< 08:00", bom: "08:01-09:00", medio: "09:01-10:20", fraco: "> 11:30" },
        "40-49": { excelente: "< 08:30", bom: "08:31-09:30", medio: "09:31-10:50", fraco: "> 12:00" },
        "50-59": { excelente: "< 09:30", bom: "09:31-10:30", medio: "10:31-12:10", fraco: "> 13:45" },
        "60-69": { excelente: "< 10:30", bom: "10:31-11:30", medio: "11:31-13:30", fraco: "> 15:00" }
    },
    FEMALE: {
        "20-29": { excelente: "< 09:00", bom: "09:01-10:30", medio: "10:31-12:00", fraco: "> 13:30" },
        "30-39": { excelente: "< 09:45", bom: "09:46-11:00", medio: "11:01-12:45", fraco: "> 14:15" },
        "40-49": { excelente: "< 10:30", bom: "10:31-11:45", medio: "11:46-13:30", fraco: "> 15:00" },
        "50-59": { excelente: "< 11:30", bom: "11:31-12:45", medio: "12:46-15:00", fraco: "> 16:30" },
        "60-69": { excelente: "< 12:30", bom: "12:31-14:00", medio: "14:01-16:30", fraco: "> 18:00" }
    }
};

/** Abdominais 1' (Homens/Mulheres) – Excelente, Bom, Médio, Abaixo da Média – aligned with referências table */
export const ABDOMINAIS_REFERENCES = {
    MALE: {
        "18-25": { excelente: "44+", bom: "39-43", medio: "35-38", abaixoMedia: "< 30" },
        "35-45": { excelente: "35+", bom: "27-34", medio: "23-26", abaixoMedia: "< 17" },
        "55-65": { excelente: "24+", bom: "18-23", medio: "12-17", abaixoMedia: "< 7" }
    },
    FEMALE: {
        "18-25": { excelente: "39+", bom: "33-38", medio: "29-32", abaixoMedia: "< 25" },
        "35-45": { excelente: "27+", bom: "19-26", medio: "15-18", abaixoMedia: "< 7" },
        "55-65": { excelente: "14+", bom: "7-13", medio: "4-6", abaixoMedia: "< 2" }
    }
};

/** SMI (Skeletal Muscle Index) – Excelente, Bom, Médio, Baixo, Crítico – kg/m², no age bands */
export const SMI_REFERENCES = {
    MALE: {
        excelente: { min: 11.5, max: null },   // > 11.5
        bom: { min: 10.76, max: 11.5 },
        medio: { min: 9.76, max: 10.75 },
        baixo: { min: 8.51, max: 9.75 },
        critico: { min: null, max: 8.51 }      // < 8.51
    },
    FEMALE: {
        excelente: { min: 9.41, max: null },   // > 9.41
        bom: { min: 8.76, max: 9.41 },
        medio: { min: 7.26, max: 8.75 },
        baixo: { min: 6.51, max: 7.25 },
        critico: { min: null, max: 6.51 }     // < 6.51
    }
};

/** Push-ups reference (PUSH UPS) – Excelente, Acima da Média, Média, Fraco – aligned with referências table */
export const PUSHUPS_REFERENCES = {
    MALE: {
        "18-29": { excelente: "30+", acimaMedia: "22-29", media: "17-21", fraco: "< 11" },
        "30-39": { excelente: "22+", acimaMedia: "17-21", media: "11-16", fraco: "< 8" },
        "40-49": { excelente: "18+", acimaMedia: "11-17", media: "8-10", fraco: "< 5" },
        "50-59": { excelente: "13+", acimaMedia: "9-12", media: "7-8", fraco: "< 3" },
        "60-69": { excelente: "10+", acimaMedia: "6-9", media: "4-5", fraco: "< 2" }
    },
    FEMALE: {
        "18-29": { excelente: "27+", acimaMedia: "21-26", media: "15-20", fraco: "< 10" },
        "30-39": { excelente: "20+", acimaMedia: "15-19", media: "11-14", fraco: "< 8" },
        "40-49": { excelente: "15+", acimaMedia: "11-14", media: "8-10", fraco: "< 4" },
        "50-59": { excelente: "11+", acimaMedia: "8-10", media: "5-7", fraco: "< 2" },
        "60-69": { excelente: "9+", acimaMedia: "5-8", media: "2-4", fraco: "< 1" }
    }
};
