import 'dotenv/config';
import { db } from '../lib/db/client';
import { Logger } from '../lib/utils/logger';

const WRONG_UUID = '9ed32525-5284-4af1-ba86-666b9253cec4';
const CORRECT_UUID = '8662e1ca-b830-4c55-a15d-529352f22812';

async function main() {
    Logger.info('Cleanup', `Removing pesagens from wrong UUID: ${WRONG_UUID}`);

    // Delete pesagens from wrong user
    const deleted = await db.pesagem.deleteMany({
        where: { user_uuid: WRONG_UUID }
    });

    Logger.success('Cleanup', `Removed ${deleted.count} pesagens from wrong user.`);

    // Verify correct user
    const correctUser = await db.user.findUnique({
        where: { id: CORRECT_UUID },
        select: { email: true, name: true, surname: true }
    });

    if (correctUser) {
        Logger.info('Cleanup', `Verified correct user: ${correctUser.name} ${correctUser.surname} (${correctUser.email})`);
    } else {
        Logger.error('Cleanup', `Correct UUID not found: ${CORRECT_UUID}`);
    }

    // Check wrong user
    const wrongUser = await db.user.findUnique({
        where: { id: WRONG_UUID },
        select: { email: true, name: true, surname: true }
    });

    if (wrongUser) {
        Logger.info('Cleanup', `Wrong user was: ${wrongUser.name} ${wrongUser.surname} (${wrongUser.email})`);
    }
}

main()
    .catch(e => Logger.error('Cleanup', 'Error during cleanup', e))
    .finally(() => db.$disconnect());
