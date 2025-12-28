import 'dotenv/config';
import { db } from '../lib/db/client';

// Pesagens extracted from Google Sheets for aloisio-monteiro@hotmail.com
const pesagensData = [
    { date: "22/03/2025", peso: 117.1, percentualMG: 32.8, mm: 74.8, h2o: 47.1, imc: 31.8, gordVisceral: 1, idMetabolica: 17, massaOssea: null, resultadoIMC: "-", resultadoPercentMG: "Obesidade Grau I", notas: null, height: 192 },
    { date: "23/05/2025", peso: 115.2, percentualMG: 29.9, mm: 76.8, h2o: 49.2, imc: 31.3, gordVisceral: 1, idMetabolica: 15, massaOssea: 66, resultadoIMC: "4", resultadoPercentMG: "Obesidade Grau I", notas: null, height: null },
    { date: "05/06/2025", peso: 115.1, percentualMG: 29.2, mm: 77.5, h2o: 49.9, imc: 31.2, gordVisceral: 1, idMetabolica: 15, massaOssea: 63, resultadoIMC: "4", resultadoPercentMG: "Obesidade Grau I", notas: null, height: null },
    { date: "07/07/2025", peso: 111.9, percentualMG: 38.4, mm: 65.5, h2o: 46.4, imc: 30.4, gordVisceral: 1, idMetabolica: 9, massaOssea: 61, resultadoIMC: "3,5", resultadoPercentMG: "Obesidade Grau I", notas: null, height: null },
    { date: "06/08/2025", peso: 109.7, percentualMG: 40.2, mm: 62.2, h2o: 44.9, imc: 29.8, gordVisceral: 1, idMetabolica: 9, massaOssea: 67, resultadoIMC: "3,3", resultadoPercentMG: "Pré-obesidade", notas: null, height: null },
    { date: "27/08/2025", peso: 109.9, percentualMG: 31.1, mm: 72, h2o: 47.9, imc: 29.8, gordVisceral: 1, idMetabolica: 15, massaOssea: 67, resultadoIMC: "3,7", resultadoPercentMG: "Pré-obesidade", notas: null, height: null },
    { date: "08/10/2025", peso: 112.6, percentualMG: 28.5, mm: 76.6, h2o: 50.3, imc: 30.5, gordVisceral: 1, idMetabolica: 14, massaOssea: 61, resultadoIMC: "3,9", resultadoPercentMG: "Obesidade Grau I", notas: null, height: null },
    { date: "26/10/2025", peso: 112.5, percentualMG: 27.8, mm: 77.3, h2o: 50.9, imc: 30.5, gordVisceral: 1, idMetabolica: 14, massaOssea: 58, resultadoIMC: "4", resultadoPercentMG: "Obesidade Grau I", notas: null, height: null },
];

function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

async function main() {
    const email = 'aloisio-monteiro@hotmail.com';
    console.log(`🚀 Importing pesagens for ${email}...`);

    // Find the user
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
        console.error(`❌ User not found: ${email}`);
        process.exit(1);
    }

    console.log(`✅ Found user: ${user.name} ${user.surname} (ID: ${user.id})`);

    // Delete existing pesagens
    const deleted = await db.pesagem.deleteMany({ where: { user_uuid: user.id } });
    console.log(`🗑️ Deleted ${deleted.count} existing pesagens`);

    // Insert new pesagens
    const dataToInsert = pesagensData.map(p => ({
        user_uuid: user.id,
        date: parseDate(p.date),
        peso: p.peso,
        percentualMG: p.percentualMG,
        mm: p.mm,
        h2o: p.h2o,
        imc: p.imc,
        gordVisceral: p.gordVisceral,
        idMetabolica: p.idMetabolica,
        massaOssea: p.massaOssea,
        resultadoIMC: p.resultadoIMC,
        resultadoPercentMG: p.resultadoPercentMG,
        notas: p.notas,
        height: p.height,
    }));

    await db.pesagem.createMany({ data: dataToInsert });
    console.log(`✅ Imported ${dataToInsert.length} pesagens`);

    // Verify
    const count = await db.pesagem.count({ where: { user_uuid: user.id } });
    console.log(`📊 Total pesagens for ${email}: ${count}`);
}

main()
    .catch(e => console.error(e))
    .finally(() => db.$disconnect());
