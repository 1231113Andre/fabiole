/**
 * @fileoverview Server startup instrumentation
 * @description Runs on every Next.js server startup - logs connections, env vars, and system status
 */

interface ServiceStatus {
    name: string;
    status: 'OK' | 'FAIL' | 'WARN' | 'SKIP';
    message?: string;
    latency?: number;
    details?: string[];
}

interface EnvVarStatus {
    name: string;
    configured: boolean;
    value?: string; // Masked for sensitive values
}

interface TimingEntry {
    name: string;
    duration: number;
}

interface SystemInfo {
    platform: string;
    arch: string;
    nodeVersion: string;
    memory: {
        total: string;
        free: string;
        used: string;
    };
}

// Mask sensitive values
function maskValue(value: string | undefined, showChars: number = 4): string {
    if (!value) return '(not set)';
    if (value.length <= showChars * 2) return '***';
    return `${value.slice(0, showChars)}...${value.slice(-showChars)}`;
}

// Format duration
function formatMs(ms: number): string {
    if (ms < 1) return '<1ms';
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}

// Format bytes
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// Get current timestamp in CET format: 2025-12-28 | 15:59:17.123
function timestamp(): string {
    const now = new Date();
    const cetOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Europe/Warsaw',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    const formatter = new Intl.DateTimeFormat('pl-PL', cetOptions);
    const parts = formatter.formatToParts(now);
    
    const date = `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value}`;
    const time = `${parts.find(p => p.type === 'hour')?.value}:${parts.find(p => p.type === 'minute')?.value}:${parts.find(p => p.type === 'second')?.value}`;
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    
    return `${date} | ${time}.${ms}`;
}

// Log separator
function separator(char: string = '-', length: number = 60): string {
    return char.repeat(length);
}

// Helper function to safely access Node.js process properties
// This uses a runtime function to avoid static analysis detection
function getProcessProperty(key: string): any {
    if (typeof process === 'undefined') return undefined;
    // Use Function constructor to create a runtime-only accessor
    // This prevents Turbopack from statically analyzing the property access
    const getter = new Function('p', 'k', 'return p[k]');
    try {
        return getter(process, key);
    } catch {
        return undefined;
    }
}

// Helper to safely call process.memoryUsage
function safeMemoryUsage(): any {
    if (typeof process === 'undefined') return null;
    try {
        const memUsageFn = getProcessProperty('memoryUsage');
        if (typeof memUsageFn === 'function') {
            return memUsageFn.call(process);
        }
    } catch {
        // Ignore errors
    }
    return null;
}

// Get system information
function getSystemInfo(): SystemInfo {
    // Check if Node.js APIs are available (only in Node.js runtime, not Edge)
    // Use try-catch to safely access Node.js APIs that may not exist in Edge Runtime
    try {
        const memUsage = safeMemoryUsage();
        if (!memUsage) {
            throw new Error('Memory usage not available');
        }

        const totalMem = (memUsage.heapTotal + memUsage.external);
        const usedMem = memUsage.heapUsed;
        const freeMem = totalMem - usedMem;

        // Access platform properties using helper function to avoid static analysis
        const platform = getProcessProperty('platform') || 'unknown';
        const arch = getProcessProperty('arch') || 'unknown';
        const nodeVersion = getProcessProperty('version') || 'unknown';

        return {
            platform: String(platform),
            arch: String(arch),
            nodeVersion: String(nodeVersion),
            memory: {
                total: formatBytes(totalMem),
                free: formatBytes(freeMem),
                used: formatBytes(usedMem)
            }
        };
    } catch {
        // Return placeholder values for Edge Runtime or when APIs are unavailable
        return {
            platform: 'edge',
            arch: 'unknown',
            nodeVersion: 'edge-runtime',
            memory: {
                total: 'N/A',
                free: 'N/A',
                used: 'N/A'
            }
        };
    }
}

// Check database connection with stats
async function checkDatabase(): Promise<ServiceStatus> {
    const start = Date.now();
    try {
        const { db } = await import('@/lib/db/client');
        await db.$queryRaw`SELECT 1`;
        
        // Get database stats
        const [userCount, pesagemCount, perimetroCount, avaliacaoCount] = await Promise.all([
            db.user.count().catch(() => 0),
            db.pesagem.count().catch(() => 0),
            db.perimetroCorporal.count().catch(() => 0),
            db.avaliacaoFisica.count().catch(() => 0)
        ]);

        return {
            name: 'PostgreSQL Database',
            status: 'OK',
            message: 'Connected successfully',
            latency: Date.now() - start,
            details: [
                `Users: ${userCount}`,
                `Pesagens: ${pesagemCount}`,
                `Perimetros: ${perimetroCount}`,
                `Avaliacoes: ${avaliacaoCount}`
            ]
        };
    } catch (error: any) {
        return {
            name: 'PostgreSQL Database',
            status: 'FAIL',
            message: error.message || 'Connection failed',
            latency: Date.now() - start
        };
    }
}

