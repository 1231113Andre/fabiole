/**
 * @fileoverview User sheet data reading module
 * @author Personal Trainer Platform Team
 * @description This module handles reading and parsing data from user sheets.
 * @since 1.0.0
 */

import { getSheetsAPI } from '../auth';
import { ACCOUNT_DATA_SHEET_ID } from '../config';
import { generateUserSheetName } from '../utils';
import { UserSheetData } from '../types';
import { parsePersonalInfo, parsePesagens, parsePerimetros, parseAvaliacoes } from './parsing';
import { apiCache, CacheKeys } from '../cache';

/**
 * Read user data from user sheet
 * @description Retrieves all data from a user's dedicated sheet, including:
 *              - Personal information (row 2)
 *              - Pesagens entries (weight tracking data)
 *              - Perímetros entries (body measurements)
 *              - Avaliações entries (physical evaluations)
 * 
 * @param {string} email - User's email address
 * @returns {Promise<UserSheetData | null>} Complete user sheet data, or null if sheet doesn't exist
 * @throws {Error} If sheet cannot be read
 * 
 * @example
 * const userData = await getUserSheetData('user@example.com');
 * if (userData) {
 *   console.log(`User: ${userData.personalInfo.userName}`);
 *   console.log(`Pesagens: ${userData.pesagens.length} entries`);
 * }
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
/**
 * Fetch fresh data from Google Sheets (internal function)
 */
async function fetchUserSheetDataFromAPI(email: string): Promise<UserSheetData | null> {
  const userSheetName = generateUserSheetName(email);
  console.log(`📖 [Google Sheets] Fetching fresh data from: ${userSheetName}`);
  
  const sheets = await getSheetsAPI();
  
  let response;
  try {
    // Read entire sheet - use A1:Z1000 range instead of A:AB to avoid parsing errors on empty sheets
    response = await sheets.spreadsheets.values.get({
      spreadsheetId: ACCOUNT_DATA_SHEET_ID,
      range: `${userSheetName}!A1:Z1000`, // Read all columns (A-Z = 26 columns, should be enough)
    });
  } catch (error: any) {
    // Handle case where sheet doesn't exist or is being created
    if (error.code === 400 && error.message?.includes('Unable to parse range')) {
      console.log(`ℹ️ [Google Sheets] Sheet ${userSheetName} may be empty or not yet ready, returning null`);
      return null;
    }
    // Re-throw other errors
    throw error;
  }

  const rows = response.data.values || [];
  if (rows.length < 2) {
    console.log(`ℹ️ [Google Sheets] User sheet is empty or has no data`);
    return null;
  }

  // Parse personal info from row 2 (index 1)
  const personalInfo = parsePersonalInfo(rows[1] || []);

  // Parse sections
  const pesagens = parsePesagens(rows);
  const perimetros = parsePerimetros(rows);
  const avaliacoes = parseAvaliacoes(rows);

  const result: UserSheetData = {
    personalInfo,
    pesagens,
    perimetros,
    avaliacoes,
  };

  console.log(`✅ [Google Sheets] User sheet data fetched successfully`);
  console.log(`   - Pesagens: ${pesagens.length} entries`);
  console.log(`   - Perímetros: ${perimetros.length} entries`);
  console.log(`   - Avaliações: ${avaliacoes.length} entries`);

  return result;
}

export async function getUserSheetData(email: string, useCache: boolean = true): Promise<UserSheetData | null> {
  try {
    const cacheKey = CacheKeys.userSheetData(email);
    
    // If not using cache, fetch fresh data immediately
    if (!useCache) {
      apiCache.delete(cacheKey);
      return await fetchUserSheetDataFromAPI(email);
    }

    // Check cache first
    const cached = apiCache.get<UserSheetData>(cacheKey);
    
    if (cached) {
      // Stale-while-revalidate: return cached data immediately
      // and fetch fresh data in background (non-blocking)
      // This provides instant response while ensuring data freshness
      fetchUserSheetDataFromAPI(email)
        .then((freshData) => {
          if (freshData) {
            // Update cache with fresh data (5 minutes TTL for performance)
            apiCache.set(cacheKey, freshData, 5 * 60 * 1000);
          }
        })
        .catch(() => {
          // Silently fail - we already have cached data
        });
      
      return cached;
    }

    // No cache available - fetch fresh data
    const result = await fetchUserSheetDataFromAPI(email);
    
    // Cache with 5 minutes TTL for better performance
    // Data will be refreshed in background on next request if cache exists
    if (result) {
      apiCache.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes TTL
    }

    return result;
  } catch (error) {
    console.error('❌ [Google Sheets] Error reading user sheet data:', error);
    throw error;
  }
}

