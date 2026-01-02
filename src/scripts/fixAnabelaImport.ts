import 'dotenv/config';
import { db } from '../lib/db/client';
import { Logger } from '../lib/utils/logger';

const CATARINA_UUID = '8662e1ca-b830-4c55-a15d-529352f22812'; // Wrong - Catarina Leitão
const ANABELA_UUID = '9ed32525-5284-4af1-ba86-666b9253cec4';   // Correct - Anabela Leitão

async function main() {
    Logger.info('Cleanup', `Removing pesagens from Catarina's UUID: ${CATARINA_UUID}`);

    // Delete pesagens from Catarina (wrong user)
    const deleted = await db.pesagem.deleteMany({
        where: { user_uuid: CATARINA_UUID }
    });

    Logger.success('Cleanup', `Removed ${deleted.count} pesagens from Catarina Leitão.`);

    // Verify Anabela
    const anabela = await db.user.findUnique({
        where: { id: ANABELA_UUID },
        select: { email: true, name: true, surname: true }
    });

    if (anabela) {
        Logger.info('Cleanup', `Verified Anabela: ${anabela.name} ${anabela.surname} (${anabela.email})`);
    }
}

main()
    .catch(e => Logger.error('Cleanup', 'Error during cleanup', e))
    .finally(() => db.$disconnect());
