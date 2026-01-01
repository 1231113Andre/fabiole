import 'dotenv/config';
import { db } from '../lib/db/client';
import { hashPassword } from '../lib/security/password';
import { Logger } from '../lib/utils/logger';

async function main() {
    Logger.info('System', 'Privileged Action: Initiating master administrator hierarchy configuration.');

    // 1. Remove admin from developerxawierstudio@gmail.com
    try {
        await db.user.update({
            where: { email: 'developerxawierstudio@gmail.com' },
            data: { role: 'USER' }
        });
        Logger.success('AdminService', 'Permission Downgrade: Successfully reverted developerxawierstudio@gmail.com to standard USER status.');
    } catch (e) {
        Logger.warn('AdminService', 'Maintenance Notice: developerxawierstudio@gmail.com either already downgraded or record is absent.');
    }

    // 2. Check if fabiole@fabiole.com exists
    let admin = await db.user.findUnique({
        where: { email: 'fabiole@fabiole.com' }
    });

    if (!admin) {
        // Create new admin user
        const hashedPassword = await hashPassword('admin123');
        admin = await db.user.create({
            data: {
                email: 'fabiole@fabiole.com',
                password: hashedPassword,
                name: 'Fabio',
                surname: 'Le',
                role: 'ADMINISTRATOR',
                birth: new Date('1990-01-01')
            }
        });
        Logger.success('AdminService', 'Identity Creation: Root administrator account fabiole@fabiole.com successfully provisioned.');
    } else {
        // Update existing user to admin
        await db.user.update({
            where: { email: 'fabiole@fabiole.com' },
            data: { role: 'ADMINISTRATOR' }
        });
        Logger.success('AdminService', 'Permission Escalation: fabiole@fabiole.com elevated to master ADMINISTRATOR role.');
    }

    Logger.info('System', 'Configuration Success: Admin hierarchy finalized and locked.');
}

main()
    .catch((err) => Logger.error('System', 'Setup failed.', err))
    .finally(() => db.$disconnect());
