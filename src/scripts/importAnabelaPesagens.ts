import 'dotenv/config';
import { db } from '../lib/db/client';
import { Logger } from '../lib/utils/logger';

// User: Anabela Leitão (flatiana7@gmail.com)
// UUID: 9ed32525-5284-4af1-ba86-666b9253cec4 (CORRECT!)
// Height: 160 cm
const USER_UUID = '9ed32525-5284-4af1-ba86-666b9253cec4';
const USER_HEIGHT = 160;

// Data from the spreadsheet for Anabela Leitão (flatiana7@gmail.com)
// Format: Date, Peso, %MG, MM, H2O%, IMC, GordVisceral, IdMetabolica, MassaOssea (but H2O% seems to be wrong position)
// Looking at the data structure - it seems to be:
// Date | Peso | %MG | MM | H2O | IMC | GordVisceral | IdMetabolica | MassaOssea | ResultadoIMC | Resultado%MG | Notas

const rawData = `9/5/2020	80,40	39,4%	46,20	42,9%	31,4	8	59	2	2,5	Obesidade Grau I	Elevado (Risco para a Saúde)	
9/15/2020	79,90	38,6%	46,60	43,4%	31,2	7,5	59	2	2,5	Obesidade Grau I	Elevado (Risco para a Saúde)	
9/19/2020	79,20	39,8%	45,30	42,5%	30,9	8	59	2	2,4	Obesidade Grau I	Elevado (Risco para a Saúde)	
9/24/2020	79,40	39,0%	46,00	43,2%	31,0	8	59	2	2,5	Obesidade Grau I	Elevado (Risco para a Saúde)	
10/1/2020	78,90	38,4%	46,20	43,6%	30,8	7,5	59	2	2,5	Obesidade Grau I	Elevado (Risco para a Saúde)	
10/8/2020	78,50	38,1%	46,10	43,7%	30,7	7,5	59	2	2,5	Obesidade Grau I	Elevado (Risco para a Saúde)	
10/9/2020	77,90	37,3%	46,30	44,3%	30,4	7,5	57	2	2,5	Obesidade Grau I	Elevado (Risco para a Saúde)	melhor pesagem!!
10/15/2020	77,20	38,3%	45,20	43,5%	30,2	7,5	59	2	2,4	Obesidade Grau I	Elevado (Risco para a Saúde)	balanço negativo :(
10/23/2020	77,60	36,6%	46,70	44,8%	30,3	7	55	2	2,5	Obesidade Grau I	Elevado (Risco para a Saúde)	balanço positivo!!
10/29/2020	77,60	38,2%	45,50	43,6%	30,3	7,5	59	2	2,4	Obesidade Grau I	Elevado (Risco para a Saúde)	alterações de percentis, peso corporal sem alterações 
11/5/2020	77,30	38,6%	45,10	43,3%	30,2	7,5	59	2	2,4	Obesidade Grau I	Elevado (Risco para a Saúde)	2 meses certos 3kg a menos!! vamos continuar e proxima pesagem estamos nos 76
11/16/2020	77,90	37,9%	45,90	43,8%	30,4	7,5	58	2	2,4	Obesidade Grau I	Elevado (Risco para a Saúde)	gostei! alguma melhoria
11/20/2020	77,40	38,0%	45,50	43,7%	30,2	7,5	59	2	2,4	Obesidade Grau I	Elevado (Risco para a Saúde)	alguma regressão nada de especial. continuar!!
11/26/2020	77,20	38,2%	45,30	43,6%	30,2	7,5	59	2	2,4	Obesidade Grau I	Elevado (Risco para a Saúde)	os croissants a refletir com o aumento de massa gorda de resto, aceitável!!
12/3/2020	77,30	37,9%	45,60	43,8%	30,2	7,5	58	2	2,4	Obesidade Grau I	Elevado (Risco para a Saúde)	bom! redução de massa gorda e idade metabolica, aumento de massa muscular e hidrataçao
12/11/2020	77,20	37,7%	45,60	43,9%	30,2	7,5	58	2	2,4	Obesidade Grau I	Elevado (Risco para a Saúde)	muito bem! ou manteve ou tudo verde!!
12/18/2020	77,60	37,7%	45,90	44,0%	30,3	7,5	58	2	2,5	Obesidade Grau I	Elevado (Risco para a Saúde)	balanço positivo, aumento de peso devido a aumento de MM e osseo
1/14/2021	77,60	37,8%	45,80	44,0%	30,3	7,5	58	2	2,5	Obesidade Grau I	Elevado (Risco para a Saúde)	devido a distancia de pesagens e festas conseguimos manter minimamente 
1/21/2021	78,50	38,8%	45,60	43,2%	30,7	7,5	59	2	2,4	Obesidade Grau I	Elevado (Risco para a Saúde)	vamos esquecer esta e avançar! proxima so verdes!!
1/29/2021	76,90	39,2%	42,80	48,3%	30,0	7,5	59	2	2,4	Obesidade Grau I	Elevado (Risco para a Saúde)	vamos continuar a perder peso!!
2/4/2021	77,30	37,4%	45,90	44,2%	30,2	7	57	2	2,5	Obesidade Grau I	Elevado (Risco para a Saúde)	PARABENS!! da melhor pesagem de sempre, vamos agora baixar o maldito peso!! :D 
2/11/2021	77,40	38,4%	45,30	43,5%	30,2	7,5	59	2	2,4	Obesidade Grau I	Elevado (Risco para a Saúde)	sem grande diferença de peso, aumento de massa gorda e redução de MM. vamos continuar!!
2/18/2021	77,10	36,5%	46,50	44,8%	30,1	7	54	2	2,5	Obesidade Grau I	Elevado (Risco para a Saúde)	TUDO VERDE! massa gorda e idade metabólica mais baixa de sempre, massa muscular mais alta, peso estável! PARABÉNS EXCELENTES RESULTADOS!!!
2/25/2021	76,80	37,6%	45,50	44,0%	30,0	7	57	2	2,4	Obesidade Grau I	Elevado (Risco para a Saúde)	aumento de massa gorda, um deslize, peso diminui penso que podemos dizer que o balanço e positivo. foco na redução de MG
3/5/2021	77,40	35,3%	47,60	45,7%	30,2	7	51	2	2,5	Obesidade Grau I	Elevado (Risco para a Saúde)	semana agridoce, excelentes resultados baixa de MG incrivel e idade metabolica mas aumento de MM que levou a aumento de peso.
3/12/2021	75,80	35,4%	46,50	45,5%	29,6	6,5	51	2	2,5	Pré-obesidade	Elevado (Risco para a Saúde)	boa semana! está livre dos burpees!! aumento de 0.1% de massa gorda sem significado, excelente perda de peso! finalmente MM começou a baixar
3/19/2021	76,30	36,5%	46,00	44,7%	29,8	7	54	2	2,5	Pré-obesidade	Elevado (Risco para a Saúde)	aquela semana que nem era para contar...
3/26/2021	77,80	34,8%	48,20	46,1%	30,4	6,5	50	3	2,6	Obesidade Grau I	Elevado (Risco para a Saúde)	melhoria de MG e MM. GV e idade metabolica a estabilzar vamos continuar. aumento de Perfil muscular muito bom nunca tinha tido 3!!
4/2/2021	75,90	37,2%	45,30	44,2%	29,6	7	56	2	2,4	Pré-obesidade	Elevado (Risco para a Saúde)	vamos a proxima semana, baixa de peso, pioria dos restantes valores
4/9/2021	75,70	35,5%	46,30	45,5%	29,6	6,5	51	2	2,5	Pré-obesidade	Elevado (Risco para a Saúde)	semana toda verde!!! muito bem parabens vamos continuar!!
4/16/2021	74,80	37,0%	44,80	44,4%	29,2	7	55	2	2,4	Pré-obesidade	Elevado (Risco para a Saúde)	redução de peso com aumento dos restantes valores
4/23/2021	75,00	35,8%	45,70	45,2%	29,3	6,5	52	2	2,4	Pré-obesidade	Elevado (Risco para a Saúde)	boa semana! ligeiro aumento de peso mas devido a MM, boa hidratação nova baixa de IM e de MG, estamos bem!
4/30/2021	74,90	36,4%	45,20	44,7%	29,3	7	54	2	2.4	Pré-obesidade	Elevado (Risco para a Saúde)	semana mais relaxada antes inicio ginasio, vamor recuperar!
5/7/2021	75,80	35,5%	46,40	45,4%	29,6	6,5	52	2	2,5	Pré-obesidade	Elevado (Risco para a Saúde)	semana muito positiva! aumento de peso devido a aumento de MM
5/14/2021	75,40	36,7%	45,30	44,6%	29,5	7	55	2	2,4	Pré-obesidade	Elevado (Risco para a Saúde)	aquela semana que pronto... passamos a frente :)
6/18/2021	76,90	38,2%	45,10	43,5%	30,0	7,5	59	2	2.4	Obesidade Grau I	Elevado (Risco para a Saúde)	apos paragem resultados refletem isso, vamos retomar a luta e melhorar
8/14/2021	78,60	37,6%	46,60	44,1%	30,7	7,5	58	2	2.5	Obesidade Grau I	Elevado (Risco para a Saúde)	so a questao do peso a estragar mas este aumento e devido a MM panorama geral positivo
8/21/2021	77,20	35,5%	47,20	45,5%	30,2	7	52	2	2.5	Obesidade Grau I	Elevado (Risco para a Saúde)	eh la! tudo verde? ficou maluca a Anabela!! muito bem! excelente! 
8/27/2021	75,30	36,3%	45,60	44,9%	29,4	7	53	2	2.4	Pré-obesidade	Elevado (Risco para a Saúde)	semana agridoce, baixa de peso mas devido a perda de msuculo, nota-se a reduçao de proteina na alimentaçao certamente, aumento de MG nao gostei
9/4/2021	74,70	36,2%	45,20	44,9%	29,2	6,5	53	2	2.4	Pré-obesidade	Elevado (Risco para a Saúde)	ja gostei mais desta semana mas acredito que ainda é capaz de melhor! vamos continuar a luta
9/11/2021	74,40	36,2%	45,00	44,9%	29,1	6,5	53	2	2,4	Pré-obesidade	Elevado (Risco para a Saúde)	ligeira descida, mas foi descida é que importa
9/19/2021	74,40	36,3%	45,00	44,8%	29,1	6,5	53	2	2,4	Pré-obesidade	Elevado (Risco para a Saúde)	estava a espera de pior, mas nao podemos tirar o pé do acelerador! nao podemos desistir nem vacilar vamos a isso
10/9/2021	73,10	36,9%	43,80	44,3%	28,6	6,5	55	2	2.3	Pré-obesidade	Elevado (Risco para a Saúde)	peso continua a baixar nao estamos mal! mas temos de baixar também a MG! vamos a isso 
10/16/2021	73,20	36,0%	43,80	45,0%	28,6	6,5	52	2	2.4	Pré-obesidade	Elevado (Risco para a Saúde)	boa pesagem! aquele vermelho no peso a estragar por 100gr (foi a pausa da caminhada!!) excelente, com idade metabolica a baixar muito bom!
10/23/2021	72,80	35,5%	44,60	45,3%	28,4	6,5	51	2	2,4	Pré-obesidade	Elevado (Risco para a Saúde)	já tinha saudades destas pesagens! tudo verde! mais kcal menos peso espetacular VAMOS CONTINUAR!!
12/13/2021	74,80	32,0%	48,50	49,9%	29,2	6,5	-	-	-	Pré-obesidade	Elevado (Risco para a Saúde)	pesagem da nutrição, valores obtidos através do relatório da nutricionista 
1/25/2022	71,50	35,6%	43,70	45,2%	27,9	6,5	51	2	2,3	Pré-obesidade	Elevado (Risco para a Saúde)	peso a menos mas devido a perda de maassa muscular, aumento de MG, temos de inverter estes valores 
2/4/2022	70,80	36,1%	43,00	44,7%	27,7	6,5	52	2	2.3	Pré-obesidade	Elevado (Risco para a Saúde)	baixa de peso, mas, balanço negativo, perda de MM e aumento de MG, contudo positivo porque o objetivo é perder peso!!
2/12/2022	71,30	36,3%	42,80	44,3%	27,9	6,5	54	2	2.3	Pré-obesidade	Elevado (Risco para a Saúde)	aumento de todos os valores (maus) e redução de massa muscular
2/19/2022	71,80	35,2%	44,20	44,3%	28,0	6,5	50	2	2.4	Pré-obesidade	Elevado (Risco para a Saúde)	ligeira recuperação, aumento de peso mas devido a MM, redução de MG
2/26/2022	70,90	36,2%	43,00	44,7%	27,7	6,5	52	2	2,3	Pré-obesidade	Elevado (Risco para a Saúde)	perda de peso, positivo! redução de MM e aumento de MG negativo! mas objetivo principal cumprido, so é pena o aumento de MG  
3/7/2022	71,70	36,3%	43,30	44,6%	28,0	6,5	53	2	2,3	Pré-obesidade	Elevado (Risco para a Saúde)	aumento de peso e massa gorda , semana negativa
3/12/2022	70,60	36,1%	42,90	44,7%	27,6	6,5	52	2	2,3	Pré-obesidade	Elevado (Risco para a Saúde)	redução de peso e de massa gorda, ligeira descida de MM e baixa de idade metabolica, alguma recuperação da semana anterior!!
3/18/2022	70,20	34,8%	43,40	45,6%	27,4	6	49	2	2,3	Pré-obesidade	Elevado (Risco para a Saúde)	TUDO VERDE!! quando se quer acontece! mesmo sem treinos so controlo alimentar temos estes resultados agora aliado a um bom treino imagine!!
3/26/2022	70,80	34,7%	43,90	45,8%	27,7	6	49	2	2,3	Pré-obesidade	Elevado (Risco para a Saúde)	peso aumenta, menos MG!
4/8/2022	69,90	34,6%	43,40	45,7%	27,3	6	48	2	2,3	Pré-obesidade	Elevado (Risco para a Saúde)	bons resultados de encontro ao objetivo, apenas alguma perda de massa muscular, nada de importante
4/16/2022	69,50	35,1%	42,90	45,4%	27,1	6	49	2	2,3	Pré-obesidade	Elevado (Risco para a Saúde)	igual ao anterior, esta no bom caminho!! 
4/22/2022	69,30	33,6%	43,70	46,4%	27,1	6	45	5	2,3	Pré-obesidade	Elevado (Risco para a Saúde)	QUE RESULTADOS INCRIVEIS! ATÉ PELA 1ª VEZ PERFIL 5!! PARABENS!!! 
5/7/2022	68,20	31,8%	44,20	47,7%	26,6	5,5	41	5	2,4	Pré-obesidade	Nível Médio (Atenção)	mais uma semana com resultados fantasticos a confirmar os ultimos e a melhorar!!
5/13/2022	67,70	33,8%	42,50	46,2%	26,4	6	46	5	2,3	Pré-obesidade	Elevado (Risco para a Saúde)	semana negativa de valores extra fora o peso corporal, aumento de valores importantes que deveriam continuar a descer, vamos ver na proxima!
5/20/2022	68,70	32,2%	44,20	47,4%	26,8	5,5	42	5	2,4	Pré-obesidade	Elevado (Risco para a Saúde)	aumento de peso mas redução de MG e aumento de MM muito bom! enorme descidade idade metabolica
5/27/2022	68,40	32,7%	43,70	47,0%	26,7	6	43	5	2,3	Pré-obesidade	Elevado (Risco para a Saúde)	ligeira redução de peso às custas de perda de MM, nao é positivo
6/3/2022	66,80	33,6%	42,10	46,2%	26,1	6	45	5	2,3	Pré-obesidade	Elevado (Risco para a Saúde)	nova boa redução de peso mas ligeira subida de MG, id met continua a subir vamos tentar baixar 
7/30/2022	65,70	33,3%	41,50	46,3%	25,7	5,5	44	5	2,2	Pré-obesidade	Elevado (Risco para a Saúde)	continua com perda de peso incrivel, alguma MM a menos mas é perfeitamente normal. é continuar até onde se sentir bem!! depois tonificar!
8/27/2022	64,30	32,9%	41,00	46,6%	25,1	5,5	43	5	2,2	Pré-obesidade	Elevado (Risco para a Saúde)	perda de pso mantem se de forma constante, contudo ligeira perda de MM tambem de forma constante
9/11/2022	64,50	32,3%	41,40	47,0%	25,2	5,5	41	5	2,2	Pré-obesidade	Elevado (Risco para a Saúde)	ligeira subida de peso, nada de especial, baixa de MG aumento de MM (o que provocou aumento de peso)
9/16/2022	63,80	31,0%	41,70	47,9%	24,9	5	38	5	2,2	Peso Normal	Nível Médio (Atenção)	nao posso pedir mais, tudo a verde com resultados como nunca teve, fantastico
10/22/2022	63,80	29,4%	42,80	49,1%	24,9	5	34	5	2,3	Peso Normal	Nível Médio (Atenção)	peso extamente o mesmo mas com melhoria de massa gorda e massa muscular! continua no bom caminho. 
11/3/2022	63,50	28,2%	43,20	50,0%	24,8	4,5	32	5	2,3	Peso Normal	Nível Médio (Atenção)	mais um novo record! melhor pesagem de sempre batida. excelente!
11/23/2022	62,10	29,1%	41,80	49,1%	24,3	4,5	33	5	2,2	Peso Normal	Nível Médio (Atenção)	primeiros vermelhos de algum tempo é pena!
12/1/2022	62,90	29,0%	45,10	52,2%	24,6	4	22	5	2,4	Peso Normal	Nível Médio (Atenção)	MUDANÇA DE BALANÇA. faltam muitos valores 
12/23/2022	63,20	24,6%	45,20	52,2%	24,7	4	24	5	2,4	Peso Normal	Saudável e em Boa Forma	pesagem um pouco estranha.com ligeiro aumento de peso, muita baixa de MG e idade metabolica a aumentar, vamos continuar a avaliar
1/13/2023	63,60	24,9%	45,40	51,9%	24,8	4	25	5	2,4	Peso Normal	Saudável e em Boa Forma	aumento de peso, massa gorad e idade metabolica, pesagem balanço negativo
1/23/2023	62,80	24,9%	45,10	52,3%	24,5	4	24	5	2,4	Peso Normal	Saudável e em Boa Forma	faltam alguns valores importante, contudo acredito que a MG tenha baixado pela idade metabolica, bons resultados
1/29/2023	61,70	24,7%	44,10	52,0%	24,1	4	24	5	2,4	Peso Normal	Saudável e em Boa Forma	continua com baixa de peso e MG, estamos no bom caminho mesmo doente e com menos treinos,  mas nota-se pela MM a menos
2/3/2023	61,30	22,9%	44,60	52,0%	23,9	4	22	5	2,4	Peso Normal	Saudável e em Boa Forma	tente ver sempre os valores todos, mais uma baixa de peso e MG. aumento ligeiro de MM
2/20/2023	62,50	23,2%	45,60	53,0%	24,4	4	22	5	2,4	Peso Normal	Saudável e em Boa Forma	aumento de peso, de massa gorda, bom aumento de MM
2/24/2023	62,70	23,3%	45,70	52,9%	24,5	4	22	5	2,4	Peso Normal	Saudável e em Boa Forma	aumento de peso, e de MG
3/2/2023	61,70	23,2%	45,00	52,9%	24,1	4	22	5	2,4	Peso Normal	Saudável e em Boa Forma	redição de peso e de MG ligeira mas baixou vamos continuar a baixar
3/11/2023	62,30	21,4%	46,50	54,1%	24,3	3	18	8	2,5	Peso Normal	Saudável e em Boa Forma	QUE PESAGEM!! VALORES MUITO MUITO BONS
3/17/2023	62,80	21,2%	47,00	54,3%	24,5	3	18	8	2,5	Peso Normal	Saudável e em Boa Forma	
3/25/2023	62,00	20,8%	46,60	54,5%	24,2	3	17	8	2,5	Peso Normal	Muito Magro/a (Foco Performance)	
3/31/2023	62,00	20,8%	46,60	54,5%	24,2	2,5	17		2,5	Peso Normal	Muito Magro/a (Foco Performance)	
4/24/2023	62,10	22,1%	46,00	54,0%	24,3	3	20	8	2,5	Peso Normal	Saudável e em Boa Forma	
5/25/2023	59,60	20,8%	44,80	54,4%	23,3	3		8	2,4	Peso Normal	Muito Magro/a (Foco Performance)	
10/2/2024	65,50	33,2%	41,40	46,5%	25,6	6	44	5	2,2	Pré-obesidade	Elevado (Risco para a Saúde)	
10/11/2024	62,80	33,1%	39,80	46,4%	24,5	5	43	5	2,1	Peso Normal	Elevado (Risco para a Saúde)	
2/18/2025	65,60	33,3%	41,50	46,4%	25,6	6	45	5	2,2	Pré-obesidade	Elevado (Risco para a Saúde)	
3/7/2025	65,30	33,6%	41,10	46,1%	25,5	6	45	5	2,2	Pré-obesidade	Elevado (Risco para a Saúde)	
3/21/2025	63,70	31,5%	41,40	46,0%	24,9	6	40	5	2,2	Peso Normal	Nível Médio (Atenção)	
3/28/2025	62,60	33,2%	39,70	46,2%	24,5	6	43	5	2,1	Peso Normal	Elevado (Risco para a Saúde)	
4/4/2025	60,60	32,8%	38,60	46,3%	23,7	5	42	5	2,1	Peso Normal	Elevado (Risco para a Saúde)	
4/11/2025	60,20	29,1%	40,50	46,0%	23,5	5	33	5	2,2	Peso Normal	Nível Médio (Atenção)	antes férias com lesao joelho
4/23/2025	59,60	30,6%	39,30	46,0%	23,3	5	36	5	2,1	Peso Normal	Nível Médio (Atenção)	pos ferias
5/2/2025	59,70	28,9%	40,20	49,1%	23,3	5	33	5	2,2	Peso Normal	Nível Médio (Atenção)	antes de novas férias (estas mais longas)
5/30/2025	58,70	26,1%	41,20	51,1%	22,9	4	27	5	2,2	Peso Normal	Nível Médio (Atenção)	`;

