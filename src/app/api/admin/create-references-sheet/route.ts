/**
 * @fileoverview API endpoint to generate references_data sheet
 * @description Admin endpoint to create/regenerate the global references_data sheet.
 *              PROTECTED: Requires authentication and admin email verification.
 */

import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { requestIdMiddleware } from '@/lib/api/middleware/RequestIdMiddleware';
import { timeoutMiddleware } from '@/lib/api/middleware/TimeoutMiddleware';
import { authMiddleware } from '@/lib/api/middleware/AuthMiddleware';
import { regenerateReferencesSheet, ensureReferencesSheetExists } from '@/lib/googleSheets';

/**
 * Admin emails that are allowed to access this endpoint
 * In production, this should be loaded from environment variable or database
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

/**
 * Check if user is an admin
 */
function isAdmin(email: string): boolean {
    // If no admin emails configured, deny all (fail-secure)
    if (ADMIN_EMAILS.length === 0) {
        console.warn('⚠️ [Admin] No ADMIN_EMAILS configured - denying access');
        return false;
    }
    return ADMIN_EMAILS.includes(email.toLowerCase());
}

// POST: Force regenerate the sheet (admin only)
const postHandler = new BaseRouteHandler()
    .use(requestIdMiddleware)
    .use(timeoutMiddleware(60000))
    .use(authMiddleware({ required: true }))
    .handle(async (context) => {
        if (!context.user) {
            return ApiResponse.unauthorized('Authentication required');
        }

        if (!isAdmin(context.user.email)) {
            console.warn(`⚠️ [Admin] Unauthorized admin access attempt by: ${context.user.email}`);
            return ApiResponse.forbidden('Admin access required');
        }

        try {
            console.log(`🚀 [API] Regenerating references_data sheet (by admin: ${context.user.email})...`);
            await regenerateReferencesSheet();

            return ApiResponse.success({
                message: 'references_data sheet regenerated successfully',
            });
        } catch (error) {
            console.error('❌ [API] Error regenerating references_data sheet:', error);
            return ApiResponse.error(
                error instanceof Error ? error.message : 'Unknown error',
                500
            );
        }
    });

// GET: Ensure sheet exists (admin only)
const getHandler = new BaseRouteHandler()
    .use(requestIdMiddleware)
    .use(timeoutMiddleware(60000))
    .use(authMiddleware({ required: true }))
    .handle(async (context) => {
        if (!context.user) {
            return ApiResponse.unauthorized('Authentication required');
        }

        if (!isAdmin(context.user.email)) {
            console.warn(`⚠️ [Admin] Unauthorized admin access attempt by: ${context.user.email}`);
            return ApiResponse.forbidden('Admin access required');
        }

        try {
            console.log(`📋 [API] Ensuring references_data sheet exists (by admin: ${context.user.email})...`);
            await ensureReferencesSheetExists();

            return ApiResponse.success({
                message: 'references_data sheet is ready',
            });
        } catch (error) {
            console.error('❌ [API] Error ensuring references_data sheet:', error);
            return ApiResponse.error(
                error instanceof Error ? error.message : 'Unknown error',
                500
            );
        }
    });

export const POST = postHandler.toNextHandler();
export const GET = getHandler.toNextHandler();

// Handle CORS preflight requests
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
        },
    });
}
