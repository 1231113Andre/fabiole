import { db } from "@/lib/db/client";
import { getResendClient } from "@/lib/email/ResendClient";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Logger } from "@/lib/utils/logger";

// Default configuration values
export const DEFAULT_CONFIG = {
    rateLimitMax: 100,
    rateLimitWindow: 15, // minutes
    rateLimitMessage: "Too many requests. Please try again later.",
};

export class SettingsService {
    private static cachedEnv: Record<string, Record<string, string>> | null = null;

    /**
     * Get all dynamic system settings
     */
    static async getSettings() {
        try {
            // Fetch from DB
            const settings = await db.systemSetting.findMany({
                select: { key: true, value: true }
            });

            // Convert to object
            const config: Record<string, string | number> = {};
            settings.forEach(s => {
                // Try to parse numbers
                const num = Number(s.value);
                config[s.key] = isNaN(num) || s.value.trim() === '' ? s.value : num;
            });

            // Merge with defaults
            return { ...DEFAULT_CONFIG, ...config };
        } catch (error) {
            Logger.error('System', 'Initialization failure: Could not retrieve dynamic application configuration from PostgreSQL.', error);
            return DEFAULT_CONFIG;
        }
    }

    /**
     * Get safe environment variables (read-only)
     */
    static getSafeEnvVars() {
        // Simple cache in memory as these rarely change during runtime without restart in many hosting envs
        if (this.cachedEnv && process.env.NODE_ENV === 'production') {
            return this.cachedEnv;
        }

        const sections = {
            "Runtime": ["NODE_ENV", "NEXT_RUNTIME", "NEXT_PUBLIC_VERSION", "NEXT_PUBLIC_COMMIT_ID"],
            "Admin & Security": ["ADMIN_EMAILS", "SESSION_SECRET", "JWT_SECRET"],
            "Database": ["DATABASE_URL"],
            "Storage (R2)": ["R2_BUCKET_NAME", "NEXT_PUBLIC_R2_PUBLIC_URL", "R2_ACCOUNT_ID"],
            "Email System": ["EMAIL_FROM_ADDRESS", "EMAIL_FROM_NAME", "EMAIL_SUPPORT", "RESEND_API_KEY"],
            "Google Integration": ["GOOGLE_SHEET_ID", "GOOGLE_SHEET_NAME", "ACCOUNT_DATA_TEMPLATE", "TEMPLATE_USER_SHEET_NAME"],
            "CORS & Security": ["ALLOWED_ORIGINS", "CORS_ALLOWED_METHODS", "HSTS_MAX_AGE", "CSP_GOOGLE_APIS"],
            "Rate Limiting": ["RATE_LIMIT_AUTH_MAX", "RATE_LIMIT_API_MAX", "RATE_LIMIT_GENERAL_MAX"]
        };

        const envs: Record<string, Record<string, string>> = {};

        // Helper to mask secrets
        const mask = (val?: string) => {
            if (!val) return '(não definido)';
            if (val.length < 8) return '********';
            return `${val.substring(0, 4)}...${val.substring(val.length - 4)}`;
        };

        const isSecret = (key: string) =>
            key.includes('SECRET') ||
            key.includes('KEY') ||
            key.includes('PASSWORD') ||
            key.includes('TOKEN') ||
            (key.includes('URL') && (key.includes('postgres') || key.includes('resend')));

        Object.entries(sections).forEach(([section, keys]) => {
            envs[section] = {};
            keys.forEach(key => {
                const val = process.env[key];
                if (!val) {
                    envs[section][key] = '(não definido)';
                } else {
                    envs[section][key] = isSecret(key) ? mask(val) : val;
                }
            });
        });

        this.cachedEnv = envs;
        return envs;
    }

    /**
     * Check status of various system dependencies
     */
    static async getServiceStatus() {
        Logger.info('System', 'Initiating comprehensive health diagnostic for all integrated cloud services and local dependencies.');
        const status = {
            database: {
                online: false,
                message: 'Offline',
                icon: 'fa-database',
                description: 'A base de dados PostgreSQL está operacional e a responder a consultas. Todos os dados de utilizadores e métricas estão seguros.'
            },
            email: {
                online: false,
                message: 'Não Configurado',
                icon: 'fa-envelope',
                description: 'O serviço Resend está ligado e autorizado a enviar comunicações críticas, como códigos de acesso e notificações de sistema.'
            },
            storage: {
                online: false,
                message: 'Não Verificado',
                icon: 'fa-cloud',
                description: 'A ligação ao Cloudflare R2 foi validada. O sistema tem permissões para ler e escrever ficheiros de imagem e documentos.'
            },
            google: {
                online: false,
                message: 'Google Sheets Desativado',
                icon: 'fa-table',
                description: 'O motor de sincronização legado do Google Sheets foi substituído pela base de dados interna para maior performance e segurança.'
            }
        };

        // 1. Check Database (Actual query)
        try {
            await db.$queryRaw`SELECT 1`;
            status.database.online = true;
            status.database.message = 'Serviço de Base de Dados está Ativo';
        } catch (e) {
            status.database.message = 'Erro de Ligação à Base de Dados';
        }

        // 2. Check Email (Resend - Actual API call)
        try {
            if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('re_12345678')) {
                const resend = getResendClient();
                const { data, error } = await resend.domains.list();
                if (!error && data) {
                    status.email.online = true;
                    status.email.message = 'Serviço de Email (Resend) está Ativo';
                } else {
                    status.email.message = `Erro Resend: ${error?.message || 'Chave API Inválida'}`;
                }
            }
        } catch (e) {
            status.email.message = 'Falha crítica na ligação ao Resend';
        }

        // 3. Check Storage (R2 - Actual API call)
        try {
            if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID) {
                const command = new ListObjectsV2Command({
                    Bucket: R2_BUCKET_NAME,
                    MaxKeys: 1
                });
                await r2Client.send(command);
                status.storage.online = true;
                status.storage.message = 'Armazenamento de Avatares (R2) está Ativo';
            }
        } catch (e: any) {
            status.storage.message = `Erro Armazenamento: ${e.message || 'Erro de Ligação'}`;
        }

        return status;
    }

    /**
     * Update a setting
     */
    static async updateSetting(key: string, value: string | number) {
        await db.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: {
                key,
                value: String(value),
                description: 'Definição dinâmica atualizada via Painel de Admin'
            }
        });

        // Invalidate cache if important keys change (not applicable to env vars usually, but good practice)
        this.cachedEnv = null;
    }
}
