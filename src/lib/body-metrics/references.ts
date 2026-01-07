export const MILE_REFERENCES = {
    MALE: {
        "20-29": { mau: "> 09:00", medio: "08:01-09:00", bom: "07:01-08:00", excelente: "< 07:00" },
        "30-39": { mau: "> 09:30", medio: "08:31-09:30", bom: "07:31-08:30", excelente: "< 07:30" },
        "40-49": { mau: "> 10:00", medio: "09:01-10:00", bom: "08:01-09:00", excelente: "< 08:00" },
        "50-59": { mau: "> 10:30", medio: "09:31-10:30", bom: "08:31-09:30", excelente: "< 08:30" },
        "60+": { mau: "> 11:00", medio: "10:01-11:00", bom: "09:01-10:00", excelente: "< 09:00" }
    },
    FEMALE: {
        "20-29": { mau: "> 10:00", medio: "09:01-10:00", bom: "08:01-09:00", excelente: "< 08:00" },
        "30-39": { mau: "> 10:30", medio: "09:31-10:30", bom: "08:31-09:30", excelente: "< 08:30" },
        "40-49": { mau: "> 11:00", medio: "10:01-11:00", bom: "09:01-10:00", excelente: "< 09:00" },
        "50-59": { mau: "> 11:30", medio: "10:31-11:30", bom: "09:31-10:30", excelente: "< 09:30" },
        "60+": { mau: "> 12:00", medio: "11:01-12:00", bom: "10:01-11:00", excelente: "< 10:00" }
    }
};

export const PUSHUPS_REFERENCES = {
    MALE: {
        "20-29": { mau: "0-19", medio: "20-35", bom: "36-49", excelente: "50+" },
        "30-39": { mau: "0-16", medio: "17-29", bom: "30-44", excelente: "45+" },
        "40-49": { mau: "0-13", medio: "14-25", bom: "26-39", excelente: "40+" },
        "50-59": { mau: "0-10", medio: "11-20", bom: "21-34", excelente: "35+" },
        "60+": { mau: "0-7", medio: "8-16", bom: "17-29", excelente: "30+" }
    },
    FEMALE: {
        "20-29": { mau: "0-12", medio: "13-24", bom: "25-34", excelente: "35+" },
        "30-39": { mau: "0-10", medio: "11-20", bom: "21-29", excelente: "30+" },
        "40-49": { mau: "0-8", medio: "9-17", bom: "18-24", excelente: "25+" },
        "50-59": { mau: "0-6", medio: "7-14", bom: "15-20", excelente: "21+" },
        "60+": { mau: "0-4", medio: "5-11", bom: "12-18", excelente: "19+" }
    }
};
