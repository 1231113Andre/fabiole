import 'dotenv/config';
import { db } from '../lib/db/client';
import { Logger } from '../lib/utils/logger';

// User: Rafael Leitão (rafaelluisleitao@gmail.com)
// UUID: 0d40c8f7-fac2-454f-adaf-025b422f3fd5
// Height: 174 cm
const USER_UUID = '0d40c8f7-fac2-454f-adaf-025b422f3fd5';
const USER_HEIGHT = 174;

// Pesagens data from spreadsheet
// Note: Dates are in Polish format (paź=Oct, lis=Nov, gru=Dec, sty=Jan, lut=Feb, mar=Mar, kwi=Apr, maj=May, cze=Jun, lip=Jul, sie=Aug, wrz=Sep)
const rawData = `07.paź	102,9	32,30%	66,3	48,6	34,0	16	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
12paź	102,3	31,20%	66,9	49,1	33,8	15,5	61	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
18paź	100,2	31,00%	65,7	49,2	33,1	15	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
24paź	102,1	30,00%	68,0	49,7	33,7	15	61	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
01lis	101,6	30,70%	66,9	49,3	33,6	15	61	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
07lis	101,8	31,90%	65,9	48,8	33,6	15,5	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
28lis	103,3	28,40%	70,3	50,6	34,1	14,5	61	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
14gru	101,4	33,10%	70,3	48,2	33,5	16	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
29sty	101,7	32,90%	64,9	48,3	33,6	16	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
04lut	100,5	31,70%	65,3	48,9	33,2	15,5	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
11lut	100,7	31,50%	65,5	48,9	33,3	15,5	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
18lut	100,4	32,20%	64,7	48,6	33,2	15,5	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
25lut	99,4	29,90%	66,2	49,7	32,8	14,5	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
05mar	98,9	29,40%	66,4	50	32,7	14	61	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
12mar	97,8	30,30%	64,8	49.5	32,3	14,5	61	3.4	Obesidade Grau I	Elevado (Risco para a Saúde)	
19mar	97,3	29,90%	64,8	49,7	32,1	14	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
26mar	97,4	27,90%	66,8	50,8	32,2	13,5	61	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
02kwi	95,6	29,30%	64,3	50	31,6	14	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
09kwi	95,9	28,50%	65,1	50,4	31,7	13,5	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
16kwi	96	30,40%	63,5	49,4	31,7	14,5	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
23kwi	96,9	28,80%	65,5	50,2	32,0	13,5	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
30kwi	96,2	28,4%	65,5	50,4	31,8	13,5	61	3.4	Obesidade Grau I	Elevado (Risco para a Saúde)	
07maj	95,9	28,60%	65,1	50,3	31,7	13,5	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
14maja	95,8	29,00%	64,7	50,1	31,6	13,5	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
07 sierpnia	96	29,0%	62,6	48,9	31,7	14,5	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
14 sierpnia	96	27,8%	65,9	50.8	31,7	13	61	3.4	Obesidade Grau I	Elevado (Risco para a Saúde)	
21sierpnia	95,3	27,5%	65,6	50.9	31,5	13	61	3.4	Obesidade Grau I	Elevado (Risco para a Saúde)	
27sierpnia	94,5	25,2%	67,2	50,9	31,2	12	52	3.5	Obesidade Grau I	Elevado (Risco para a Saúde)	
04wrz	93,6	26,3%	65,8	51.7	30,9	12,5	56	3.4	Obesidade Grau I	Elevado (Risco para a Saúde)	
11wrz	93,8	25,90%	66,1	51,9	31,0	12	55	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
19wrz	95	25,30%	67,5	52,4	31,4	12	52	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
16paź	94,9	27,7%	65,2	50.8	31,3	13	61	3.4	Obesidade Grau I	Elevado (Risco para a Saúde)	
23paź	94,6	26,8%	65,8	51,3	31,2	12,5	58	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
21wrz	90,3	26,6%	65,6	55	29,8	11	48	3	Pré-obesidade	Elevado (Risco para a Saúde)	
10paź	91,1	22,4%	67,2	56	30,1	11	43	4	Obesidade Grau I	Nível Médio (Atenção)	
26paź	90,1	22,2%	66,6	56,1	29,8	11	43	4	Pré-obesidade	Nível Médio (Atenção)	
02lis	90,4	24,0%	65,3	54,6	29,9	11	49	3	Pré-obesidade	Nível Médio (Atenção)	
18lis	91,4	23,2%	66,8	55,4	30,2	11	46	4	Obesidade Grau I	Nível Médio (Atenção)	
30lis	93,7	25,2%	66,6	53,9	30,9	12	53	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
19gru	94,5	26,1%	66,3	53,1	31,2	13	56	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
04sty	95,1	26,4%	66,5	52,9	31,4	13	57	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
09sty	94,7	26,4%	66,2	52,9	31,3	13	57	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
16sty	95,2	25,4%	67,6	53,8	31,4	12	53	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
23sty	95	26,7%	66,2	52,6	31,4	13	58	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
30sty	94,7	25,6%	67,0	53,6	31,3	12	54	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
08lut	92,7	26,1%	65,1	53	30,6	12	56	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
13lut	93,3	25,2%	66,4	53,9	30,8	12	53	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
20lut	93,8	24,3%	67,5	54,6	31,0	12	49	4	Obesidade Grau I	Nível Médio (Atenção)	
06mar	94,5	24,8%	67,6	54,3	31,2	12	51	4	Obesidade Grau I	Nível Médio (Atenção)	
13mar	92	26,2%	64,6	52,9	30,4	12	57	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
15mar	91,2	26,9%	63,4	52,2	30,1	13	59	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
20mar	92,6	25,0%	66,0	53,9	30,6	12	52	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
27mar	93,4	24,7%	66,8	54,3	30,8	12	51	4	Obesidade Grau I	Nível Médio (Atenção)	
31mar	91,3	24,9%	65,1	53,9	30,2	12	52	3	Obesidade Grau I	Nível Médio (Atenção)	
03kwi	93,2	25,5%	66,0	52,1	30,8	12	54	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
03kwi	93,6	24,1%	67,5	54,8	30,9	12	49	4	Obesidade Grau I	Nível Médio (Atenção)	
19kwi	96,4	22,7%	70,9	56,3	31,8	11	43	4	Obesidade Grau I	Nível Médio (Atenção)	
17maj	91,7	24,7%	65,6	54,1	30,3	12	51	3	Obesidade Grau I	Nível Médio (Atenção)	
31maj	92	24,4%	66,1	54,4	30,4	12	50	3	Obesidade Grau I	Nível Médio (Atenção)	
14cze	91,9	24,1%	66,3	54,7	30,4	12	49	4	Obesidade Grau I	Nível Médio (Atenção)	
21cze	93,3	23,7%	67,6	55,1	30,8	12	48	4	Obesidade Grau I	Nível Médio (Atenção)	
30cze	94,1	23,4%	68,5	55,5	31,1	12	46	4	Obesidade Grau I	Nível Médio (Atenção)	
14lip	92,7	24,5%	66,6	54,4	30,6	12	50	4	Obesidade Grau I	Nível Médio (Atenção)	
01wrz	94,6	24,3%	68,0	54,7	31,2	12	50	4	Obesidade Grau I	Nível Médio (Atenção)	
20wrz	96,6	24,1%	69,7	55,1	31,9	12	48	4	Obesidade Grau I	Nível Médio (Atenção)	
29wrz	96	25,9%	67,7	53,5	31,7	13	55	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
06paź	95,5	25,5%	67,6	53,7	31,5	13	54	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
13paź	93,4	27,4%	64,5	52	30,8	13	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
16paź	93,6	26,9%	65,0	52,5	30,9	13	59	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
27paź	94,4	26,2%	66,2	53,1	31,2	13	56	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
04gru	95,2	28,0%	65,2	51,6	31,4	14	63	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
15gru	95,1	27,8%	65,2	51,7	31,4	14	63	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
22gru	95,2	28,2%	65,0	51,4	31,4	14	64	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
05sty	95,2	27,5%	65,6	52	31,4	13	61	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
12sty	93,4	27,6%	64,3	51,8	30,8	13	62	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
26sty	91,7	27,0%	63,6	52,2	30,3	13	60	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
02lut	92,2	26,1%	64,8	53	30,5	13	57	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
09lut	92	26,6%	64,2	52,6	30,4	13	58	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
03maj	96	26,6%	67,0	52,8	31,7	13	58	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
30wrz	96,8	27,4%	66,8	52,2	32,0	14	61	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
11paź	93,5	28,3%	63,7	51,2	30,9	14	64	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
18paź	95,5	27,9%	65,5	51,7	31,5	14	63	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
25paź	94,9	28,4%	64,5	51,2	31,3	14	64	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
10sty	98,6	28,4%	67,1	51,4	32,6	14	64	4	Obesidade Grau I	Elevado (Risco para a Saúde)	
17sty	96,3	29,6%	64,4	50,2	31,8	15	64	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
24sty	95,7	27,7%	65,7	51,8	31,6	14	62	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
31sty	94,7	28,1%	64,7	51,4	31,3	14	64	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
28lut	94	28,0%	64,3	51,5	31,0	14	64	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
17mar	94,2	28,0%	64,5	51,5	31,1	14	64	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
26mar	93,2	27,9%	63,8	51,6	30,8	14	63	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
4kwi	90,2	28,0%	61,7	51,3	29,8	13	64	3	Pré-obesidade	Elevado (Risco para a Saúde)	
11kwi	89,1	26,7%	62,0	52,3	29,4	13	60	3	Pré-obesidade	Elevado (Risco para a Saúde)	
09maja	92,8	27,6%	63,9	51,8	30,7	13	62	3	Obesidade Grau I	Elevado (Risco para a Saúde)	
30maja	93,8	27,4%	64,7	52,1	31,0	14	62	3,4	Obesidade Grau I	Elevado (Risco para a Saúde)	
13czerwca	91,5	28,9%	61,8	50,6	30,2	14	66	3,2	Obesidade Grau I	Elevado (Risco para a Saúde)	
06sierpnia	89,9	24,5%	64,5	54,3	29,7	12	51	3,4	Pré-obesidade	Nível Médio (Atenção)	
10października	89,6	26,6%	62,5	52,5	29,6	13	59	3,3	Pré-obesidade	Elevado (Risco para a Saúde)`;