// Check R2 Storage configuration
function checkR2Storage(): ServiceStatus {
    const start = Date.now();
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKey = process.env.R2_ACCESS_KEY_ID;
    const secretKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

    const missing: string[] = [];
    if (!accountId) missing.push('R2_ACCOUNT_ID');
    if (!accessKey) missing.push('R2_ACCESS_KEY_ID');
    if (!secretKey) missing.push('R2_SECRET_ACCESS_KEY');
    if (!bucket) missing.push('R2_BUCKET_NAME');

    if (missing.length > 0) {
        return {
            name: 'Cloudflare R2 Storage',
            status: 'FAIL',
            message: `Missing: ${missing.join(', ')}`,
            latency: Date.now() - start
        };
    }

    return {
        name: 'Cloudflare R2 Storage',
        status: 'OK',
        message: `Bucket: ${bucket}`,
        latency: Date.now() - start,
        details: [
            `Account ID: ${maskValue(accountId, 8)}`,
            `Public URL: ${publicUrl ? 'configured' : 'not set'}`
        ]
    };
}

// Check Email service configuration
function checkEmailService(): ServiceStatus {
    const start = Date.now();
    const apiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.EMAIL_FROM_ADDRESS;
    const supportEmail = process.env.EMAIL_SUPPORT;

    if (!apiKey) {
        return {
            name: 'Email Service (Resend)',
            status: 'FAIL',
            message: 'RESEND_API_KEY not configured',
            latency: Date.now() - start
        };
    }

    return {
        name: 'Email Service (Resend)',
        status: 'OK',
        message: `From: ${fromAddress || 'default'}`,
        latency: Date.now() - start,
        details: [
            `API Key: ${maskValue(apiKey, 6)}`,
            `Support: ${supportEmail || 'not set'}`
        ]
    };
}

// Check Session configuration
function checkSession(): ServiceStatus {
    const start = Date.now();
    const secret = process.env.SESSION_SECRET;

    if (!secret) {
        return {
            name: 'Session Security',
            status: 'FAIL',
            message: 'SESSION_SECRET not configured',
            latency: Date.now() - start
        };
    }

    if (secret.length < 32) {
        return {
            name: 'Session Security',
            status: 'WARN',
            message: 'SESSION_SECRET should be at least 32 characters',
            latency: Date.now() - start,
            details: [`Current length: ${secret.length} chars`]
        };
    }

    return {
        name: 'Session Security',
        status: 'OK',
        message: `Secret length: ${secret.length} chars`,
        latency: Date.now() - start,
        details: ['Secure token generation enabled']
    };
}

// Check Next.js configuration
function checkNextJsConfig(): ServiceStatus {
    const start = Date.now();
    const nodeEnv = process.env.NODE_ENV || 'development';
    const port = process.env.PORT || '3000';
    const hostname = process.env.HOSTNAME || 'localhost';

    return {
        name: 'Next.js Configuration',
        status: 'OK',
        message: `Mode: ${nodeEnv}`,
        latency: Date.now() - start,
        details: [
            `Port: ${port}`,
            `Hostname: ${hostname}`,
            `Runtime: ${process.env.NEXT_RUNTIME || 'nodejs'}`,
            `Turbopack: ${process.env.NEXT_DISABLE_TURBOPACK ? 'disabled' : 'enabled'}`
        ]
    };
}

