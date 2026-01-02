import 'dotenv/config';
import { db } from '../lib/db/client';
import { Logger } from '../lib/utils/logger';

async function main() {
    // Find both users
    const users = await db.user.findMany({
        where: {
            OR: [
                { email: 'flatiana7@gmail.com' },
                { email: { contains: 'anabela' } },
                { name: { contains: 'Anabela' } }
            ]
        },
        select: {
            id: true,
            email: true,
            name: true,
            surname: true,
            _count: {
                select: {
                    pesagens: true
                }
            }
        }
    });

    Logger.info('Search', `Found ${users.length} user(s) matching Anabela:`);

    users.forEach(user => {
        Logger.info('User', `${user.name} ${user.surname} (${user.email})`);
        Logger.info('User', `UUID: ${user.id}`);
        Logger.info('User', `Pesagens count: ${user._count.pesagens}`);
        console.log('---');
    });
}

main()
    .catch(e => Logger.error('Search', 'Error', e))
    .finally(() => db.$disconnect());
