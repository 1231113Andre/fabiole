/**
 * @fileoverview Main barrel export for Google Sheets integration
 * @author Personal Trainer Platform Team
 * @description This module serves as the main entry point for all Google Sheets operations.
 *              It re-exports all public functions and types from the modular components.
 * @since 1.0.0
 */

// Configuration
export * from './config';

// Types
export * from './types';

// Authentication
export { getAuthClient, getSheetsAPI } from './auth';

// Utilities
export { normalizeEmailForSheetName, generateUserSheetName } from './utils';

// InfoData operations
export {
  initializeInfoDataSheet,
  getAllInfoDataUsers,
  findUserInInfoData,
  userExistsInInfoData,
  addUserToInfoData,
} from './infoData';

// User sheet operations
export {
  getOrCreateUserSheet,
  getUserSheetData,
} from './userSheet/index';

// Connection testing
export { testConnection } from './connection';

// Cache utilities
export { apiCache, CacheKeys, clearUserCache, clearInfoDataCache } from './cache';

// Reference tables (read-only access)
export { getReferenceTableData } from './referenceTables';

// References sheet manager (global sheet with fitness benchmarks)
export {
  ensureReferencesSheetExists,
  regenerateReferencesSheet,
  getReferencesSheetManager,
  ReferencesSheetManager,
} from './referencesSheet';

