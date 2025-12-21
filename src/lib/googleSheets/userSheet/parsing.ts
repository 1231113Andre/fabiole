/**
 * @fileoverview User sheet data parsing module
 * @author Personal Trainer Platform Team
 * @description This module handles parsing of data from user sheets,
 *              including personal information and all training sections.
 * @since 1.0.0
 */

import { UserSheetData, Pesagem, PerimetroCorporal, AvaliacaoFisica } from '../types';

/**
 * Parse personal information from row 2
 * @description Extracts user's personal data from the second row of the sheet
 * 
 * @param {any[]} row - Array of cell values from row 2
 * @returns {UserSheetData['personalInfo']} Parsed personal information
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export function parsePersonalInfo(row: any[]): UserSheetData['personalInfo'] {
  return {
    userName: row[0] || '',
    userSurname: row[1] || '',
    userEmail: row[2] || '',
    userPhone: row[3] || '',
    userBirth: row[4] || '',
    // Column F (index 5) is UUID - skip
    trainingCredit: (() => {
      const val = row[6] || '';
      console.log(`🔍 [Parsing] Row[6] Training Credit raw value: "${val}" (Type: ${typeof val})`);
      return val;
    })(),       // Column G: TRAINING CREDIT 🧮
    trainingsScheduled: row[7] || '',   // Column H: SCHEDULED TRAININGS 🗓️
    debtValue: row[8] || '',            // Column I: DEBT VALUE 💰
    paid: row[9] || '',                 // Column J: PAID? ✅
    q1: row[10] || '',                  // Column K: Q1
    q2: row[11] || '',                  // Column L: Q2
    q3: row[12] || '',                  // Column M: Q3
    q4: row[13] || '',                  // Column N: Q4
    // Column O (index 14) is empty/unused
    goals: row[15] || '',               // Column P: OBJETIVO 📝
    notes: row[16] || '',               // Column Q: NOTES 📝
    age: '',                            // Age is calculated from birth date in read.ts
    // Legacy fields for backward compatibility
    notas: row[15] || '',
    inicio: row[16] || '',
  };
}

/**
 * Parse Pesagens section
 * @description Finds and parses weight tracking data (columns A-L, starting from row 6)
 * 
 * @param {any[]} rows - All rows from the sheet
 * @returns {Pesagem[]} Array of parsed Pesagem entries
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export function parsePesagens(rows: any[]): Pesagem[] {
  const pesagens: Pesagem[] = [];
  let pesagensHeaderRow = -1;

  // Find row with "Pesagens" header (row 4, index 3)
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    if (rows[i] && rows[i][0] && rows[i][0].toString().toLowerCase().includes('pesagens')) {
      pesagensHeaderRow = i;
      break;
    }
  }

  if (pesagensHeaderRow >= 0 && rows.length > pesagensHeaderRow + 2) {
    // Data starts 2 rows after the section header
    for (let i = pesagensHeaderRow + 2; i < rows.length; i++) {
      const row = rows[i] || [];
      const hasDate = row[0] && row[0].toString().trim() !== '';
      const hasWeight = row[1] && row[1].toString().trim() !== '';

      if (hasDate && hasWeight) {
        pesagens.push({
          data: row[0] || '',
          peso: row[1] || '',
          percentualMG: row[2] || '',
          MM: row[3] || '',
          H2O: row[4] || '',
          IMC: row[5] || '',
          gordVisceral: row[6] || '',
          IDMetabolica: row[7] || '',
          massaOssea: row[8] || '',
          resultadoIMC: row[9] || '',
          resultadoPercentualMG: row[10] || '',
          notas: row[11] || '',
          height: row[12] || '',
        });
      } else if (hasDate && !hasWeight) {
        continue; // Empty row with just date - skip
      } else {
        break; // No more data rows
      }
    }
  }

  return pesagens;
}

/**
 * Parse Perímetros section
 * @description Finds and parses body measurements data (columns M-W, starting from row 6)
 * 
 * @param {any[]} rows - All rows from the sheet
 * @returns {PerimetroCorporal[]} Array of parsed PerimetroCorporal entries
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export function parsePerimetros(rows: any[]): PerimetroCorporal[] {
  const perimetros: PerimetroCorporal[] = [];
  let perimetrosHeaderRow = -1;
  let perimetrosStartCol = 12; // Default to column M (index 12)

  // Search for PERÍMETROS header - try different variations and columns
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i] || [];
    // Search across multiple columns (M to P) for the header
    for (let col = 12; col <= 16; col++) {
      const cellValue = row[col]?.toString().toLowerCase() || '';
      // Match various header formats: perímetros, perimetros, body measurements, or emoji prefix
      if (cellValue.includes('perimetro') ||
        cellValue.includes('perímetro') ||
        cellValue.includes('body measurement') ||
        cellValue.includes('📏')) {
        perimetrosHeaderRow = i;
        perimetrosStartCol = col;
        console.log(`[parsePerimetros] Found header at row ${i}, col ${col}: "${row[col]}"`);
        break;
      }
    }
    if (perimetrosHeaderRow >= 0) break;
  }

  if (perimetrosHeaderRow >= 0 && rows.length > perimetrosHeaderRow + 2) {
    // Data starts 2 rows after the section header
    for (let i = perimetrosHeaderRow + 2; i < rows.length; i++) {
      const row = rows[i] || [];
      const dateCol = perimetrosStartCol;
      const hasDate = row[dateCol] && row[dateCol].toString().trim() !== '';

      if (hasDate) {
        perimetros.push({
          date: row[dateCol] || '',
          msRight: row[dateCol + 1] || '',
          msRightFlex: row[dateCol + 2] || '',
          msLeft: row[dateCol + 3] || '',
          msLeftFlex: row[dateCol + 4] || '',
          chest: row[dateCol + 5] || '',
          waist: row[dateCol + 6] || '',
          abdomen: row[dateCol + 7] || '',
          hips: row[dateCol + 8] || '',
          thighR: row[dateCol + 9] || '',
          thighL: row[dateCol + 10] || '',
        });
      } else {
        break; // No more data rows
      }
    }
  } else {
    console.log('[parsePerimetros] Header not found in first 10 rows');
  }

  console.log(`[parsePerimetros] Found ${perimetros.length} entries`);
  return perimetros;
}

/**
 * Parse Avaliação Física section (Physical Evaluation)
 * @description Finds and parses physical evaluation data
 * Sheet columns: DATE 📅, PUSH-UPS 1', SIT-UPS 1', MILE, MILE RESULT, NOTES 📝
 * 
 * @param {any[]} rows - All rows from the sheet
 * @returns {AvaliacaoFisica[]} Array of parsed evaluation entries
 */
