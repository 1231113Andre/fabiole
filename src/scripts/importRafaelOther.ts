import 'dotenv/config';
import { db } from '../lib/db/client';
import { Logger } from '../lib/utils/logger';

// User: Rafael Leitão (rafaelluisleitao@gmail.com)
// UUID: 0d40c8f7-fac2-454f-adaf-025b422f3fd5
const USER_UUID = '0d40c8f7-fac2-454f-adaf-025b422f3fd5';

// Perímetros data: 28lut25 (28 Feb 2025)
const perimetrosData = [{
    date: new Date(2025, 1, 28), // Feb 28, 2025
    msRight: 35.5,
    msLeft: 36,
    chest: 114.5,
    waist: 106.5,
    abdomen: 105.5,
    hips: null, // Missing in data
    thighR: 52.8,
    thighL: 51.8
}];

// Avaliações data
const avaliacoesData = [
    {
        date: new Date(2025, 9, 2), // Oct 2, 2025
        pushUps: 13,
        sitUps: null, // Missing
        mile: '119bpm | 14\'50\'\'',
        mileResult: '38.9 ml/kg/min | BOM'
    },
    {
        date: new Date(2025, 3, 6), // Apr 6, 2025
        pushUps: 28,
        sitUps: null, // Missing
        mile: '170bpm | 11\'18\'\'',
        mileResult: '42,3 | Excelente'
    }
];

async function main() {
    Logger.info('Migration', `Importing perímetros and avaliações for Rafael Leitão (UUID: ${USER_UUID}).`);

    // Delete existing perímetros
    const deletedPerimetros = await db.perimetroCorporal.deleteMany({ where: { user_uuid: USER_UUID } });
    Logger.info('Migration', `Removed ${deletedPerimetros.count} existing perímetros.`);

    // Delete existing avaliações
    const deletedAvaliacoes = await db.avaliacaoFisica.deleteMany({ where: { user_uuid: USER_UUID } });
    Logger.info('Migration', `Removed ${deletedAvaliacoes.count} existing avaliações.`);

    // Insert perímetros
    const perimetrosToInsert = perimetrosData.map(p => ({
        user_uuid: USER_UUID,
        date: p.date,
        msRight: p.msRight,
        msLeft: p.msLeft,
        chest: p.chest,
        waist: p.waist,
        abdomen: p.abdomen,
        hips: p.hips,
        thighR: p.thighR,
        thighL: p.thighL
    }));

    const perimetrosResult = await db.perimetroCorporal.createMany({
        data: perimetrosToInsert,
        skipDuplicates: false
    });

    Logger.success('Migration', `Imported ${perimetrosResult.count} perímetros.`);

    // Insert avaliações
    const avaliacoesToInsert = avaliacoesData.map(a => ({
        user_uuid: USER_UUID,
        date: a.date,
        pushUps: a.pushUps,
        sitUps: a.sitUps,
        mile: a.mile,
        mileResult: a.mileResult
    }));

    const avaliacoesResult = await db.avaliacaoFisica.createMany({
        data: avaliacoesToInsert,
        skipDuplicates: false
    });

    Logger.success('Migration', `Imported ${avaliacoesResult.count} avaliações.`);

    // Verify
    const perimetrosCount = await db.perimetroCorporal.count({ where: { user_uuid: USER_UUID } });
    const avaliacoesCount = await db.avaliacaoFisica.count({ where: { user_uuid: USER_UUID } });

    Logger.info('Migration', `Final counts: ${perimetrosCount} perímetros, ${avaliacoesCount} avaliações.`);
}

main()
    .catch(e => Logger.error('Migration', 'Error during import', e))
    .finally(() => db.$disconnect());
