/**
 * @fileoverview Asset constants
 * @description Centralized asset paths. Cache is handled by Next.js Image optimization.
 * 
 * To force logo refresh after update:
 * 1. Rebuild the project (npm run build)
 * 2. Users do hard refresh (Ctrl+F5) to bypass browser cache
 */

// Asset paths
export const ASSETS = {
    logo: '/images/logo.png',
} as const;

// Helper to get asset path
export function getAssetPath(asset: keyof typeof ASSETS): string {
    return ASSETS[asset];
}

