/**
 * Guard for dangerous scripts in src/scripts.
 * These scripts modify or delete data and must not run in production
 * unless ALLOW_DANGEROUS_SCRIPTS=1 is set (use with full awareness of risk).
 * Call ensureNotProduction() after loading env (e.g. after import 'dotenv/config'), before any DB operations.
 */
export function ensureNotProduction(): void {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DANGEROUS_SCRIPTS !== '1') {
        console.error(
            'This script is not allowed in production. Set ALLOW_DANGEROUS_SCRIPTS=1 to override (at your own risk).'
        );
        process.exit(1);
    }
}
