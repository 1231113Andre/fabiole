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

/**
 * Calculate age from birth date string (supports DD/MM/YYYY, DD.MM.YYYY, YYYY-MM-DD)
 * @param {string} birthDate - The birth date string
 * @returns {string} Calculated age or empty string if invalid
 */
export function calculateAge(birthDate: string): string {
  if (!birthDate) return '';
  try {
    const parts = birthDate.trim().split(/[./-]/);
    if (parts.length !== 3) return '';

    let day, month, year;
    // Check if first part is Year (YYYY)
    if (parts[0].length === 4) {
      // Format: YYYY-MM-DD
      year = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1; // Month is 0-indexed
      day = parseInt(parts[2]);
    } else {
      // Format: DD/MM/YYYY or DD.MM.YYYY
      day = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;
      year = parseInt(parts[2]);
    }

    const birth = new Date(year, month, day);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age.toString();
  } catch (e) {
    console.error('Error calculating age:', e);
    return '';
  }
}