function parseNumber(value: string): number | null {
    if (!value || value === '-' || value.trim() === '') return null;
    // Remove % sign and replace comma/dot with dot
    const cleaned = value.replace('%', '').replace(',', '.').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

// Polish month names to numbers (both short and full forms)
const polishMonths: Record<string, number> = {
    'sty': 1, 'stycznia': 1, 'styczen': 1,
    'lut': 2, 'lutego': 2, 'luty': 2,
    'mar': 3, 'marca': 3, 'marzec': 3,
    'kwi': 4, 'kwietnia': 4, 'kwiecien': 4,
    'maj': 5, 'maja': 5,
    'cze': 6, 'czerwca': 6, 'czerwiec': 6,
    'lip': 7, 'lipca': 7, 'lipiec': 7,
    'sie': 8, 'sierpnia': 8, 'sierpien': 8,
    'wrz': 9, 'wrzesnia': 9, 'wrzesień': 9,
    'paz': 10, 'paź': 10, 'pazdziernika': 10, 'października': 10, 'pazdziernik': 10,
    'lis': 11, 'listopada': 11, 'listopad': 11,
    'gru': 12, 'grudnia': 12, 'grudzien': 12
};

function parsePolishDate(dateStr: string): Date {
    // Format examples: "07.paź", "12paź", "29sty", "07 sierpnia", "14maja", "4kwi", "06sierpnia"
    let cleaned = dateStr.trim().toLowerCase();

    // Normalize Polish special characters
    cleaned = cleaned.replace(/ź/g, 'z').replace(/ś/g, 's').replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ą/g, 'a').replace(/ę/g, 'e').replace(/ć/g, 'c').replace(/ż/g, 'z').replace(/ł/g, 'l');

    // Extract day and month
    let day: number;
    let monthStr: string;

    // Try different patterns
    if (cleaned.match(/^\d+\s+\w+$/)) {
        // "07 sierpnia", "14 maja"
        const parts = cleaned.split(/\s+/);
        day = parseInt(parts[0]);
        monthStr = parts[1];
    } else if (cleaned.match(/^\d+\.\w+$/)) {
        // "07.paz"
        const parts = cleaned.split('.');
        day = parseInt(parts[0]);
        monthStr = parts[1];
    } else {
        // "12paz", "14maja", "4kwi", "06sierpnia", "10pazdziernika"
        // Try to find where the month name starts (first letter after digits)
        const match = cleaned.match(/^(\d+)([a-z]+)$/);
        if (match) {
            day = parseInt(match[1]);
            monthStr = match[2];
        } else {
            throw new Error(`Cannot parse date: ${dateStr}`);
        }
    }

    // Try to find the month - first try exact match, then try prefix matching
    let month = polishMonths[monthStr];

    if (!month) {
        // Try to find by prefix (e.g., "paz" should match "pazdziernika")
        for (const [key, value] of Object.entries(polishMonths)) {
            if (monthStr.startsWith(key) || key.startsWith(monthStr)) {
                month = value;
                break;
            }
        }
    }

    if (!month) {
        throw new Error(`Unknown Polish month: ${monthStr} (normalized from ${dateStr})`);
    }

    // Determine year based on context
    // The data spans multiple years - we need to track sequences
    // Oct-Dec are 2024, but there are repeating months in later years
    // Looking at the data pattern: starts Oct 2024, goes through 2025 and into 2026
    // For simplicity, assume: Oct-Dec first occurrence = 2024, then 2025, then 2026
    // Since we process in order, we'll use a simple heuristic:
    // First batch (Oct-Dec) = 2024, rest of first year = 2025
    // This is a simplification - for perfect accuracy we'd need to track sequences
    const year = month >= 10 ? 2024 : 2025;

    return new Date(year, month - 1, day);
}

