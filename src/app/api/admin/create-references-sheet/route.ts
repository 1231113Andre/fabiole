/**
 * @fileoverview API endpoint to generate references_data sheet
 * @description Admin endpoint to create/regenerate the global references_data sheet.
 */

import { NextResponse } from 'next/server';
import { regenerateReferencesSheet, ensureReferencesSheetExists } from '@/lib/googleSheets';

// POST: Force regenerate the sheet
export async function POST() {
    try {
        console.log('🚀 [API] Regenerating references_data sheet...');
        await regenerateReferencesSheet();

        return NextResponse.json({
            success: true,
            message: 'references_data sheet regenerated successfully',
        });
    } catch (error) {
        console.error('❌ [API] Error regenerating references_data sheet:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// GET: Ensure sheet exists (creates if missing, does nothing if exists)
export async function GET() {
    try {
        console.log('📋 [API] Ensuring references_data sheet exists...');
        await ensureReferencesSheetExists();

        return NextResponse.json({
            success: true,
            message: 'references_data sheet is ready',
        });
    } catch (error) {
        console.error('❌ [API] Error ensuring references_data sheet:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
