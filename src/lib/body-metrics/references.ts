/**
 * 1-Mile Walk Test (Rockport Walking Test) Reference Times
 * 
 * These reference times are based on normative data for the 1-mile walk test,
 * which is used to estimate cardiorespiratory fitness (VO2 max).
 * 
 * Classifications:
 * - Excelente: Excellent cardiorespiratory fitness
 * - Bom: Good/Above average fitness
 * - Médio: Average fitness
 * - Fraco: Below average/Poor fitness
 * 
 * Times are in mm:ss format. Faster times indicate better cardiorespiratory fitness.
 * 
 * References:
 * - Kline, G.M., et al. (1987). "Estimation of VO2max from a one-mile track walk". 
 *   Medicine and Science in Sports and Exercise, 19(3), 253-259.
 * - ACSM (2018). "ACSM's Guidelines for Exercise Testing and Prescription" (10th ed.)
 * - Rockport Walking Institute normative data
 */
export interface MileThresholds {
    /** Excelente: time < this value (seconds) */
    excelente: number;
    /** Bom: excelente <= time <= bomMax (seconds) */
    bomMax: number;
    /** Médio: bomMax < time <= medioMax (seconds) */
    medioMax: number;
    /** Fraco: time > this value (seconds) */
    fraco: number;
}

export const MILE_THRESHOLDS: { MALE: MileThresholds[]; FEMALE: MileThresholds[] } = {
    MALE: [
        // 18-29: Excelente < 7:30, Bom 7:31-8:30, Médio 8:31-9:45, Fraco > 10:30
        { excelente: 450, bomMax: 510, medioMax: 585, fraco: 630 },
        // 30-39
        { excelente: 480, bomMax: 540, medioMax: 620, fraco: 690 },
        // 40-49
        { excelente: 510, bomMax: 570, medioMax: 650, fraco: 720 },
        // 50-59
        { excelente: 570, bomMax: 630, medioMax: 730, fraco: 825 },
        // 60+
        { excelente: 630, bomMax: 690, medioMax: 810, fraco: 900 },
    ],
    FEMALE: [
        // 18-29: Excelente < 9:00, Bom 9:01-10:30, Médio 10:31-12:00, Fraco > 13:30
        { excelente: 540, bomMax: 630, medioMax: 720, fraco: 810 },
        // 30-39
        { excelente: 585, bomMax: 660, medioMax: 765, fraco: 855 },
        // 40-49
        { excelente: 630, bomMax: 705, medioMax: 810, fraco: 900 },
        // 50-59
        { excelente: 690, bomMax: 765, medioMax: 900, fraco: 990 },
        // 60+
        { excelente: 750, bomMax: 840, medioMax: 990, fraco: 1080 },
    ]
};

/**
 * Sit-ups Test (1 minute) Reference Values
 * 
 * The 1-minute sit-ups test measures abdominal muscular endurance, which is an important
 * component of core strength and overall fitness. This test is commonly used in fitness
 * assessments and military/police physical fitness tests.
 * 
 * Classifications:
 * - Excelente: Excellent abdominal endurance
 * - Bom: Good/Above average endurance
 * - Médio: Average endurance
 * - Abaixo da Média: Below average/Poor endurance
 * 
 * Test protocol:
 * - Perform as many proper sit-ups as possible in 1 minute
 * - Proper form: knees bent, feet flat, hands behind head, elbows touch knees
 * 
 * References:
 * - ACSM (2018). "ACSM's Guidelines for Exercise Testing and Prescription" (10th ed.)
 * - Canadian Society for Exercise Physiology (CSEP) normative data
 * - Pollock, M.L., et al. (1998). "ACSM's Health & Fitness Journal"
 */
export interface CountThresholds {
    /** Excelente: count >= this */
    excelente: number;
    /** Bom: bomMin <= count < excelente */
    bomMin: number;
    /** Médio: medioMin <= count < bomMin */
    medioMin: number;
}

export const ABDOMINAIS_THRESHOLDS: { MALE: CountThresholds[]; FEMALE: CountThresholds[] } = {
    MALE: [
        // 18-29: Excelente 44+, Bom 39-43, Médio 35-38, Abaixo < 35
        { excelente: 44, bomMin: 39, medioMin: 35 },
        // 30-39
        { excelente: 40, bomMin: 35, medioMin: 30 },
        // 40-49
        { excelente: 35, bomMin: 27, medioMin: 23 },
        // 50-59
        { excelente: 28, bomMin: 21, medioMin: 15 },
        // 60+
        { excelente: 24, bomMin: 18, medioMin: 12 },
    ],
    FEMALE: [
        // 18-29: Excelente 39+, Bom 33-38, Médio 29-32, Abaixo < 29
        { excelente: 39, bomMin: 33, medioMin: 29 },
        // 30-39
        { excelente: 32, bomMin: 25, medioMin: 20 },
        // 40-49
        { excelente: 27, bomMin: 19, medioMin: 15 },
        // 50-59
        { excelente: 20, bomMin: 12, medioMin: 8 },
        // 60+
        { excelente: 14, bomMin: 7, medioMin: 4 },
    ]
};

