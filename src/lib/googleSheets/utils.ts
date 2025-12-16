/**
 * @fileoverview Utility functions for Google Sheets integration
 * @author Personal Trainer Platform Team
 * @description This module contains helper functions used throughout
 *              the Google Sheets integration, such as email normalization.
 * @since 1.0.0
 */

/**
 * Normalize email address for use as Google Sheets sheet name
 * @description Converts an email address to a valid sheet name format.
 *              Google Sheets sheet names have restrictions on special characters.
 * 
 * Normalization rules:
 * - Convert to lowercase
 * - Replace "@" with "_at_"
 * - Replace "." with "_"
 * 
 * @param {string} email - The email address to normalize
 * @returns {string} Normalized email suitable for sheet name
 * 
 * @example
 * normalizeEmailForSheetName('adnresilva@gmail.com')
 * // Returns: 'adnresilva_at_gmail_com'
 * 
 * @example
 * normalizeEmailForSheetName('User.Name@example.co.uk')
 * // Returns: 'user_name_at_example_co_uk'
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export function normalizeEmailForSheetName(email: string): string {
  return email.toLowerCase().replace(/@/g, '_at_').replace(/\./g, '_');
}

/**
 * Generate user sheet name from email
 * @description Creates a user sheet name by prefixing normalized email with "user_"
 * 
 * @param {string} email - The user's email address
 * @returns {string} User sheet name (e.g., "user_adnresilva_at_gmail_com")
 * 
 * @example
 * generateUserSheetName('adnresilva@gmail.com')
 * // Returns: 'user_adnresilva_at_gmail_com'
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export function generateUserSheetName(email: string): string {
  const normalizedEmail = normalizeEmailForSheetName(email);
  return `user_${normalizedEmail}`;
}