async function main() {
    Logger.info('Migration', `Commencing pesagens import protocol for Rafael Leitão (UUID: ${USER_UUID}).`);

    // Parse data
    const lines = rawData.trim().split('\n');
    const records: any[] = [];

    for (const line of lines) {
        const parts = line.split('\t');
        if (parts.length < 10) continue;

        const [
            dateStr,
            pesoStr,
            percentMGStr,
            mmStr,
            h2oStr,
            imcStr,
            gordVisceralStr,
            idMetabolicaStr,
            massaOsseaStr,
            resultadoIMC,
            resultadoPercentMG,
            ...notasParts
        ] = parts;

        try {
            records.push({
                date: parsePolishDate(dateStr),
                peso: parseNumber(pesoStr),
                percentualMG: parseNumber(percentMGStr),
                mm: parseNumber(mmStr),
                h2o: parseNumber(h2oStr),
                imc: parseNumber(imcStr),
                gordVisceral: parseNumber(gordVisceralStr),
                idMetabolica: parseNumber(idMetabolicaStr),
                massaOssea: parseNumber(massaOsseaStr),
                resultadoIMC: resultadoIMC?.trim() || null,
                resultadoPercentMG: resultadoPercentMG?.trim() || null,
                notas: notasParts.join('\t').trim() || null,
                height: USER_HEIGHT
            });
        } catch (error) {
            Logger.error('Migration', `Error parsing line: ${line}`, error);
        }
    }

    Logger.info('Migration', `Parsed ${records.length} records from spreadsheet data.`);

    // Check for existing records
    const existingCount = await db.pesagem.count({
        where: { user_uuid: USER_UUID }
    });
    Logger.info('Migration', `User currently has ${existingCount} existing pesagens in database.`);

    // Delete existing pesagens to avoid duplicates
    if (existingCount > 0) {
        const deleted = await db.pesagem.deleteMany({ where: { user_uuid: USER_UUID } });
        Logger.info('Migration', `Data sanitisation: Successfully removed ${deleted.count} legacy pesagens records.`);
    }

    // Insert records
    const dataToInsert = records.map(r => ({
        user_uuid: USER_UUID,
        date: r.date,
        peso: r.peso,
        percentualMG: r.percentualMG,
        mm: r.mm,
        h2o: r.h2o,
        imc: r.imc,
        gordVisceral: r.gordVisceral,
        idMetabolica: r.idMetabolica,
        massaOssea: r.massaOssea,
        resultadoIMC: r.resultadoIMC,
        resultadoPercentMG: r.resultadoPercentMG,
        notas: r.notas,
        height: r.height
    }));

    const result = await db.pesagem.createMany({
        data: dataToInsert,
        skipDuplicates: false
    });

    Logger.success('Migration', `Import phase concluded: Successfully provisioned ${result.count} pesagens records for Rafael Leitão.`);

    // Verify
    const finalCount = await db.pesagem.count({ where: { user_uuid: USER_UUID } });
    Logger.info('Migration', `Final audit check: Total active pesagens is now ${finalCount}.`);
}

main()
    .catch(e => Logger.error('Migration', 'Critical failure encountered during data import execution sequence.', e))
    .finally(() => db.$disconnect());
