/**
 * @fileoverview Formatting helper functions for references sheet
 * @description Creates Google Sheets API formatting requests for styles.
 */

import { COLORS } from './colors';
import { SheetColor } from './types';

/**
 * Create section title format request (main headers with emojis)
 */
export function sectionTitleFormat(
    sheetId: number,
    rowIndex: number,
    startCol: number,
    endCol: number,
    colorKey: 'blue' | 'pink' | 'orange'
) {
    const bgColor = COLORS[colorKey];
    return {
        repeatCell: {
            range: { sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: startCol, endColumnIndex: endCol },
            cell: {
                userEnteredFormat: {
                    backgroundColor: bgColor,
                    textFormat: { bold: true, fontSize: 12, foregroundColor: COLORS.white },
                    horizontalAlignment: 'CENTER',
                    verticalAlignment: 'MIDDLE',
                },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
        },
    };
}

/**
 * Create column header format request
 */
export function columnHeaderFormat(
    sheetId: number,
    rowIndex: number,
    startCol: number,
    endCol: number,
    colorKey: 'blue' | 'pink' | 'orange'
) {
    const bgColor = COLORS[colorKey];
    return {
        repeatCell: {
            range: { sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: startCol, endColumnIndex: endCol },
            cell: {
                userEnteredFormat: {
                    backgroundColor: bgColor,
                    textFormat: { bold: true, fontSize: 10, foregroundColor: COLORS.white },
                    horizontalAlignment: 'CENTER',
                    verticalAlignment: 'MIDDLE',
                },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
        },
    };
}

/**
 * Create data row format request
 */
export function dataRowFormat(
    sheetId: number,
    rowIndex: number,
    startCol: number,
    endCol: number,
    bgColor: SheetColor
) {
    return {
        repeatCell: {
            range: { sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: startCol, endColumnIndex: endCol },
            cell: {
                userEnteredFormat: {
                    backgroundColor: bgColor,
                    textFormat: { fontSize: 10 },
                    horizontalAlignment: 'CENTER',
                    verticalAlignment: 'MIDDLE',
                },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
        },
    };
}

/**
 * Create merge cells request
 */
export function mergeCellsRequest(
    sheetId: number,
    row: number,
    startCol: number,
    endCol: number
) {
    return {
        mergeCells: {
            range: { sheetId, startRowIndex: row, endRowIndex: row + 1, startColumnIndex: startCol, endColumnIndex: endCol },
            mergeType: 'MERGE_ALL',
        },
    };
}

/**
 * Create row height update request
 */
export function rowHeightRequest(sheetId: number, row: number, height: number) {
    return {
        updateDimensionProperties: {
            range: { sheetId, dimension: 'ROWS', startIndex: row, endIndex: row + 1 },
            properties: { pixelSize: height },
            fields: 'pixelSize',
        },
    };
}

/**
 * Create column width update request
 */
export function columnWidthRequest(sheetId: number, startCol: number, endCol: number, width: number) {
    return {
        updateDimensionProperties: {
            range: { sheetId, dimension: 'COLUMNS', startIndex: startCol, endIndex: endCol },
            properties: { pixelSize: width },
            fields: 'pixelSize',
        },
    };
}
