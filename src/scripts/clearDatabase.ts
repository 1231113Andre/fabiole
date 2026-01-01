import 'dotenv/config';
import { db } from '../lib/db/client';
import { Logger } from '../lib/utils/logger';

async function main() {
    Logger.warn('System', 'Data Purge Initiated: Commencing complete deletion of all records from the database storage.');

    try {
        // Delete in correct order due to foreign keys
        const delPesagens = await db.pesagem.deleteMany({});
        Logger.info('Database', `Sanitisation: Successfully removed ${delPesagens.count} weigh-in records.`);

        const delPerimetros = await db.perimetroCorporal.deleteMany({});
        Logger.info('Database', `Sanitisation: Successfully removed ${delPerimetros.count} circumference records.`);

        const delAvaliacoes = await db.avaliacaoFisica.deleteMany({});
        Logger.info('Database', `Sanitisation: Successfully removed ${delAvaliacoes.count} physical assessment records.`);

        const delUsers = await db.user.deleteMany({});
        Logger.info('Database', `Sanitisation: Successfully removed ${delUsers.count} user accounts.`);

        Logger.success('Database', 'Purge Sequence Complete: The database has been fully cleared and reset.');
    } catch (error) {
        Logger.error('Database', 'Purge Sequence Failed: An error occurred during the destructive operation.', error);
    }
}

main()
    .catch(e => Logger.error('System', 'Critical teardown failure.', e))
    .finally(() => db.$disconnect());
