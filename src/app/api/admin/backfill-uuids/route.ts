
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { getAllInfoDataUsers } from '@/lib/googleSheets/infoData';
import { getSheetsAPI } from '@/lib/googleSheets/auth';
import { generateUserSheetName } from '@/lib/googleSheets/utils';
import { ACCOUNT_DATA_SHEET_ID } from '@/lib/googleSheets/config';

// 60 seconds timeout - this might be long
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const backfillHandler = new BaseRouteHandler()
    .handle(async (context) => {
        // Authenticate - for now assume admin or just temporary open route as requested
        // TOOD: Add admin check if needed later.

        const logs: string[] = [];
        const users = await getAllInfoDataUsers();
        logs.push(`Found ${users.length} users in InfoData.`);

        const sheets = await getSheetsAPI();

        for (const user of users) {
            try {
                if (!user.uuid) {
                    logs.push(`Skipping ${user.email}: No UUID in parsed InfoData (unexpected).`);
                    continue;
                }

                const sheetName = generateUserSheetName(user.email);

                // Read the first row to check headers
                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                    range: `${sheetName}!A2:Z2`, // Row 2 is typically the header-like row for data in vertical format? 
                    // Wait, usually Headers are A1.. but in these user sheets, row 2 is the data row.
                    // The request says "F1: UUID". This implies Row 1 is header?
                    // Let's check the images/links provided.
                    // New user: https://docs.google.com/spreadsheets/d/11Z4m5MKXFxb4TgRdUpO9diZncI1NdOkFwxWkr501H40/edit?gid=600521747#gid=600521747
                    // A1: Name, B1: Surname, C1: Email... F1: UUID, G1: Training Credit...
                    // Old user: A1: Name... E1: Birth, F1: Training Credit (Missing UUID at F)
                });

                const headerResponse = await sheets.spreadsheets.values.get({
                    spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                    range: `${sheetName}!A1:H1`,
                });

                const headers = headerResponse.data.values?.[0] || [];
                const colF = headers[5]; // Index 5
                const colG = headers[6]; // Index 6

                const cleanColF = colF?.toString().trim().toUpperCase() || '';

                if (cleanColF.includes('UUID')) {
                    // Already has UUID column
                    // Just update the value to be sure
                    await sheets.spreadsheets.values.update({
                        spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                        range: `${sheetName}!F2`,
                        valueInputOption: 'RAW',
                        requestBody: { values: [[user.uuid]] }
                    });
                    logs.push(`[OK] ${user.email}: UUID column exists. Updated F2.`);
                } else if (cleanColF.includes('TRAINING') || cleanColF.includes('CREDIT') || !cleanColF) {
                    // Case: F1 is likely "Training Credit" -> Insert Column at F
                    logs.push(`[UPDATE] ${user.email}: F1 is "${colF}". Inserting UUID column at F.`);

                    // Insert Dimension (Column) at Index 5
                    const sheetIdResponse = await sheets.spreadsheets.get({
                        spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                        ranges: [sheetName],
                    });
                    const sheetId = sheetIdResponse.data.sheets?.[0]?.properties?.sheetId;

                    if (sheetId === undefined || sheetId === null) {
                        logs.push(`[ERROR] ${user.email}: Could not find sheetId.`);
                        continue;
                    }

                    await sheets.spreadsheets.batchUpdate({
                        spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                        requestBody: {
                            requests: [
                                {
                                    insertDimension: {
                                        range: {
                                            sheetId: sheetId,
                                            dimension: 'COLUMNS',
                                            startIndex: 5,
                                            endIndex: 6
                                        },
                                        inheritFromBefore: true
                                    }
                                }
                            ]
                        }
                    });

                    // Write Header "UUID" at F1 and Value at F2
                    await sheets.spreadsheets.values.update({
                        spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                        range: `${sheetName}!F1:F2`,
                        valueInputOption: 'RAW',
                        requestBody: {
                            values: [
                                ['UUID'],
                                [user.uuid]
                            ]
                        }
                    });

                    logs.push(`[SUCCESS] ${user.email}: Inserted UUID column and value.`);

                } else {
                    logs.push(`[WARN] ${user.email}: F1 is "${colF}". Unknown format. Skipping.`);
                }

                // Rate limit slightly to avoid quota issues
                await new Promise(r => setTimeout(r, 500));

            } catch (err: any) {
                logs.push(`[ERROR] ${user.email}: ${err.message}`);
            }
        }

        return ApiResponse.success({ logs });
    });

export const GET = backfillHandler.toNextHandler();
