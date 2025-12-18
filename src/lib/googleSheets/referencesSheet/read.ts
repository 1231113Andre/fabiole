import { getSheetsAPI } from '../auth';
import { ACCOUNT_DATA_SHEET_ID } from '../config';
import { ReferenceTableData } from '../types';
import { apiCache, CacheKeys } from '../cache';

const REFERENCES_SHEET_NAME = 'references_data';
const REFERENCE_CACHE_TTL = 30 * 60 * 1000; // 30 minutes - reference data rarely changes

/**
 * Fetch and parse reference data from the global sheet
 * Uses aggressive caching since reference data is mostly static
 */
export async function fetchReferenceData(): Promise<ReferenceTableData> {
    // Check cache first - reference data rarely changes
    const cached = apiCache.get<ReferenceTableData>(CacheKeys.referenceTables());
    if (cached) {
        console.log('⚡ [ReferencesSheet] Using cached reference data');
        return cached;
    }

    console.log('📖 [ReferencesSheet] Fetching fresh data...');
    try {
        const sheets = await getSheetsAPI();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: ACCOUNT_DATA_SHEET_ID,
            range: `${REFERENCES_SHEET_NAME}!A1:L100`, // Read columns A-L, up to 100 rows
        });

        const rows = response.data.values || [];
        if (rows.length === 0) {
            console.warn('⚠️ [ReferencesSheet] Sheet is empty');
            return {};
        }

        const data = parseReferenceData(rows);

        // Cache with 30-minute TTL
        apiCache.set(CacheKeys.referenceTables(), data, REFERENCE_CACHE_TTL);
        console.log('✅ [ReferencesSheet] Data cached for 30 minutes');

        return data;
    } catch (error) {
        console.error('❌ [ReferencesSheet] Error fetching data:', error);
        return {};
    }
}

/**
 * Parse rows into ReferenceTableData structure
 */
function parseReferenceData(rows: any[][]): ReferenceTableData {
    const data: ReferenceTableData = {
        massaGordaMasculino: {},
        massaGordaFeminino: {},
        imc: { magreza: '', normal: '', sobrepeso: '', obesidade: '' }, // Placeholder, IMC is usually static in UI
        flexoesFeminino: {},
        flexoesMasculino: {},
        abdominaisFeminino: {},
        abdominaisMasculino: {},
        milhaFeminino: {},
        milhaMasculino: {},
    };

    // Helper to find all row indices where a column matches a keyword
    const findHeaderRows = (colIndex: number, keyword: string): number[] => {
        const indices: number[] = [];
        rows.forEach((row, index) => {
            const cell = row[colIndex] ? row[colIndex].toString().toLowerCase().trim() : '';
            if (cell.includes(keyword.toLowerCase())) {
                // console.log(`[ReferencesSheet] Found header "${keyword}" at row ${index}, col ${colIndex}`);
                indices.push(index);
            }
        });
        return indices;
    };

    console.log(`[ReferencesSheet] Parsing ${rows.length} rows of data...`);

    // --- PARSE AGE-BASED TABLES ---
    // Headers in Col 5 are "Idade"
    const ageTableHeaders = findHeaderRows(5, 'idade');
    console.log(`[ReferencesSheet] Found ${ageTableHeaders.length} "Idade" headers at rows: ${ageTableHeaders.join(', ')}`);

    const parseAgeTableFromHeader = (headerRow: number, startCol: number, tableName: string): Record<string, any> => {
        const tableData: Record<string, any> = {};
        if (headerRow === -1 || headerRow === undefined) {
            console.warn(`[ReferencesSheet] Missing header for ${tableName}`);
            return tableData;
        }

        // Data starts 1 row after header
        const firstDataRow = headerRow + 1;
        let count = 0;

        for (let i = firstDataRow; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row[startCol]) break; // Stop at empty line

            const age = row[startCol];

            tableData[age] = {
                mau: row[startCol + 1],  // Col 1 after age
                medio: row[startCol + 3], // Col 3 after age
                bom: row[startCol + 4],   // Col 4 after age
                excelente: row[startCol + 5] // Col 5 after age
            };
            count++;
        }
        console.log(`[ReferencesSheet] Parsed ${count} rows for ${tableName}`);
        return tableData;
    };

    if (ageTableHeaders.length >= 6) {
        data.flexoesFeminino = parseAgeTableFromHeader(ageTableHeaders[0], 5, 'flexoesFeminino');
        data.flexoesMasculino = parseAgeTableFromHeader(ageTableHeaders[1], 5, 'flexoesMasculino');
        data.abdominaisFeminino = parseAgeTableFromHeader(ageTableHeaders[2], 5, 'abdominaisFeminino');
        data.abdominaisMasculino = parseAgeTableFromHeader(ageTableHeaders[3], 5, 'abdominaisMasculino');
        data.milhaFeminino = parseAgeTableFromHeader(ageTableHeaders[4], 5, 'milhaFeminino');
        data.milhaMasculino = parseAgeTableFromHeader(ageTableHeaders[5], 5, 'milhaMasculino');
    } else {
        console.warn('⚠️ [ReferencesSheet] Found fewer "Idade" headers than expected:', ageTableHeaders.length);
    }


    // --- PARSE CATEGORICAL TABLES ---
    // Headers in Col 0 are "Categoria"
    const categoryHeaders = findHeaderRows(0, 'categoria');
    console.log(`[ReferencesSheet] Found ${categoryHeaders.length} "Categoria" headers at rows: ${categoryHeaders.join(', ')}`);

    const parseCategoryTableFromHeader = (headerRow: number, tableName: string): any => {
        const res: any = {};
        if (headerRow === -1 || headerRow === undefined) {
            console.warn(`[ReferencesSheet] Missing header for ${tableName}`);
            return res;
        }

        const firstDataRow = headerRow + 1;
        let count = 0;

        for (let i = firstDataRow; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row[0]) break; // Stop if Category is empty

            const category = row[0];
            res[category] = {
                percent: row[1],
                description: row[2]
            };
            count++;
        }
        console.log(`[ReferencesSheet] Parsed ${count} rows for ${tableName}`);
        return res;
    };

    if (categoryHeaders.length >= 3) {
        (data.massaGordaMasculino as any) = parseCategoryTableFromHeader(categoryHeaders[0], 'massaGordaMasculino');
        (data.massaGordaFeminino as any) = parseCategoryTableFromHeader(categoryHeaders[1], 'massaGordaFeminino');

        // Parse IMC if needed (it uses interval, but similar structure)
        // We are not using dynamic IMC data in the UI currently (it's hardcoded), but we could.
    } else {
        console.warn('⚠️ [ReferencesSheet] Found fewer "Categoria" headers than expected:', categoryHeaders.length);
    }

    return data;
}
