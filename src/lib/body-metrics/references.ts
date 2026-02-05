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
        "20-29": { excelente: "44+", bom: "39-43", medio: "35-38", abaixoMedia: "< 35" },
        "30-39": { excelente: "40+", bom: "35-39", medio: "30-34", abaixoMedia: "< 30" },
        "40-49": { excelente: "35+", bom: "27-34", medio: "23-26", abaixoMedia: "< 23" },
        "50-59": { excelente: "28+", bom: "21-27", medio: "15-20", abaixoMedia: "< 15" },
        "60+": { excelente: "24+", bom: "18-23", medio: "12-17", abaixoMedia: "< 12" }
    },
    FEMALE: {
        "20-29": { excelente: "39+", bom: "33-38", medio: "29-32", abaixoMedia: "< 29" },
        "30-39": { excelente: "32+", bom: "25-31", medio: "20-24", abaixoMedia: "< 20" },
        "40-49": { excelente: "27+", bom: "19-26", medio: "15-18", abaixoMedia: "< 15" },
        "50-59": { excelente: "20+", bom: "12-19", medio: "8-11", abaixoMedia: "< 8" },
        "60+": { excelente: "14+", bom: "7-13", medio: "4-6", abaixoMedia: "< 4" }
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

/** Flexões 1' (Homens/Mulheres) – Excelente, Bom, Médio, Mau – aligned with referências table */
export const FLEXOES_REFERENCES = {
    MALE: {
        "20-29": { excelente: "50+", bom: "36-49", medio: "20-35", mau: "0-19" },
        "30-39": { excelente: "45+", bom: "30-44", medio: "17-29", mau: "0-16" },
        "40-49": { excelente: "40+", bom: "26-39", medio: "14-25", mau: "0-13" },
        "50-59": { excelente: "35+", bom: "21-34", medio: "11-20", mau: "0-10" },
        "60+": { excelente: "30+", bom: "17-29", medio: "8-16", mau: "0-7" }
    },
    FEMALE: {
        "20-29": { excelente: "35+", bom: "25-34", medio: "13-24", mau: "0-12" },
        "30-39": { excelente: "30+", bom: "21-29", medio: "11-20", mau: "0-10" },
        "40-49": { excelente: "25+", bom: "18-24", medio: "9-17", mau: "0-8" },
        "50-59": { excelente: "21+", bom: "15-20", medio: "7-14", mau: "0-6" },
        "60+": { excelente: "19+", bom: "12-18", medio: "5-11", mau: "0-4" }
    }
};
