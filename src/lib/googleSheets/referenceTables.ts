/**
 * @fileoverview Reference tables data reading module
 * @author Personal Trainer Platform Team
 * @description This module handles reading reference table data from Google Sheets
 * @since 1.0.0
 */

import { getSheetsAPI } from './auth';
import { ACCOUNT_DATA_SHEET_ID } from './config';
import { ReferenceTableData } from './types';
import { apiCache, CacheKeys } from './cache';

const REFERENCE_SHEET_GID = 154503238;

/**
 * Get sheet name by GID
 * @description Finds the sheet name for a given GID
 * Note: GID in URL corresponds to sheetId in the API
 */
async function getSheetNameByGid(spreadsheetId: string, gid: number): Promise<string | null> {
  try {
    const sheets = await getSheetsAPI();
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    // GID in URL is the sheetId in the API
    const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.sheetId === gid);
    return sheet?.properties?.title || null;
  } catch (error) {
    console.error('Error getting sheet name by GID:', error);
    return null;
  }
}

/**
 * Parse reference table data from rows
 * @description Parses raw sheet data into structured reference table data
 */
function parseReferenceTableData(rows: any[][]): ReferenceTableData {
  const data: ReferenceTableData = {};

  if (!rows || rows.length < 2) {
    return data;
  }

  // Track which tables we've already processed to avoid duplicates
  const processedTables = new Set<string>();
  
  // Find table sections by looking for headers
  let currentTable = '';
  let currentGender = '';
  let inTableData = false;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) {
      // Empty row - reset table state if we were in data mode
      if (inTableData) {
        currentTable = '';
        currentGender = '';
        inTableData = false;
      }
      continue;
    }

    const firstCell = String(row[0] || '').toLowerCase().trim();

    // Detect table headers - reset currentTable when new header is found
    if (firstCell.includes('massa gorda')) {
      const gender = firstCell.includes('masculino') ? 'Masculino' : 'Feminino';
      const tableKey = `massaGorda_${gender}`;
      
      // Skip if we've already processed this table
      if (processedTables.has(tableKey)) {
        currentTable = '';
        currentGender = '';
        inTableData = false;
        continue;
      }
      
      processedTables.add(tableKey);
      currentTable = 'massaGorda';
      currentGender = gender;
      inTableData = false;
      continue; // Skip header row
    } else if (firstCell.includes('imc') && !firstCell.includes('classificação')) {
      // Skip if we've already processed IMC table
      if (processedTables.has('imc')) {
        currentTable = '';
        currentGender = '';
        inTableData = false;
        continue;
      }
      
      processedTables.add('imc');
      currentTable = 'imc';
      currentGender = '';
      inTableData = false;
      continue; // Skip header row
    } else if (firstCell.includes('flexões') || firstCell.includes('flexoes')) {
      const gender = firstCell.includes('masculino') ? 'Masculino' : 'Feminino';
      const tableKey = `flexoes_${gender}`;
      
      // Skip if we've already processed this table
      if (processedTables.has(tableKey)) {
        currentTable = '';
        currentGender = '';
        inTableData = false;
        continue;
      }
      
      processedTables.add(tableKey);
      currentTable = 'flexoes';
      currentGender = gender;
      inTableData = false;
      continue; // Skip header row
    } else if (firstCell.includes('abdominais')) {
      const gender = firstCell.includes('masculino') ? 'Masculino' : 'Feminino';
      const tableKey = `abdominais_${gender}`;
      
      // Skip if we've already processed this table
      if (processedTables.has(tableKey)) {
        currentTable = '';
        currentGender = '';
        inTableData = false;
        continue;
      }
      
      processedTables.add(tableKey);
      currentTable = 'abdominais';
      currentGender = gender;
      inTableData = false;
      continue; // Skip header row
    } else if (firstCell.includes('milha')) {
      const gender = firstCell.includes('masculino') ? 'Masculino' : 'Feminino';
      const tableKey = `milha_${gender}`;
      
      // Skip if we've already processed this table
      if (processedTables.has(tableKey)) {
        currentTable = '';
        currentGender = '';
        inTableData = false;
        continue;
      }
      
      processedTables.add(tableKey);
      currentTable = 'milha';
      currentGender = gender;
      inTableData = false;
      continue; // Skip header row
    } else if (firstCell === 'idade' || firstCell === 'classificação') {
      // Skip header rows, but mark that we're now in data mode
      inTableData = true;
      continue;
    } else if (row.length >= 5 && currentTable && inTableData) {
      // Data rows - expect: age/classification, excelente, bom, medio, mau
      const ageOrClass = String(row[0] || '').trim();
      const excelente = String(row[1] || '').trim() || '--';
      const bom = String(row[2] || '').trim() || '--';
      const medio = String(row[3] || '').trim() || '--';
      const mau = String(row[4] || '').trim() || '--';

      // Skip if age/class is empty or not a valid value
      if (!ageOrClass || ageOrClass === '') {
        continue;
      }

      if (currentTable === 'imc') {
        // IMC table has different structure
        if (!data.imc) {
          data.imc = {
            magreza: '--',
            normal: '--',
            sobrepeso: '--',
            obesidade: '--',
          };
        }
        const classKey = ageOrClass.toLowerCase();
        if (classKey.includes('magreza')) {
          data.imc.magreza = excelente;
        } else if (classKey.includes('normal')) {
          data.imc.normal = excelente;
        } else if (classKey.includes('sobrepeso')) {
          data.imc.sobrepeso = excelente;
        } else if (classKey.includes('obesidade')) {
          data.imc.obesidade = excelente;
        }
      } else if (currentTable === 'massaGorda') {
        if (ageOrClass === '20-29' || ageOrClass === '30-39') {
          const key = currentGender === 'Masculino' ? 'massaGordaMasculino' : 'massaGordaFeminino';
          if (!data[key]) {
            data[key] = {} as any;
          }
          // Only update if value is not empty (don't overwrite with empty values)
          if (excelente !== '--' || bom !== '--' || medio !== '--' || mau !== '--') {
            (data[key] as any)[ageOrClass] = { excelente, bom, medio, mau };
          }
        }
      } else if (currentTable === 'flexoes') {
        if (ageOrClass === '20-29' || ageOrClass === '30-39') {
          const key = currentGender === 'Masculino' ? 'flexoesMasculino' : 'flexoesFeminino';
          if (!data[key]) {
            data[key] = {} as any;
          }
          // Only update if value is not empty (don't overwrite with empty values)
          if (excelente !== '--' || bom !== '--' || medio !== '--' || mau !== '--') {
            (data[key] as any)[ageOrClass] = { excelente, bom, medio, mau };
          }
        }
      } else if (currentTable === 'abdominais') {
        if (ageOrClass === '20-29' || ageOrClass === '30-39') {
          const key = currentGender === 'Masculino' ? 'abdominaisMasculino' : 'abdominaisFeminino';
          if (!data[key]) {
            data[key] = {} as any;
          }
          // Only update if value is not empty (don't overwrite with empty values)
          if (excelente !== '--' || bom !== '--' || medio !== '--' || mau !== '--') {
            (data[key] as any)[ageOrClass] = { excelente, bom, medio, mau };
          }
        }
      } else if (currentTable === 'milha') {
        if (ageOrClass === '20-29' || ageOrClass === '30-39') {
          const key = currentGender === 'Masculino' ? 'milhaMasculino' : 'milhaFeminino';
          if (!data[key]) {
            data[key] = {} as any;
          }
          // Only update if value is not empty (don't overwrite with empty values)
          if (excelente !== '--' || bom !== '--' || medio !== '--' || mau !== '--') {
            (data[key] as any)[ageOrClass] = { excelente, bom, medio, mau };
          }
        }
      }
    }
  }

  return data;
}