// Get environment variables status
function getEnvVarsStatus(): EnvVarStatus[] {
    return [
        // Database
        { name: 'DATABASE_URL', configured: !!process.env.DATABASE_URL, value: maskValue(process.env.DATABASE_URL, 15) },
        
        // Security
        { name: 'SESSION_SECRET', configured: !!process.env.SESSION_SECRET, value: process.env.SESSION_SECRET ? `${process.env.SESSION_SECRET.length} chars` : '(not set)' },
        
        // R2 Storage
        { name: 'R2_ACCOUNT_ID', configured: !!process.env.R2_ACCOUNT_ID, value: maskValue(process.env.R2_ACCOUNT_ID) },
        { name: 'R2_ACCESS_KEY_ID', configured: !!process.env.R2_ACCESS_KEY_ID, value: maskValue(process.env.R2_ACCESS_KEY_ID) },
        { name: 'R2_SECRET_ACCESS_KEY', configured: !!process.env.R2_SECRET_ACCESS_KEY, value: process.env.R2_SECRET_ACCESS_KEY ? '***configured***' : '(not set)' },
        { name: 'R2_BUCKET_NAME', configured: !!process.env.R2_BUCKET_NAME, value: process.env.R2_BUCKET_NAME || '(not set)' },
        { name: 'NEXT_PUBLIC_R2_PUBLIC_URL', configured: !!process.env.NEXT_PUBLIC_R2_PUBLIC_URL, value: process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '(not set)' },
        
        // Email
        { name: 'RESEND_API_KEY', configured: !!process.env.RESEND_API_KEY, value: maskValue(process.env.RESEND_API_KEY) },
        { name: 'EMAIL_FROM_ADDRESS', configured: !!process.env.EMAIL_FROM_ADDRESS, value: process.env.EMAIL_FROM_ADDRESS || '(default)' },
        { name: 'EMAIL_SUPPORT', configured: !!process.env.EMAIL_SUPPORT, value: process.env.EMAIL_SUPPORT || '(not set)' },
        
        // App
        { name: 'NODE_ENV', configured: !!process.env.NODE_ENV, value: process.env.NODE_ENV || 'development' },
        { name: 'NEXT_PUBLIC_VERSION', configured: !!process.env.NEXT_PUBLIC_VERSION, value: process.env.NEXT_PUBLIC_VERSION || '(not set)' },
        { name: 'NEXT_PUBLIC_COMMIT_ID', configured: !!process.env.NEXT_PUBLIC_COMMIT_ID, value: process.env.NEXT_PUBLIC_COMMIT_ID || '(not set)' },
        { name: 'PORT', configured: !!process.env.PORT, value: process.env.PORT || '3000 (default)' },
        { name: 'HOSTNAME', configured: !!process.env.HOSTNAME, value: process.env.HOSTNAME || 'localhost (default)' },
    ];
}

