import 'dotenv/config';
import { db } from '../lib/db/client';
import { hashPassword } from '../lib/security/password';

async function main() {
    console.log('🔧 Setting up admin roles...\n');

    // 1. Remove admin from developerxawierstudio@gmail.com
    try {
        await db.user.update({
            where: { email: 'developerxawierstudio@gmail.com' },
            data: { role: 'USER' }
        });
        console.log('✅ developerxawierstudio@gmail.com -> role: USER');
    } catch (e) {
        console.log('⚠️ developerxawierstudio@gmail.com not found or already USER');
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
        console.log('✅ Created new admin: fabiole@fabiole.com (password: admin123)');
    } else {
        // Update existing user to admin
        await db.user.update({
            where: { email: 'fabiole@fabiole.com' },
            data: { role: 'ADMINISTRATOR' }
        });
        console.log('✅ fabiole@fabiole.com -> role: ADMINISTRATOR');
    }

    console.log('\n🎉 Done! Admin account: fabiole@fabiole.com');
}

main()
    .catch(console.error)
    .finally(() => db.$disconnect());