/**
 * Fetch reference table data from Google Sheets
 * @description Retrieves reference table data from the reference sheet (gid=154503238)
 * @returns {Promise<ReferenceTableData>} Reference table data
 */
export async function getReferenceTableData(useCache: boolean = true): Promise<ReferenceTableData> {
  try {
    const cacheKey = CacheKeys.referenceTables();
    
    // Check cache first
    if (useCache) {
      const cached = apiCache.get<ReferenceTableData>(cacheKey);
      if (cached) {
        console.log('⚡ [Google Sheets] Using cached reference table data');
        return cached;
      }
    }

    console.log(`📖 [Google Sheets] Fetching reference table data from sheet (gid=${REFERENCE_SHEET_GID})`);
    
    // Get sheet name by GID
    const sheetName = await getSheetNameByGid(ACCOUNT_DATA_SHEET_ID, REFERENCE_SHEET_GID);
    
    if (!sheetName) {
      console.warn(`⚠️ [Google Sheets] Sheet with gid=${REFERENCE_SHEET_GID} not found`);
      return {};
    }

    const sheets = await getSheetsAPI();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: ACCOUNT_DATA_SHEET_ID,
      range: `${sheetName}!A:Z`, // Read columns A-Z
    });

    const rows = response.data.values || [];
    const data = parseReferenceTableData(rows);

    // Cache for 10 minutes
    if (data && Object.keys(data).length > 0) {
      apiCache.set(cacheKey, data, 10 * 60 * 1000);
      console.log('✅ [Google Sheets] Reference table data fetched and cached');
    } else {
      console.warn('⚠️ [Google Sheets] No reference table data found');
    }

    return data;
  } catch (error) {
    console.error('❌ [Google Sheets] Error fetching reference table data:', error);
    return {};
  }
}

