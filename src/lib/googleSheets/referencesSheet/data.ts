/**
 * @fileoverview Reference data tables for fitness metrics
 * @description Contains all the raw data for body fat, push-ups, BMI, sit-ups, and mile test tables.
 */

// ============================================
// MASSA GORDA (Body Fat) DATA
// ============================================

export const MASSA_GORDA_MASCULINO = {
    title: '📊 MASSA GORDA | MASCULINO ♂️',
    headers: ['Categoria', 'Percentagem', 'Descrição'],
    rows: [
        ['Gordura Vital', '2 - 5%', 'Nível mínimo de gordura, essencial para a saúde.'],
        ['Muito Magro (Performance)', '6 - 13%', 'Típico de atletas com foco em definição.'],
        ['Saudável e Boa Forma', '14 - 17%', 'Nível considerado saudável e em boa forma.'],
        ['Nível Médio ⚠️', '18 - 24%', 'Pode indicar necessidade de atenção.'],
        ['Elevado ❌', '25%+', 'Risco para a saúde.'],
    ],
};

export const MASSA_GORDA_FEMININO = {
    title: '📊 MASSA GORDA | FEMININO ♀️',
    headers: ['Categoria', 'Percentagem', 'Descrição'],
    rows: [
        ['Gordura Vital', '10 - 13%', 'Nível mínimo de gordura, essencial para a saúde.'],
        ['Muito Magra (Performance)', '14 - 20%', 'Típico de atletas com foco em definição.'],
        ['Saudável e Boa Forma', '21 - 24%', 'Nível considerado saudável e em boa forma.'],
        ['Nível Médio ⚠️', '25 - 31%', 'Pode indicar necessidade de atenção.'],
        ['Elevado ❌', '32%+', 'Risco para a saúde.'],
    ],
};

// ============================================
// IMC (Body Mass Index) DATA
// ============================================

export const IMC_DATA = {
    title: '⚖️ ÍNDICE DE MASSA CORPORAL (IMC)',
    headers: ['Categoria', 'Intervalo IMC'],
    rows: [
        ['Baixo Peso', '< 18,5'],
        ['Peso Normal ✅', '18,5 - 24,9'],
        ['Pré-obesidade ⚠️', '25,0 - 29,9'],
        ['Obesidade I', '30,0 - 34,9'],
        ['Obesidade II', '35,0 - 39,9'],
        ['Obesidade III ❌', '40,0+'],
    ],
};

// ============================================
// FLEXÕES (Push-ups) DATA
// ============================================

export const FLEXOES_FEMININO = {
    title: '💪 FLEXÕES 1\' | FEMININO ♀️',
    headers: ['Idade', 'Muito Fraco/a', 'Fraco/a', 'Média', 'Bom/Boa', 'Excelente'],
    rows: [
        ['20-29', '0-5', '6-12', '13-24', '25-34', '35+'],
        ['30-39', '0-4', '5-10', '11-20', '21-29', '30+'],
        ['40-49', '0-3', '4-8', '9-17', '18-24', '25+'],
        ['50-59', '0-2', '3-6', '7-14', '15-20', '21+'],
        ['60+', '0-1', '2-4', '5-11', '12-18', '19+'],
    ],
};

export const FLEXOES_MASCULINO = {
    title: '💪 FLEXÕES 1\' | MASCULINO ♂️',
    headers: ['Idade', 'Muito Fraco', 'Fraco', 'Média', 'Bom', 'Excelente'],
    rows: [
        ['20-29', '0-9', '10-19', '20-35', '36-49', '50+'],
        ['30-39', '0-7', '8-16', '17-29', '30-44', '45+'],
        ['40-49', '0-5', '6-13', '14-25', '26-39', '40+'],
        ['50-59', '0-4', '5-10', '11-20', '21-34', '35+'],
        ['60+', '0-3', '4-7', '8-16', '17-29', '30+'],
    ],
};

// ============================================
// ABDOMINAIS (Sit-ups) DATA
// ============================================

export const ABDOMINAIS_FEMININO = {
    title: '🏋️ ABDOMINAIS 1\' | FEMININO ♀️',
    headers: ['Idade', 'Muito Fraco/a', 'Fraco/a', 'Média', 'Bom/Boa', 'Excelente'],
    rows: [
        ['20-29', '0-10', '11-20', '21-30', '31-40', '41+'],
        ['30-39', '0-8', '9-18', '19-28', '29-38', '39+'],
        ['40-49', '0-6', '7-15', '16-25', '26-35', '36+'],
        ['50-59', '0-4', '5-12', '13-22', '23-32', '33+'],
        ['60+', '0-3', '4-10', '11-19', '20-29', '30+'],
    ],
};

export const ABDOMINAIS_MASCULINO = {
    title: '🏋️ ABDOMINAIS 1\' | MASCULINO ♂️',
    headers: ['Idade', 'Muito Fraco', 'Fraco', 'Média', 'Bom', 'Excelente'],
    rows: [
        ['20-29', '0-15', '16-25', '26-40', '41-55', '56+'],
        ['30-39', '0-12', '13-22', '23-37', '38-52', '53+'],
        ['40-49', '0-10', '11-20', '21-34', '35-49', '50+'],
        ['50-59', '0-8', '9-17', '18-30', '31-45', '46+'],
        ['60+', '0-6', '7-15', '16-28', '29-42', '43+'],
    ],
};

// ============================================
// MILHA (Mile Test) DATA
// ============================================

export const MILHA_FEMININO = {
    title: '🏃 TESTE DA MILHA (1609m) | FEMININO ♀️',
    headers: ['Idade', 'Fraco', 'Abaixo Média', 'Média', 'Acima Média', 'Excelente'],
    rows: [
        ['20-29', '> 12:00', '10:01-12:00', '09:01-10:00', '08:01-09:00', '< 08:00'],
        ['30-39', '> 12:30', '10:31-12:30', '09:31-10:30', '08:31-09:30', '< 08:30'],
        ['40-49', '> 13:00', '11:01-13:00', '10:01-11:00', '09:01-10:00', '< 09:00'],
        ['50-59', '> 13:30', '11:31-13:30', '10:31-11:30', '09:31-10:30', '< 09:30'],
        ['60+', '> 14:00', '12:01-14:00', '11:01-12:00', '10:01-11:00', '< 10:00'],
    ],
};

export const MILHA_MASCULINO = {
    title: '🏃 TESTE DA MILHA (1609m) | MASCULINO ♂️',
    headers: ['Idade', 'Fraco', 'Abaixo Média', 'Média', 'Acima Média', 'Excelente'],
    rows: [
        ['20-29', '> 10:00', '09:01-10:00', '08:01-09:00', '07:01-08:00', '< 07:00'],
        ['30-39', '> 10:30', '09:31-10:30', '08:31-09:30', '07:31-08:30', '< 07:30'],
        ['40-49', '> 11:00', '10:01-11:00', '09:01-10:00', '08:01-09:00', '< 08:00'],
        ['50-59', '> 11:30', '10:31-11:30', '09:31-10:30', '08:31-09:30', '< 08:30'],
        ['60+', '> 12:00', '11:01-12:00', '10:01-11:00', '09:01-10:00', '< 09:00'],
    ],
};
