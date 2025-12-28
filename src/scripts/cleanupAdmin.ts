import 'dotenv/config';
import { db } from '../lib/db/client';
import { hashPassword } from '../lib/security/password';

async function main() {
    console.log('🔧 Cleaning up admin...\n');

    // 1. Delete old admin user
    try {
        await db.user.delete({ where: { id: '0fb7eae7-fa56-481e-b740-b97cf6e1d2f0' } });
        console.log('✅ Deleted user 0fb7eae7-fa56-481e-b740-b97cf6e1d2f0');
    } catch (e) {
        console.log('⚠️ User 0fb7eae7-fa56-481e-b740-b97cf6e1d2f0 not found or already deleted');
    }

    // 2. Change fabiole@fabiole.com password to "admin"
    const newPassword = await hashPassword('admin');
    await db.user.update({
        where: { email: 'fabiole@fabiole.com' },
        data: { password: newPassword }
    });
    console.log('✅ fabiole@fabiole.com password changed to: admin');

    console.log('\n🎉 Done!');
}

main()
    .catch(console.error)
    .finally(() => db.$disconnect());
