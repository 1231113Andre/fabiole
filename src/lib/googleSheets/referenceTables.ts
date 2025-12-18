/**
 * @fileoverview Reference tables data reading module
 * @author Personal Trainer Platform Team
 * @description This module handles reading reference table data from Google Sheets.
 *              It now delegates to the robust implementation in referencesSheet/read.ts
 * @since 1.1.0
 */

import { fetchReferenceData } from './referencesSheet/read';
import { ReferenceTableData } from './types';
import { apiCache, CacheKeys } from './cache';

/**
 * Fetch reference table data from Google Sheets
 * @description Retrieves reference table data from the reference sheet
 * @returns {Promise<ReferenceTableData>} Reference table data
 */
export async function getReferenceTableData(useCache: boolean = true): Promise<ReferenceTableData> {
  const cacheKey = CacheKeys.referenceTables();

  // Check cache first
  if (useCache) {
    const cached = apiCache.get<ReferenceTableData>(cacheKey);
    if (cached) {
      // Basic validation to check if cache is not just an empty object
      if (Object.keys(cached).length > 0) {
        // console.log('⚡ [Google Sheets] Using cached reference table data');
        return cached;
      }
    }
  }

  // Fetch fresh data using the robust reader
  const data = await fetchReferenceData();

  // Cache for 10 minutes if we got data
  if (data && Object.keys(data).length > 0) {
    apiCache.set(cacheKey, data, 10 * 60 * 1000);
    // console.log('✅ [Google Sheets] Reference table data fetched and cached');
  }

  return data;
}
