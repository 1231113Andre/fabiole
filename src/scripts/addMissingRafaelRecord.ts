import 'dotenv/config';
import { db } from '../lib/db/client';
import { Logger } from '../lib/utils/logger';

const USER_UUID = '0d40c8f7-fac2-454f-adaf-025b422f3fd5';

async function main() {
    // Check current count
    const count = await db.pesagem.count({ where: { user_uuid: USER_UUID } });
    Logger.info('Fix', `Current pesagens count: ${count}`);

    // Add missing record: 10października (Oct 10, 2025)
    const result = await db.pesagem.create({
        data: {
            user_uuid: USER_UUID,
            date: new Date(2025, 9, 10), // Oct 10, 2025
            peso: 89.6,
            percentualMG: 26.6,
            mm: 62.5,
            h2o: 52.5,
            imc: 29.6,
            gordVisceral: 13,
            idMetabolica: 59,
            massaOssea: 3.3,
            resultadoIMC: 'Pré-obesidade',
            resultadoPercentMG: 'Elevado (Risco para a Saúde)',
            height: 174
        }
    });

    Logger.success('Fix', `Added missing record ID: ${result.id}`);

    // Verify
    const finalCount = await db.pesagem.count({ where: { user_uuid: USER_UUID } });
    Logger.info('Fix', `Final pesagens count: ${finalCount}`);
}

main()
    .catch(e => Logger.error('Fix', 'Error', e))
    .finally(() => db.$disconnect());