export function parseAvaliacoes(rows: any[]): AvaliacaoFisica[] {
  const avaliacoes: AvaliacaoFisica[] = [];

  // Find the AVALIAÇÃO header (search in first 10 rows, columns 23-28)
  let headerRow = -1;
  let startCol = -1;

  for (let row = 0; row < Math.min(10, rows.length); row++) {
    for (let col = 23; col <= 28; col++) {
      const cell = rows[row]?.[col]?.toString().toLowerCase() || '';
      if (cell.includes('avaliação') || cell.includes('physical evaluation') || cell.includes('🏋️')) {
        headerRow = row;
        startCol = col;
        break;
      }
    }
    if (headerRow >= 0) break;
  }

  if (headerRow < 0) {
    console.log('[parseAvaliacoes] Header not found');
    return [];
  }

  console.log(`[parseAvaliacoes] Found header at row ${headerRow}, col ${startCol}`);

  // Data starts 2 rows after header
  for (let i = headerRow + 2; i < rows.length; i++) {
    const row = rows[i] || [];
    const date = row[startCol]?.toString().trim() || '';

    // Stop if no date
    if (!date) break;

    avaliacoes.push({
      date: date,
      pushUps: row[startCol + 1] || '',
      sitUps: row[startCol + 2] || '',
      mile: row[startCol + 3] || '',
      mileResult: row[startCol + 4] || '',
      notes: row[startCol + 5] || '',
    });
  }

  console.log(`[parseAvaliacoes] Found ${avaliacoes.length} entries`);
  return avaliacoes;
}

