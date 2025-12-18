/**
 * @fileoverview References Sheet Manager - Main entry point
 * @author Personal Trainer Platform Team
 * @description Manages the global references_data sheet with fitness metrics.
 *              Automatically creates the sheet if it doesn't exist.
 * @since 1.0.0
 */

import { google, sheets_v4 } from 'googleapis';
import { getAuthClient } from '../auth';
import { ACCOUNT_DATA_SHEET_ID } from '../config';
import { buildSheetData } from './builder';
import { COLORS } from './colors';
import {
    sectionTitleFormat,
    columnHeaderFormat,
    dataRowFormat,
    mergeCellsRequest,
    rowHeightRequest,
    columnWidthRequest,
} from './formatting';

const REFERENCES_SHEET_NAME = 'references_data';

/**
 * References Sheet Manager Class
 * Handles creation, checking, and management of the references_data sheet.
 */
export class ReferencesSheetManager {
    private sheets: sheets_v4.Sheets | null = null;

    /**
     * Initialize the Sheets API client
     */
    private async getSheets(): Promise<sheets_v4.Sheets> {
        if (!this.sheets) {
            const auth = await getAuthClient();
            this.sheets = google.sheets({ version: 'v4', auth });
        }
        return this.sheets;
    }

    /**
     * Check if references_data sheet exists
     */
    async exists(): Promise<{ exists: boolean; sheetId?: number }> {
        try {
            const sheets = await this.getSheets();
            const spreadsheet = await sheets.spreadsheets.get({
                spreadsheetId: ACCOUNT_DATA_SHEET_ID,
            });

            const refSheet = spreadsheet.data.sheets?.find(
                (sheet) => sheet.properties?.title === REFERENCES_SHEET_NAME
            );

            const sheetId = refSheet?.properties?.sheetId;
            if (sheetId != null) {
                return { exists: true, sheetId };
            }
            return { exists: false };
        } catch (error) {
            console.error('❌ [ReferencesSheet] Error checking sheet:', error);
            return { exists: false };
        }
    }

