import 'dotenv/config';
import { db } from '../lib/db/client';

async function main() {
    console.log('🗑️ Deleting all data from database...');

    // Delete in correct order due to foreign keys
    const delPesagens = await db.pesagem.deleteMany({});
    console.log(`Deleted ${delPesagens.count} pesagens`);

    const delPerimetros = await db.perimetroCorporal.deleteMany({});
    console.log(`Deleted ${delPerimetros.count} perimetros`);

    const delAvaliacoes = await db.avaliacaoFisica.deleteMany({});
    console.log(`Deleted ${delAvaliacoes.count} avaliacoes`);

    const delUsers = await db.user.deleteMany({});
    console.log(`Deleted ${delUsers.count} users`);

    console.log('✅ Database cleared!');
}

main()
    .catch(e => console.error(e))
    .finally(() => db.$disconnect());
