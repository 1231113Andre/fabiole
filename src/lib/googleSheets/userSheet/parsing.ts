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
    trainingCredit: row[5] || '',
    trainingsScheduled: row[6] || '',
    debtValue: row[7] || '',
    paid: row[8] || '',
    q1: row[9] || '',
    q2: row[10] || '',
    q3: row[11] || '',
    q4: row[12] || '',
    notas: row[13] || '',
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
  
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    if (rows[i] && rows[i][12] && rows[i][12].toString().toLowerCase().includes('perímetros')) {
      perimetrosHeaderRow = i;
      break;
    }
  }
  
  if (perimetrosHeaderRow >= 0 && rows.length > perimetrosHeaderRow + 2) {
    for (let i = perimetrosHeaderRow + 2; i < rows.length; i++) {
      const row = rows[i] || [];
      const hasDate = row[12] && row[12].toString().trim() !== '';
      
      if (hasDate) {
        perimetros.push({
          data: row[12] || '',
          msDrt: row[13] || '',
          msDrtCon: row[14] || '',
          msEsq: row[15] || '',
          msEsqCon: row[16] || '',
          peito: row[17] || '',
          cintura: row[18] || '',
          abdominal: row[19] || '',
          anca: row[20] || '',
          miDrt: row[21] || '',
          miEsq: row[22] || '',
        });
      } else {
        break; // No more data rows
      }
    }
  }
  
  return perimetros;
}

/**
 * Parse Avaliação Física section
 * @description Finds and parses physical evaluation data (columns X-AB, starting from row 6)
 * 
 * @param {any[]} rows - All rows from the sheet
 * @returns {AvaliacaoFisica[]} Array of parsed AvaliacaoFisica entries
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export function parseAvaliacoes(rows: any[]): AvaliacaoFisica[] {
  const avaliacoes: AvaliacaoFisica[] = [];
  let avaliacoesHeaderRow = -1;
  
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    if (rows[i] && rows[i][23] && rows[i][23].toString().toLowerCase().includes('avaliação')) {
      avaliacoesHeaderRow = i;
      break;
    }
  }
  
  if (avaliacoesHeaderRow >= 0 && rows.length > avaliacoesHeaderRow + 2) {
    for (let i = avaliacoesHeaderRow + 2; i < rows.length; i++) {
      const row = rows[i] || [];
      const hasDate = row[23] && row[23].toString().trim() !== '';
      
      if (hasDate) {
        avaliacoes.push({
          data: row[23] || '',
          flexoes1min: row[24] || '',
          abdominais1min: row[25] || '',
          milha: row[26] || '',
          resultadoMilha: row[27] || '',
        });
      } else {
        break; // No more data rows
      }
    }
  }
  
  return avaliacoes;
}

