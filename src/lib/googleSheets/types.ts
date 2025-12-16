/**
 * @fileoverview Type definitions for Google Sheets integration
 * @author Personal Trainer Platform Team
 * @description This module contains all TypeScript interfaces and types used
 *              throughout the Google Sheets integration.
 * @since 1.0.0
 */

import { InfoDataRow } from '@/types/user';

/**
 * User Sheet Data Structure
 * @description Complete data structure for a user's dedicated sheet,
 *              including personal information and trainer-managed sections.
 * @interface UserSheetData
 * @property {PersonalInfo} personalInfo - User's personal information from row 2
 * @property {Pesagem[]} pesagens - Weight tracking data entries
 * @property {PerimetroCorporal[]} perimetros - Body measurements entries
 * @property {AvaliacaoFisica[]} avaliacoes - Physical evaluation entries
 */
export interface UserSheetData {
  personalInfo: PersonalInfo;
  pesagens: Pesagem[];
  perimetros: PerimetroCorporal[];
  avaliacoes: AvaliacaoFisica[];
  referenceTables?: ReferenceTableData;
}

/**
 * Personal Information
 * @description User's personal data stored in row 2 of their dedicated sheet
 * @interface PersonalInfo
 */
export interface PersonalInfo {
  userName: string;
  userSurname: string;
  userEmail: string;
  userPhone: string;
  userBirth: string;
  trainingCredit: string;
  trainingsScheduled: string;
  debtValue: string;
  paid: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  notas: string;
}

/**
 * Pesagem (Weighting Data)
 * @description Single entry in the weight tracking section
 * @interface Pesagem
 */
export interface Pesagem {
  data: string;
  peso: string;
  percentualMG: string;
  MM: string;
  H2O: string;
  IMC: string;
  gordVisceral: string;
  IDMetabolica: string;
  massaOssea: string;
  resultadoIMC: string;
  resultadoPercentualMG: string;
  notas: string;
}

/**
 * Perímetro Corporal (Body Measurements)
 * @description Single entry in the body measurements section
 * @interface PerimetroCorporal
 */
export interface PerimetroCorporal {
  data: string;
  msDrt: string;
  msDrtCon: string;
  msEsq: string;
  msEsqCon: string;
  peito: string;
  cintura: string;
  abdominal: string;
  anca: string;
  miDrt: string;
  miEsq: string;
}

/**
 * Avaliação Física (Physical Evaluation)
 * @description Single entry in the physical evaluation section
 * @interface AvaliacaoFisica
 */
export interface AvaliacaoFisica {
  data: string;
  flexoes1min: string;
  abdominais1min: string;
  milha: string;
  resultadoMilha: string;
}

/**
 * Connection Test Result
 * @description Result structure for Google Sheets connection test
 * @interface ConnectionTestResult
 */
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: {
    sheetId: string;
    sheetName: string;
    serviceAccountEmail?: string;
    projectId?: string;
    userCount?: number;
    spreadsheetTitle?: string;
    headers?: string[];
  };
  error?: string;
}

// Re-export InfoDataRow for convenience
export type { InfoDataRow };

/**
 * Reference Table Data
 * @description Data structure for reference tables from the reference sheet
 * @interface ReferenceTableData
 */
export interface ReferenceTableData {
  massaGordaMasculino?: {
    '20-29': { excelente: string; bom: string; medio: string; mau: string };
    '30-39': { excelente: string; bom: string; medio: string; mau: string };
  };
  massaGordaFeminino?: {
    '20-29': { excelente: string; bom: string; medio: string; mau: string };
    '30-39': { excelente: string; bom: string; medio: string; mau: string };
  };
  imc?: {
    magreza: string;
    normal: string;
    sobrepeso: string;
    obesidade: string;
  };
  flexoesFeminino?: {
    '20-29': { excelente: string; bom: string; medio: string; mau: string };
    '30-39': { excelente: string; bom: string; medio: string; mau: string };
  };
  flexoesMasculino?: {
    '20-29': { excelente: string; bom: string; medio: string; mau: string };
    '30-39': { excelente: string; bom: string; medio: string; mau: string };
  };
  abdominaisFeminino?: {
    '20-29': { excelente: string; bom: string; medio: string; mau: string };
    '30-39': { excelente: string; bom: string; medio: string; mau: string };
  };
  abdominaisMasculino?: {
    '20-29': { excelente: string; bom: string; medio: string; mau: string };
    '30-39': { excelente: string; bom: string; medio: string; mau: string };
  };
  milhaFeminino?: {
    '20-29': { excelente: string; bom: string; medio: string; mau: string };
    '30-39': { excelente: string; bom: string; medio: string; mau: string };
  };
  milhaMasculino?: {
    '20-29': { excelente: string; bom: string; medio: string; mau: string };
    '30-39': { excelente: string; bom: string; medio: string; mau: string };
  };
}

