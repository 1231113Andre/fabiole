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
  goals: string;        // Column N: OBJETIVO 📝
  notes: string;        // Column O: NOTES 📝
  age?: string;         // Column P: IDADE (or calculated)
  // Legacy fields (kept for backward compatibility)
  notas?: string;       // Deprecated: use goals
  inicio?: string;      // Deprecated: use notes
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
  height: string;
}

/**
 * Perímetro Corporal (Body Measurements)
 * @description Single entry in the body measurements section
 * Columns from sheet: DATE 📅, MS RIGHT, MS RIGHT FLEX, MS LEFT, MS LEFT FLEX, CHEST, WAIST, ABDOMEN, HIPS, THIGH R, THIGH L
 * @interface PerimetroCorporal
 */
export interface PerimetroCorporal {
  date: string;      // DATE 📅
  msRight: string;   // MS RIGHT (arm)
  msRightFlex: string; // MS RIGHT FLEX (arm contracted)
  msLeft: string;    // MS LEFT (arm)
  msLeftFlex: string;  // MS LEFT FLEX (arm contracted)
  chest: string;     // CHEST
  waist: string;     // WAIST
  abdomen: string;   // ABDOMEN
  hips: string;      // HIPS
  thighR: string;    // THIGH R (right leg)
  thighL: string;    // THIGH L (left leg)
}

/**
 * Avaliação Física (Physical Evaluation)
 * @description Single entry in the physical evaluation section
 * Columns: DATE 📅, PUSH-UPS 1', SIT-UPS 1', MILE, MILE RESULT, NOTES 📝
 * @interface AvaliacaoFisica
 */
export interface AvaliacaoFisica {
  date: string;       // DATE 📅
  pushUps: string;    // PUSH-UPS 1'
  sitUps: string;     // SIT-UPS 1'
  mile: string;       // MILE
  mileResult: string; // MILE RESULT
  notes: string;      // NOTES 📝
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
  massaGordaMasculino?: Record<string, { percent?: string; description?: string; excelente?: string; bom?: string; medio?: string; mau?: string }>;
  massaGordaFeminino?: Record<string, { percent?: string; description?: string; excelente?: string; bom?: string; medio?: string; mau?: string }>;
  imc?: {
    magreza: string;
    normal: string;
    sobrepeso: string;
    obesidade: string;
  };
  flexoesFeminino?: Record<string, { excelente: string; bom: string; medio: string; mau: string }>;
  flexoesMasculino?: Record<string, { excelente: string; bom: string; medio: string; mau: string }>;
  abdominaisFeminino?: Record<string, { excelente: string; bom: string; medio: string; mau: string }>;
  abdominaisMasculino?: Record<string, { excelente: string; bom: string; medio: string; mau: string }>;
  milhaFeminino?: Record<string, { excelente: string; bom: string; medio: string; mau: string }>;
  milhaMasculino?: Record<string, { excelente: string; bom: string; medio: string; mau: string }>;
}

