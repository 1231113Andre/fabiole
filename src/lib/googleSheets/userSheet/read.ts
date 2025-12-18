/**
 * @fileoverview User sheet data reading module
 * @author Personal Trainer Platform Team
 * @description This module handles reading and parsing data from user sheets.
 * @since 1.0.0
 */

import { getSheetsAPI } from '../auth';
import { ACCOUNT_DATA_SHEET_ID } from '../config';
import { generateUserSheetName, calculateAge } from '../utils';
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
import { fetchReferenceData } from '../referencesSheet/read';


/**
 * Fetch fresh data from Google Sheets (internal function)
 * Optimized to fetch user data and reference data in parallel
 */
async function fetchUserSheetDataFromAPI(email: string): Promise<UserSheetData | null> {
  const userSheetName = generateUserSheetName(email);
  console.log(`📖 [Google Sheets] Fetching data in parallel from: ${userSheetName}`);

  const sheets = await getSheetsAPI();

  // Start both fetches in parallel for better performance
  const userSheetPromise = sheets.spreadsheets.values.get({
    spreadsheetId: ACCOUNT_DATA_SHEET_ID,
    range: `${userSheetName}!A1:AZ1000`,
  }).catch((error: any) => {
    if (error.code === 400 && error.message?.includes('Unable to parse range')) {
      console.log(`ℹ️ [Google Sheets] Sheet ${userSheetName} may be empty or not yet ready`);
      return null;
    }
    throw error;
  });

  // Fetch reference data in parallel (uses its own cache)
  const referencePromise = fetchReferenceData();

  // Wait for both to complete
  const [userSheetResponse, referenceTables] = await Promise.all([
    userSheetPromise,
    referencePromise
  ]);

  // Handle user sheet not found
  if (!userSheetResponse) {
    return null;
  }

  const rows = userSheetResponse.data.values || [];
  if (rows.length < 2) {
    console.log(`ℹ️ [Google Sheets] User sheet is empty or has no data`);
    return null;
  }

  // Parse personal info from row 2 (index 1)
  const personalInfo = parsePersonalInfo(rows[1] || []);

  // Calculate age from the birth date
  if (personalInfo.userBirth) {
    const calculatedAge = calculateAge(personalInfo.userBirth);
    if (calculatedAge) {
      personalInfo.age = calculatedAge;
    }
  }

  // Parse sections (CPU work, very fast)
  const pesagens = parsePesagens(rows);
  const perimetros = parsePerimetros(rows);
  const avaliacoes = parseAvaliacoes(rows);

  const result: UserSheetData = {
    personalInfo,
    pesagens,
    perimetros,
    avaliacoes,
    referenceTables,
  };

  console.log(`✅ [Google Sheets] Data fetched in parallel successfully`);
  console.log(`   - Pesagens: ${pesagens.length} | Perímetros: ${perimetros.length} | Avaliações: ${avaliacoes.length}`);

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
      // Check if cached data is stale (missing referenceTables)
      if (!cached.referenceTables || Object.keys(cached.referenceTables).length === 0) {
        console.log(`ℹ️ [Google Sheets] Cached data is stale (missing reference tables), fetching fresh...`);
        // Fall through to fetch fresh data
      } else {
        // Smart Stale-While-Revalidate: only refresh in background if cache is >50% expired
        const cacheAgePercent = apiCache.getAgePercent(cacheKey);

        if (cacheAgePercent > 0.5) {
          // Cache is getting old, refresh in background
          console.log(`🔄 [Google Sheets] Cache ${Math.round(cacheAgePercent * 100)}% expired, refreshing in background...`);
          fetchUserSheetDataFromAPI(email)
            .then((freshData) => {
              if (freshData) {
                apiCache.set(cacheKey, freshData, 5 * 60 * 1000);
              }
            })
            .catch(() => { /* Silently fail */ });
        } else {
          console.log(`⚡ [Google Sheets] Cache ${Math.round(cacheAgePercent * 100)}% expired, skipping background refresh`);
        }

        return cached;
      }
    }

    // No cache available or stale cache - fetch fresh data
    const result = await fetchUserSheetDataFromAPI(email);

    // Cache with 5 minutes TTL for better performance
    if (result) {
      apiCache.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes TTL
    }

    return result;
  } catch (error) {
    console.error('❌ [Google Sheets] Error reading user sheet data:', error);
    throw error;
  }
}