function parseNumber(value: string): number | null {
    if (!value || value === '-' || value.trim() === '') return null;
    // Remove % sign and replace comma with dot
    const cleaned = value.replace('%', '').replace(',', '.').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

function parseDate(dateStr: string): Date {
    // Format: M/D/YYYY (US format)
    const [month, day, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

interface PesagemRecord {
    date: Date;
    peso: number | null;
    percentualMG: number | null;
    mm: number | null;
    h2o: number | null;
    imc: number | null;
    gordVisceral: number | null;
    idMetabolica: number | null;
    massaOssea: number | null;
    resultadoIMC: string | null;
    resultadoPercentMG: string | null;
    notas: string | null;
    height: number | null;
}

async function main() {
    Logger.info('Migration', `Commencing pesagens import protocol for Anabela Leitão (UUID: ${USER_UUID}).`);

    // Parse data
    const lines = rawData.trim().split('\n');
    const records: PesagemRecord[] = [];

    for (const line of lines) {
        const parts = line.split('\t');
        if (parts.length < 11) continue;

        const [
            dateStr,
            pesoStr,
            percentMGStr,
            mmStr,
            h2oStr,
            imcStr,
            gordVisceralStr,
            idMetabolicaStr,
            _unknown, // This seems to be a profile number (2, 5, 8)
            massaOsseaStr,
            resultadoIMC,
            resultadoPercentMG,
            ...notasParts
        ] = parts;

        records.push({
            date: parseDate(dateStr),
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

    Logger.success('Migration', `Import phase concluded: Successfully provisioned ${result.count} pesagens records for Anabela Leitão.`);

    // Verify
    const finalCount = await db.pesagem.count({ where: { user_uuid: USER_UUID } });
    Logger.info('Migration', `Final audit check: Total active pesagens is now ${finalCount}.`);
}

main()
    .catch(e => Logger.error('Migration', 'Critical failure encountered during data import execution sequence.', e))
    .finally(() => db.$disconnect());

