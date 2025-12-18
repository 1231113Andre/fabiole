/**
 * @fileoverview Type definitions for references sheet
 */

// RGB color type for Google Sheets API
export interface SheetColor {
    red: number;
    green: number;
    blue: number;
}

// Color palette for the references sheet
export interface ColorPalette {
    // Headers
    blue: SheetColor;
    pink: SheetColor;
    orange: SheetColor;
    white: SheetColor;
    darkGray: SheetColor;
    // Alternating rows
    lightBlue: SheetColor;
    lightPink: SheetColor;
    lightOrange: SheetColor;
}

// Table section definition
export interface TableSection {
    title: string;
    rowIndex: number;
    color: 'blue' | 'pink' | 'orange';
    columns: { start: number; end: number };
}

// Merge range definition
export interface MergeRange {
    row: number;
    startCol: number;
    endCol: number;
}