/**
 * SMI (Skeletal Muscle Index) Reference Values
 * 
 * SMI is calculated as: Skeletal Muscle Mass (kg) / Height (m)²
 * 
 * These cutoff values are based on research on sarcopenia (age-related muscle loss)
 * and muscle mass assessment. Lower SMI values are associated with increased risk of
 * physical disability, falls, and mortality in older adults.
 * 
 * Classifications:
 * - Excelente (Atleta): High muscle mass - typical for athletes and highly trained individuals
 * - Bom (Saudável): Good/Healthy muscle mass - optimal for general health
 * - Médio (Normal): Average muscle mass - within normal range
 * - Baixo (Risco): Low muscle mass - at risk for sarcopenia
 * - Crítico: Very low muscle mass - sarcopenia present, requires intervention
 * 
 * Note: These values are gender-specific but not age-dependent in this implementation.
 * Some research suggests age-specific cutoffs, but the values below represent
 * conservative thresholds applicable across adult age ranges.
 * 
 * Clinical significance:
 * - SMI < 8.50 kg/m² (men) or < 6.75 kg/m² (women) indicates Class II sarcopenia (Janssen et al., 2002)
 * - SMI < 7.0 kg/m² (men) or < 5.4 kg/m² (women) indicates severe sarcopenia (Baumgartner et al., 1998)
 * 
 * References:
 * - Janssen, I., et al. (2002). "Skeletal muscle cutpoints associated with elevated physical disability 
 *   risk in older men and women". American Journal of Epidemiology, 156(2), 110-121.
 * - Baumgartner, R.N., et al. (1998). "Epidemiology of sarcopenia among the elderly in New Mexico". 
 *   American Journal of Epidemiology, 147(8), 755-763.
 * - Cruz-Jentoft, A.J., et al. (2019). "Sarcopenia: revised European consensus on definition and diagnosis". 
 *   Age and Ageing, 48(1), 16-31.
 * - Kim, J., et al. (2012). "Total-body skeletal muscle mass: estimation by a new dual-energy X-ray 
 *   absorptiometry method". American Journal of Clinical Nutrition, 76(2), 378-383.
 */
export const SMI_REFERENCES = {
    MALE: {
        excelente: { min: 11.0, max: null },   // > 11.0 kg/m² - Athletic/Excellent
        bom: { min: 10.0, max: 11.0 },         // 10.0-11.0 kg/m² - Good/Healthy
        medio: { min: 8.5, max: 9.99 },        // 8.5-9.99 kg/m² - Average/Normal
        baixo: { min: 7.0, max: 8.49 },        // 7.0-8.49 kg/m² - Low/At Risk
        critico: { min: null, max: 7.0 }       // < 7.0 kg/m² - Critical/Sarcopenia
    },
    FEMALE: {
        excelente: { min: 8.5, max: null },    // > 8.5 kg/m² - Athletic/Excellent
        bom: { min: 7.5, max: 8.5 },           // 7.5-8.5 kg/m² - Good/Healthy
        medio: { min: 6.75, max: 7.49 },       // 6.75-7.49 kg/m² - Average/Normal
        baixo: { min: 5.4, max: 6.74 },        // 5.4-6.74 kg/m² - Low/At Risk
        critico: { min: null, max: 5.4 }       // < 5.4 kg/m² - Critical/Sarcopenia
    }
};

/**
 * Push-ups Test (1 minute) Reference Values
 * 
 * The 1-minute push-ups test measures upper body muscular endurance, specifically
 * the chest, shoulders, and triceps. This is a standard fitness assessment used
 * in many physical fitness evaluations.
 * 
 * Classifications:
 * - Excelente: Excellent upper body endurance
 * - Bom: Good/Above average endurance
 * - Médio: Average endurance
 * - Mau: Below average/Poor endurance
 * 
 * Test protocol:
 * - Perform as many proper push-ups as possible in 1 minute
 * - Proper form: body straight, chest touches ground, full extension at top
 * - Males: standard push-ups (on toes)
 * - Females: can use modified push-ups (on knees) or standard based on fitness level
 * 
 * Note: These values assume standard push-ups for males. For females, values may
 * represent modified push-ups depending on the testing protocol used.
 * 
 * References:
 * - ACSM (2018). "ACSM's Guidelines for Exercise Testing and Prescription" (10th ed.)
 * - Canadian Society for Exercise Physiology (CSEP) normative data
 * - Golding, L.A., et al. (1989). "Y's Way to Physical Fitness" (3rd ed.)
 */
export const FLEXOES_THRESHOLDS: { MALE: CountThresholds[]; FEMALE: CountThresholds[] } = {
    MALE: [
        // 18-29: Excelente 50+, Bom 36-49, Médio 20-35, Mau 0-19
        { excelente: 50, bomMin: 36, medioMin: 20 },
        // 30-39
        { excelente: 45, bomMin: 30, medioMin: 17 },
        // 40-49
        { excelente: 40, bomMin: 26, medioMin: 14 },
        // 50-59
        { excelente: 35, bomMin: 21, medioMin: 11 },
        // 60+
        { excelente: 30, bomMin: 17, medioMin: 8 },
    ],
    FEMALE: [
        // 18-29: Excelente 35+, Bom 25-34, Médio 13-24, Mau 0-12
        { excelente: 35, bomMin: 25, medioMin: 13 },
        // 30-39
        { excelente: 30, bomMin: 21, medioMin: 11 },
        // 40-49
        { excelente: 25, bomMin: 18, medioMin: 9 },
        // 50-59
        { excelente: 21, bomMin: 15, medioMin: 7 },
        // 60+
        { excelente: 19, bomMin: 12, medioMin: 5 },
    ]
};
