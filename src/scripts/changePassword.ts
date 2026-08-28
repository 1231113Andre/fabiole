import 'dotenv/config';
import { ensureNotProduction } from './guardProduction';
import { db } from '../lib/db/client';
import { hashPassword } from '../lib/security/password';
import { Logger } from '../lib/utils/logger';

ensureNotProduction();

const EMAIL = 'andrebalao26@gmail.com';
const NEW_PASSWORD = 'A15fa11dd!';

async function main() {
    Logger.info('Password', `Changing password for ${EMAIL}`);

    const hashedPassword = await hashPassword(NEW_PASSWORD);

    const user = await db.user.update({
        where: { email: EMAIL },
        data: { password: hashedPassword }
    });

    Logger.success('Password', `Password changed successfully for ${user.email}`);
}

main()
    .catch(e => Logger.error('Password', 'Failed to change password', e))
    .finally(async () => await db.$disconnect());

