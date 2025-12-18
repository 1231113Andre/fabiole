/**
 * @fileoverview Sheet data builder - constructs the 2D array for the sheet
 * @description Builds the complete data array from individual table data.
 */

import {
    MASSA_GORDA_MASCULINO,
    MASSA_GORDA_FEMININO,
    IMC_DATA,
    FLEXOES_FEMININO,
    FLEXOES_MASCULINO,
    ABDOMINAIS_FEMININO,
    ABDOMINAIS_MASCULINO,
    MILHA_FEMININO,
    MILHA_MASCULINO,
} from './data';

/**
 * Build the complete sheet data array
 * Layout:
 * - Left side (columns A-C): Massa Gorda M/F, IMC
 * - Right side (columns F-K): Flexões, Abdominais, Milha (M/F)
 */
export function buildSheetData(): string[][] {
    const rows: string[][] = [];
    const EMPTY = ['', '', '', '', '', '', '', '', '', '', '', ''];

    // ============================================
    // SECTION 1: Massa Gorda + Flexões
    // ============================================

    // Row 1: Section titles
    rows.push([MASSA_GORDA_MASCULINO.title, '', '', '', '', FLEXOES_FEMININO.title, '', '', '', '', '', '']);
    rows.push([...EMPTY]); // Spacer

    // Row 3: Headers
    rows.push([...MASSA_GORDA_MASCULINO.headers, '', '', ...FLEXOES_FEMININO.headers, '']);

    // Data rows
    for (let i = 0; i < 5; i++) {
        const left = MASSA_GORDA_MASCULINO.rows[i] || ['', '', ''];
        const right = FLEXOES_FEMININO.rows[i] || ['', '', '', '', '', ''];
        rows.push([...left, '', '', ...right, '']);
    }

    rows.push([...EMPTY]); // Spacer
    rows.push([...EMPTY]); // Spacer

    // ============================================
    // SECTION 2: Massa Gorda F + Flexões M
    // ============================================

    rows.push([MASSA_GORDA_FEMININO.title, '', '', '', '', FLEXOES_MASCULINO.title, '', '', '', '', '', '']);
    rows.push([...EMPTY]); // Spacer

    rows.push([...MASSA_GORDA_FEMININO.headers, '', '', ...FLEXOES_MASCULINO.headers, '']);

    for (let i = 0; i < 5; i++) {
        const left = MASSA_GORDA_FEMININO.rows[i] || ['', '', ''];
        const right = FLEXOES_MASCULINO.rows[i] || ['', '', '', '', '', ''];
        rows.push([...left, '', '', ...right, '']);
    }

    rows.push([...EMPTY]); // Spacer
    rows.push([...EMPTY]); // Spacer

    // ============================================
    // SECTION 3: IMC + Abdominais F
    // ============================================

    rows.push([IMC_DATA.title, '', '', '', '', ABDOMINAIS_FEMININO.title, '', '', '', '', '', '']);
    rows.push([...EMPTY]); // Spacer

    rows.push([...IMC_DATA.headers, '', '', '', ...ABDOMINAIS_FEMININO.headers, '']);

    for (let i = 0; i < 6; i++) {
        const left = IMC_DATA.rows[i] || ['', ''];
        const right = ABDOMINAIS_FEMININO.rows[i] || ['', '', '', '', '', ''];
        rows.push([...left, '', '', '', ...right, '']);
    }

    rows.push([...EMPTY]); // Spacer
    rows.push([...EMPTY]); // Spacer

    // ============================================
    // SECTION 4: Abdominais M (right only)
    // ============================================

    rows.push(['', '', '', '', '', ABDOMINAIS_MASCULINO.title, '', '', '', '', '', '']);
    rows.push([...EMPTY]); // Spacer

    rows.push(['', '', '', '', '', ...ABDOMINAIS_MASCULINO.headers, '']);

    for (const row of ABDOMINAIS_MASCULINO.rows) {
        rows.push(['', '', '', '', '', ...row, '']);
    }

    rows.push([...EMPTY]); // Spacer
    rows.push([...EMPTY]); // Spacer

    // ============================================
    // SECTION 5: Milha F (right only)
    // ============================================

    rows.push(['', '', '', '', '', MILHA_FEMININO.title, '', '', '', '', '', '']);
    rows.push([...EMPTY]); // Spacer

    rows.push(['', '', '', '', '', ...MILHA_FEMININO.headers, '']);

    for (const row of MILHA_FEMININO.rows) {
        rows.push(['', '', '', '', '', ...row, '']);
    }

    rows.push([...EMPTY]); // Spacer
    rows.push([...EMPTY]); // Spacer

    // ============================================
    // SECTION 6: Milha M (right only)
    // ============================================

    rows.push(['', '', '', '', '', MILHA_MASCULINO.title, '', '', '', '', '', '']);
    rows.push([...EMPTY]); // Spacer

    rows.push(['', '', '', '', '', ...MILHA_MASCULINO.headers, '']);

    for (const row of MILHA_MASCULINO.rows) {
        rows.push(['', '', '', '', '', ...row, '']);
    }

    return rows;
}
