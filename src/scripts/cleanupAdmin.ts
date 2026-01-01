import 'dotenv/config';
import { db } from '../lib/db/client';
import { hashPassword } from '../lib/security/password';
import { Logger } from '../lib/utils/logger';

async function main() {
    Logger.info('System', 'Maintenance Protocol: Initiating administrative cleanup and password reset sequence.');

    // 1. Delete old admin user
    try {
        await db.user.delete({ where: { id: '0fb7eae7-fa56-481e-b740-b97cf6e1d2f0' } });
        Logger.success('Security', 'Account Deprecation: Successfully purged deprecated UID 0fb7eae7-fa56-481e-b740-b97cf6e1d2f0 from registry.');
    } catch (e) {
        Logger.warn('Security', 'Maintenance Notice: Deprecated target UID not found or already decommissioned.');
    }

    // 2. Change fabiole@fabiole.com password to "admin"
    try {
        const newPassword = await hashPassword('admin');
        await db.user.update({
            where: { email: 'fabiole@fabiole.com' },
            data: { password: newPassword }
        });
        Logger.success('Security', 'Credential Update: Access token for fabiole@fabiole.com has been successfully reset.');
    } catch (e) {
        Logger.error('Security', 'Credential Update Failed: Could not modify access token for root administrator.', e);
    }

    Logger.info('System', 'Maintenance Task Concluded: Admin state has been successfully synchronised.');
}

main()
    .catch((err) => Logger.error('System', 'Cleanup failed.', err))
    .finally(() => db.$disconnect());
