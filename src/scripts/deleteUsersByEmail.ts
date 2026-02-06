import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { Logger } from '../lib/utils/logger';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const EMAILS_TO_DELETE = [
    'kamszotlol1@proton.me',
    'developerxawierstudio@gmail.com',
];

async function main() {
    Logger.info('System', 'User removal: Deleting accounts by email.');

    const allEmails = [...new Set([...EMAILS_TO_DELETE, ...EMAILS_TO_DELETE.map((e) => e.toLowerCase())])];
    const deleted = await db.user.deleteMany({
        where: { email: { in: allEmails } },
    });

    Logger.info('Database', `Removed ${deleted.count} account(s): ${EMAILS_TO_DELETE.join(', ')}.`);
    if (deleted.count < EMAILS_TO_DELETE.length) {
        Logger.warn('Database', 'Some emails were not found (already deleted or never existed).');
    }

    Logger.info('System', 'User removal finished.');
}

main()
    .catch((e) => Logger.error('System', 'Script failed.', e))
    .finally(async () => {
        await db.$disconnect();
        await pool.end();
    });