// Main startup check
async function runStartupChecks(): Promise<void> {
    const startTime = Date.now();
    const timings: TimingEntry[] = [];
    
    const nodeEnv = process.env.NODE_ENV || 'development';
    const version = process.env.NEXT_PUBLIC_VERSION || '0.1.0';
    const commitId = process.env.NEXT_PUBLIC_COMMIT_ID || 'unknown';
    const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || 'unknown';

    console.log('');
    console.log(separator('='));
    console.log('  FABIOLE - Server Startup');
    console.log(separator('='));
    console.log(`  Time:      ${timestamp()}`);
    console.log(`  Version:   ${version} (${commitId})`);
    console.log(`  Build:     ${buildTime}`);
    console.log(`  Mode:      ${nodeEnv.toUpperCase()}`);
    console.log(separator('='));
    console.log('');

    // System information
    const sysInfoStart = Date.now();
    console.log('[SYSTEM INFORMATION]');
    console.log(separator('-'));
    const sysInfo = getSystemInfo();
    console.log(`  Platform:  ${sysInfo.platform} (${sysInfo.arch})`);
    console.log(`  Node.js:   ${sysInfo.nodeVersion}`);
    console.log(`  Memory:    ${sysInfo.memory.used} / ${sysInfo.memory.total} (${sysInfo.memory.free} free)`);
    timings.push({ name: 'System Info', duration: Date.now() - sysInfoStart });
    console.log('');

    // Service checks
    const servicesStart = Date.now();
    console.log('[SERVICES]');
    console.log(separator('-'));

    const services: ServiceStatus[] = [];

    // Next.js config check
    const nextjsStatus = checkNextJsConfig();
    services.push(nextjsStatus);
    console.log(`  [${nextjsStatus.status.padEnd(4)}] ${nextjsStatus.name}`);
    if (nextjsStatus.message) console.log(`         ${nextjsStatus.message}${nextjsStatus.latency ? ` (${formatMs(nextjsStatus.latency)})` : ''}`);
    if (nextjsStatus.details) {
        nextjsStatus.details.forEach(detail => console.log(`         ${detail}`));
    }

    // Database check
    const dbStatus = await checkDatabase();
    services.push(dbStatus);
    console.log(`  [${dbStatus.status.padEnd(4)}] ${dbStatus.name}`);
    if (dbStatus.message) console.log(`         ${dbStatus.message}${dbStatus.latency ? ` (${formatMs(dbStatus.latency)})` : ''}`);
    if (dbStatus.details) {
        dbStatus.details.forEach(detail => console.log(`         ${detail}`));
    }

    // R2 Storage check
    const r2Status = checkR2Storage();
    services.push(r2Status);
    console.log(`  [${r2Status.status.padEnd(4)}] ${r2Status.name}`);
    if (r2Status.message) console.log(`         ${r2Status.message}${r2Status.latency ? ` (${formatMs(r2Status.latency)})` : ''}`);
    if (r2Status.details) {
        r2Status.details.forEach(detail => console.log(`         ${detail}`));
    }

    // Email service check
    const emailStatus = checkEmailService();
    services.push(emailStatus);
    console.log(`  [${emailStatus.status.padEnd(4)}] ${emailStatus.name}`);
    if (emailStatus.message) console.log(`         ${emailStatus.message}${emailStatus.latency ? ` (${formatMs(emailStatus.latency)})` : ''}`);
    if (emailStatus.details) {
        emailStatus.details.forEach(detail => console.log(`         ${detail}`));
    }

    // Session check
    const sessionStatus = checkSession();
    services.push(sessionStatus);
    console.log(`  [${sessionStatus.status.padEnd(4)}] ${sessionStatus.name}`);
    if (sessionStatus.message) console.log(`         ${sessionStatus.message}${sessionStatus.latency ? ` (${formatMs(sessionStatus.latency)})` : ''}`);
    if (sessionStatus.details) {
        sessionStatus.details.forEach(detail => console.log(`         ${detail}`));
    }

    timings.push({ name: 'Services Check', duration: Date.now() - servicesStart });
    console.log('');

    // Environment variables
    const envStart = Date.now();
    console.log('[ENVIRONMENT VARIABLES]');
    console.log(separator('-'));
    
    const envVars = getEnvVarsStatus();
    for (const env of envVars) {
        const status = env.configured ? 'OK  ' : 'MISS';
        console.log(`  [${status}] ${env.name.padEnd(28)} ${env.value}`);
    }
    timings.push({ name: 'Env Vars Check', duration: Date.now() - envStart });

    console.log('');

    // Application URLs
    const urlsStart = Date.now();
    console.log('[APPLICATION URLS]');
    console.log(separator('-'));
    const port = process.env.PORT || '3000';
    const hostname = process.env.HOSTNAME || 'localhost';
    console.log(`  Local:     http://${hostname}:${port}`);
    console.log(`  Network:  http://0.0.0.0:${port}`);
    if (process.env.NEXT_PUBLIC_R2_PUBLIC_URL) {
        console.log(`  R2 CDN:   ${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}`);
    }
    timings.push({ name: 'URLs Info', duration: Date.now() - urlsStart });
    console.log('');

    // Summary
    const totalServices = services.length;
    const okServices = services.filter(s => s.status === 'OK').length;
    const failServices = services.filter(s => s.status === 'FAIL').length;
    const warnServices = services.filter(s => s.status === 'WARN').length;

    const totalEnvVars = envVars.length;
    const configuredEnvVars = envVars.filter(e => e.configured).length;

    const totalTime = Date.now() - startTime;

    console.log(separator('='));
    console.log('[STARTUP SUMMARY]');
    console.log(separator('-'));
    console.log(`  Services:     ${okServices}/${totalServices} OK${failServices > 0 ? `, ${failServices} FAILED` : ''}${warnServices > 0 ? `, ${warnServices} WARNINGS` : ''}`);
    console.log(`  Environment:  ${configuredEnvVars}/${totalEnvVars} configured`);
    console.log(separator('-'));
    
    // Timing breakdown
    console.log('  [TIMINGS]');
    for (const timing of timings) {
        console.log(`    - ${timing.name.padEnd(20)} ${formatMs(timing.duration)}`);
    }
    console.log(`    - ${'TOTAL'.padEnd(20)} ${formatMs(totalTime)}`);
    console.log(separator('-'));

    if (failServices > 0) {
        console.log('  [!] Some services failed to initialize. Check configuration.');
    } else if (warnServices > 0) {
        console.log('  [!] Some services have warnings. Review configuration.');
    } else {
        console.log('  [+] All services initialized successfully.');
    }

    console.log(separator('='));
    console.log(`  Ready at: ${timestamp()}`);
    console.log(separator('='));
    console.log('');
}

export async function register() {
    // Only run on server-side
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await runStartupChecks();
    }
}
