/**
 * @fileoverview Color constants for references sheet styling
 */

import { ColorPalette } from './types';

// Color constants (RGB 0-1 scale for Google Sheets API)
export const COLORS: ColorPalette = {
    // Headers - Darker, more vibrant
    blue: { red: 0.15, green: 0.35, blue: 0.6 },       // Masculino headers 🔵
    pink: { red: 0.7, green: 0.25, blue: 0.5 },        // Feminino headers 🩷
    orange: { red: 0.85, green: 0.45, blue: 0.1 },     // IMC headers 🟠
    white: { red: 1, green: 1, blue: 1 },
    darkGray: { red: 0.2, green: 0.2, blue: 0.2 },     // Section titles

    // Alternating rows - Softer pastels
    lightBlue: { red: 0.9, green: 0.95, blue: 1 },     // Masculino rows
    lightPink: { red: 1, green: 0.92, blue: 0.96 },    // Feminino rows
    lightOrange: { red: 1, green: 0.95, blue: 0.88 },  // IMC rows
};
