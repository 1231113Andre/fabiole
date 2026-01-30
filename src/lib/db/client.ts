/**
 * @fileoverview Database client singleton
 * @description Prisma client with pg adapter for Prisma Postgres
 * 
 * IMPORTANT: Uses globalThis to ensure single instance across HMR
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, PoolConfig } from 'pg';

// Use Symbol to ensure unique key across HMR
const PRISMA_KEY = Symbol.for('app.prisma.client');
const POOL_KEY = Symbol.for('app.postgres.pool');

const globalStore = globalThis as unknown as {
    [PRISMA_KEY]?: PrismaClient;
    [POOL_KEY]?: Pool;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
}

// Determine if SSL is needed (most cloud providers require it)
const isProduction = process.env.NODE_ENV === 'production';
const requireSSL = connectionString.includes('sslmode=require') || 
                   connectionString.includes('ssl=true') ||
                   isProduction;

function getPool(): Pool {
    if (!globalStore[POOL_KEY]) {
        // Serverless (Vercel): 1 connection per instance to avoid exhausting DB connection limit.
        // Each serverless isolate has its own pool; many instances × large pool = P2037.
        const isServerless = typeof process.env.VERCEL !== 'undefined' || typeof process.env.AWS_LAMBDA_FUNCTION_NAME !== 'undefined';
        const maxConnections = isServerless ? 1 : (isProduction ? 10 : 5);
        const minConnections = isServerless ? 0 : (isProduction ? 2 : 1);

        const poolConfig: PoolConfig = {
            connectionString,
            max: maxConnections,
            min: minConnections,
            idleTimeoutMillis: 20000,
            connectionTimeoutMillis: 10000,
            allowExitOnIdle: isServerless,
        };

        // Add SSL configuration for production/cloud databases
        if (requireSSL) {
            poolConfig.ssl = {
                rejectUnauthorized: false, // Allow self-signed certificates
            };
        }

        globalStore[POOL_KEY] = new Pool(poolConfig);

        // Handle pool errors gracefully with better logging
        globalStore[POOL_KEY].on('error', (err) => {
            console.error('[DB Pool] Unexpected error on idle client:', err);
            // In production, you might want to send this to monitoring service
        });

        // Log pool connection events (only in development)
        if (!isProduction) {
            globalStore[POOL_KEY].on('connect', () => {
                console.log('[DB Pool] New client connected');
            });
        }
    }
    return globalStore[POOL_KEY];
}

function createPrismaClient(): PrismaClient {
    if (!globalStore[PRISMA_KEY]) {
        const pool = getPool();
        const adapter = new PrismaPg(pool);

        globalStore[PRISMA_KEY] = new PrismaClient({
            adapter,
            log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        });
    }
    return globalStore[PRISMA_KEY];
}

export const db = createPrismaClient();

/**
 * Graceful shutdown handler
 */
export async function disconnectDB(): Promise<void> {
    if (globalStore[PRISMA_KEY]) {
        await globalStore[PRISMA_KEY].$disconnect();
    }
    if (globalStore[POOL_KEY]) {
        await globalStore[POOL_KEY].end();
    }
}