    /**
     * Delete the references_data sheet
     */
    async delete(sheetId: number): Promise<void> {
        const sheets = await this.getSheets();
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: ACCOUNT_DATA_SHEET_ID,
            requestBody: {
                requests: [{ deleteSheet: { sheetId } }],
            },
        });
        console.log(`🗑️ [ReferencesSheet] Deleted sheet`);
    }

    /**
     * Create the sheet structure
     */
    private async createSheet(): Promise<number> {
        console.log(`📋 [ReferencesSheet] Creating new sheet: ${REFERENCES_SHEET_NAME}`);
        const sheets = await this.getSheets();

        const response = await sheets.spreadsheets.batchUpdate({
            spreadsheetId: ACCOUNT_DATA_SHEET_ID,
            requestBody: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: REFERENCES_SHEET_NAME,
                                gridProperties: {
                                    rowCount: 80,
                                    columnCount: 12,
                                },
                            },
                        },
                    },
                ],
            },
        });

        const sheetId = response.data.replies?.[0]?.addSheet?.properties?.sheetId;
        if (sheetId == null) {
            throw new Error('Failed to create references_data sheet');
        }

        console.log(`✅ [ReferencesSheet] Sheet created with ID: ${sheetId}`);
        return sheetId;
    }

    /**
     * Write data to the sheet
     */
    private async writeData(): Promise<void> {
        const sheets = await this.getSheets();
        const data = buildSheetData();

        console.log(`📝 [ReferencesSheet] Writing ${data.length} rows...`);
        await sheets.spreadsheets.values.update({
            spreadsheetId: ACCOUNT_DATA_SHEET_ID,
            range: `${REFERENCES_SHEET_NAME}!A1`,
            valueInputOption: 'RAW',
            requestBody: { values: data },
        });
    }

    /**
     * Build all formatting requests
     */
    private buildFormattingRequests(sheetId: number): any[] {
        const requests: any[] = [];

        // ============================================
        // LEFT SIDE FORMATTING (Massa Gorda + IMC)
        // ============================================

        // Massa Gorda Masculino (rows 1, 3, 4-8) - BLUE
        requests.push(sectionTitleFormat(sheetId, 0, 0, 3, 'blue'));
        requests.push(columnHeaderFormat(sheetId, 2, 0, 3, 'blue'));
        for (let i = 3; i < 8; i++) {
            requests.push(dataRowFormat(sheetId, i, 0, 3, i % 2 === 1 ? COLORS.lightBlue : COLORS.white));
        }

        // Massa Gorda Feminino (rows 11, 13, 14-18) - PINK
        requests.push(sectionTitleFormat(sheetId, 10, 0, 3, 'pink'));
        requests.push(columnHeaderFormat(sheetId, 12, 0, 3, 'pink'));
        for (let i = 13; i < 18; i++) {
            requests.push(dataRowFormat(sheetId, i, 0, 3, i % 2 === 1 ? COLORS.lightPink : COLORS.white));
        }

        // IMC (rows 21, 23, 24-29) - ORANGE
        requests.push(sectionTitleFormat(sheetId, 20, 0, 2, 'orange'));
        requests.push(columnHeaderFormat(sheetId, 22, 0, 2, 'orange'));
        for (let i = 23; i < 29; i++) {
            requests.push(dataRowFormat(sheetId, i, 0, 2, i % 2 === 1 ? COLORS.lightOrange : COLORS.white));
        }

        // ============================================
        // RIGHT SIDE FORMATTING
        // ============================================

        // Flexões Feminino (rows 1, 3, 4-8) - PINK
        requests.push(sectionTitleFormat(sheetId, 0, 5, 11, 'pink'));
        requests.push(columnHeaderFormat(sheetId, 2, 5, 11, 'pink'));
        for (let i = 3; i < 8; i++) {
            requests.push(dataRowFormat(sheetId, i, 5, 11, i % 2 === 1 ? COLORS.lightPink : COLORS.white));
        }

        // Flexões Masculino (rows 11, 13, 14-18) - BLUE
        requests.push(sectionTitleFormat(sheetId, 10, 5, 11, 'blue'));
        requests.push(columnHeaderFormat(sheetId, 12, 5, 11, 'blue'));
        for (let i = 13; i < 18; i++) {
            requests.push(dataRowFormat(sheetId, i, 5, 11, i % 2 === 1 ? COLORS.lightBlue : COLORS.white));
        }

        // Abdominais Feminino (rows 21, 23, 24-28) - PINK
        requests.push(sectionTitleFormat(sheetId, 20, 5, 11, 'pink'));
        requests.push(columnHeaderFormat(sheetId, 22, 5, 11, 'pink'));
        for (let i = 23; i < 28; i++) {
            requests.push(dataRowFormat(sheetId, i, 5, 11, i % 2 === 1 ? COLORS.lightPink : COLORS.white));
        }

        // Abdominais Masculino (rows 32, 34, 35-39) - BLUE
        requests.push(sectionTitleFormat(sheetId, 31, 5, 11, 'blue'));
        requests.push(columnHeaderFormat(sheetId, 33, 5, 11, 'blue'));
        for (let i = 34; i < 39; i++) {
            requests.push(dataRowFormat(sheetId, i, 5, 11, i % 2 === 0 ? COLORS.lightBlue : COLORS.white));
        }

        // Milha Feminino (rows 42, 44, 45-49) - PINK
        requests.push(sectionTitleFormat(sheetId, 41, 5, 11, 'pink'));
        requests.push(columnHeaderFormat(sheetId, 43, 5, 11, 'pink'));
        for (let i = 44; i < 49; i++) {
            requests.push(dataRowFormat(sheetId, i, 5, 11, i % 2 === 0 ? COLORS.lightPink : COLORS.white));
        }

        // Milha Masculino (rows 52, 54, 55-59) - BLUE
        requests.push(sectionTitleFormat(sheetId, 51, 5, 11, 'blue'));
        requests.push(columnHeaderFormat(sheetId, 53, 5, 11, 'blue'));
        for (let i = 54; i < 59; i++) {
            requests.push(dataRowFormat(sheetId, i, 5, 11, i % 2 === 0 ? COLORS.lightBlue : COLORS.white));
        }

        // ============================================
        // DIMENSIONS
        // ============================================

        // Section title row heights
        const sectionTitleRows = [0, 10, 20, 31, 41, 51];
        for (const row of sectionTitleRows) {
            requests.push(rowHeightRequest(sheetId, row, 30));
        }

        // Column widths
        requests.push(columnWidthRequest(sheetId, 0, 1, 200));   // Categoria
        requests.push(columnWidthRequest(sheetId, 1, 2, 100));   // Percentagem
        requests.push(columnWidthRequest(sheetId, 2, 3, 280));   // Descrição
        requests.push(columnWidthRequest(sheetId, 3, 5, 20));    // Separator
        requests.push(columnWidthRequest(sheetId, 5, 11, 100));  // Performance cols

        // ============================================
        // MERGE CELLS
        // ============================================

        // Left side merges
        requests.push(mergeCellsRequest(sheetId, 0, 0, 3));   // Massa Gorda M
        requests.push(mergeCellsRequest(sheetId, 10, 0, 3));  // Massa Gorda F
        requests.push(mergeCellsRequest(sheetId, 20, 0, 2));  // IMC

        // Right side merges
        requests.push(mergeCellsRequest(sheetId, 0, 5, 11));  // Flexões F
        requests.push(mergeCellsRequest(sheetId, 10, 5, 11)); // Flexões M
        requests.push(mergeCellsRequest(sheetId, 20, 5, 11)); // Abdominais F
        requests.push(mergeCellsRequest(sheetId, 31, 5, 11)); // Abdominais M
        requests.push(mergeCellsRequest(sheetId, 41, 5, 11)); // Milha F
        requests.push(mergeCellsRequest(sheetId, 51, 5, 11)); // Milha M

        // Spacer row heights
        const separatorRows = [8, 9, 18, 19, 29, 30, 39, 40, 49, 50];
        for (const row of separatorRows) {
            requests.push(rowHeightRequest(sheetId, row, 25));
        }

        return requests;
    }

    /**
     * Apply formatting to the sheet
     */
    private async applyFormatting(sheetId: number): Promise<void> {
        const sheets = await this.getSheets();
        const requests = this.buildFormattingRequests(sheetId);

        console.log(`🎨 [ReferencesSheet] Applying ${requests.length} formatting requests...`);
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: ACCOUNT_DATA_SHEET_ID,
            requestBody: { requests },
        });
    }

    /**
     * Ensure the references sheet exists (creates if missing)
     * This is the main method to call on app startup or user login.
     */
    async ensureExists(): Promise<void> {
        try {
            console.log(`📋 [ReferencesSheet] Ensuring references_data sheet exists...`);

            const { exists } = await this.exists();

            if (exists) {
                console.log(`✅ [ReferencesSheet] Sheet already exists, skipping creation`);
                return;
            }

            // Create and populate
            const sheetId = await this.createSheet();
            await this.writeData();
            await this.applyFormatting(sheetId);

            console.log(`✅ [ReferencesSheet] Sheet created and formatted!`);
        } catch (error) {
            console.error('❌ [ReferencesSheet] Error:', error);
            throw error;
        }
    }

    /**
     * Force regenerate the sheet (delete and recreate)
     */
    async regenerate(): Promise<void> {
        console.log(`🔄 [ReferencesSheet] Force regenerating sheet...`);

        const { exists, sheetId } = await this.exists();

        if (exists && sheetId !== undefined) {
            await this.delete(sheetId);
        }

        const newSheetId = await this.createSheet();
        await this.writeData();
        await this.applyFormatting(newSheetId);

        console.log(`✅ [ReferencesSheet] Sheet regenerated!`);
    }
}

// Singleton instance
let managerInstance: ReferencesSheetManager | null = null;

/**
 * Get the singleton ReferencesSheetManager instance
 */
export function getReferencesSheetManager(): ReferencesSheetManager {
    if (!managerInstance) {
        managerInstance = new ReferencesSheetManager();
    }
    return managerInstance;
}

/**
 * Convenience function: Ensure references sheet exists
 * Call this on app startup or user login.
 */
export async function ensureReferencesSheetExists(): Promise<void> {
    const manager = getReferencesSheetManager();
    await manager.ensureExists();
}

/**
 * Convenience function: Force regenerate the sheet
 * Used by admin API endpoint.
 */
export async function regenerateReferencesSheet(): Promise<void> {
    const manager = getReferencesSheetManager();
    await manager.regenerate();
}

// Re-export types and data for external use
export * from './types';
export * from './data';
export * from './colors';
