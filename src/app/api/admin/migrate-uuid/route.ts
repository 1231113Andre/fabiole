import { NextRequest, NextResponse } from 'next/server';
import { generateMissingUUIDs } from '@/lib/googleSheets/migration/generateMissingUUIDs';

/**
 * POST /api/admin/migrate-uuid
 * 
 * Generates UUIDs for all existing users who don't have one.
 * This is a one-time migration endpoint.
 * 
 * Note: In production, this should be protected with admin authentication.
 */
export async function POST(request: NextRequest) {
    try {
        console.log('🔄 [UUID Migration] Starting migration...');

        const result = await generateMissingUUIDs();

        console.log(`✅ [UUID Migration] Complete: ${result.updated} updated, ${result.skipped} skipped`);

        return NextResponse.json({
            success: true,
            message: `Migration complete: ${result.updated} users updated, ${result.skipped} users skipped (already had UUID)`,
            data: result,
        });
    } catch (error) {
        console.error('❌ [UUID Migration] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Erro durante migração' },
            { status: 500 }
        );
    }
}
