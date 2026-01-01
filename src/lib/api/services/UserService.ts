import { db } from '@/lib/db/client';
import { UserSheetData, PersonalInfo, Pesagem, PerimetroCorporal, AvaliacaoFisica } from '@/lib/types/dashboard';
import { classifyBMI, classifyBodyFat, calculateBMI } from '@/lib/utils/bodyMetrics';
import { format, differenceInYears } from 'date-fns';
import {
  getUserData as getCachedUserData,
  setUserData as setCachedUserData,
  clearUserData as clearCachedUserData,
} from '@/lib/cache/userCache';
import { deduplicateRequest } from '@/lib/cache/requestDeduplication';
import { Logger } from '@/lib/utils/logger';

export interface GetUserDataOptions {
  /** Force refresh (bypass cache) */
  forceRefresh?: boolean;
}

/**
 * Calculates age from date string or Date object
 */
function calculateAge(birthDate: string | Date | null): string {
  if (!birthDate) return '';
  const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  return differenceInYears(new Date(), date).toString();
}

/**
 * User service
 * Handles user data operations with caching and request deduplication
 */
export class UserService {
  /**
   * Get user sheet data with caching and request deduplication
   */
  static async getUserData(email: string, options: GetUserDataOptions = {}): Promise<UserSheetData> {
    const forceRefresh = options.forceRefresh ?? false;

    // If force refresh, clear cache
    if (forceRefresh) {
      clearCachedUserData(email);
      Logger.info('UserService', `Manual cache invalidation triggered for user: ${email}.`);
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = getCachedUserData<UserSheetData>(email);
      if (cached) {
        Logger.info('UserData API', `Memory cache hit: Successfully retrieved data for ${email}.`);
        return cached;
      }
    }

    // Use request deduplication to prevent duplicate API calls
    const cacheKey = `user:data:${email.toLowerCase()}`;
    return deduplicateRequest<UserSheetData>(cacheKey, async () => {
      // 1. Fetch User from Prisma
      Logger.info('Database', `Executing PostgreSQL lookup for user profile: ${email}.`);
      let userDB = await db.user.findUnique({
        where: { email },
        include: {
          pesagens: { orderBy: { date: 'desc' } }, // Changed to desc for latest first, similar to Sheet logic typically
          perimetros: { orderBy: { date: 'desc' } },
          avaliacoes: { orderBy: { date: 'desc' } }
        }
      });

      if (!userDB) {
        Logger.error('Database', `User not found: ${email}.`);
        throw new Error('User not found in database');
      }

      Logger.success('Database', `Identity confirmed: ${userDB.name} ${userDB.surname} (${userDB.email}).`);
      Logger.info('UserService', `Profile metrics synchronized: ${userDB.pesagens.length} weigh-ins, ${userDB.perimetros.length} circumferences, ${userDB.avaliacoes.length} physical assessments.`);

      // 2. Reference Tables - skipping external fetch to remove GS dependency
      const referenceTables = {};

      // 3. Map Prisma -> UserSheetData
      const personalInfo: PersonalInfo = {
        userName: userDB.name,
        userSurname: userDB.surname,
        userEmail: userDB.email,
        userPhone: userDB.phone || '',
        userBirth: userDB.birth ? format(userDB.birth, 'dd/MM/yyyy') : '',
        trainingCredit: userDB.trainingCredit.toString().replace('.', ','),
        trainingsScheduled: userDB.trainingsScheduled.toString(),
        debtValue: userDB.debtValue.toString().replace('.', ','),
        paid: userDB.paid,
        q1: userDB.q1 || '',
        q2: userDB.q2 || '',
        q3: userDB.q3 || '',
        q4: userDB.q4 || '',
        goals: userDB.goals || '',
        notes: userDB.notes || '',
        age: userDB.birth ? calculateAge(userDB.birth) : '',
        // Legacy
        notas: userDB.notes || '',
        inicio: userDB.gender || '',
        avatarUrl: userDB.avatarUrl || undefined
      };

      // User gender for %MG classification
      const userGender = userDB.gender || 'M';

      const pesagens: Pesagem[] = userDB.pesagens.map((p: typeof userDB.pesagens[number]) => {
        // Auto-calculate BMI if not present but we have weight and height
        let imcValue: number | null = p.imc ? Number(p.imc) : null;
        if (imcValue === null && p.peso && p.height) {
          imcValue = calculateBMI(Number(p.peso), Number(p.height));
        }

        const mgValue = p.percentualMG ? Number(p.percentualMG) : null;

        // Use existing result if available, otherwise auto-classify
        const resultadoIMC = p.resultadoIMC || classifyBMI(imcValue);
        const resultadoPercentualMG = p.resultadoPercentMG || classifyBodyFat(mgValue, userGender);

        return {
          data: p.date ? format(p.date, 'dd/MM/yyyy') : '',
          peso: p.peso ? Number(p.peso).toFixed(1).replace('.', ',') : '',
          percentualMG: p.percentualMG ? Number(p.percentualMG).toFixed(1).replace('.', ',') : '',
          MM: p.mm ? Number(p.mm).toFixed(1).replace('.', ',') : '',
          H2O: p.h2o ? Number(p.h2o).toFixed(1).replace('.', ',') : '',
          IMC: imcValue !== null ? imcValue.toFixed(1).replace('.', ',') : '',
          gordVisceral: p.gordVisceral ? Number(p.gordVisceral).toFixed(0) : '',
          IDMetabolica: p.idMetabolica ? Number(p.idMetabolica).toFixed(0) : '',
          massaOssea: p.massaOssea ? Number(p.massaOssea).toFixed(1).replace('.', ',') : '',
          height: p.height ? Number(p.height).toFixed(0) : '',
          resultadoIMC,
          resultadoPercentualMG,
          notas: p.notas || ''
        };
      });

      const perimetros: PerimetroCorporal[] = userDB.perimetros.map((p: typeof userDB.perimetros[number]) => ({
        date: p.date ? format(p.date, 'dd/MM/yyyy') : '',
        msRight: p.msRight?.toString().replace('.', ',') || '',
        msRightFlex: p.msRightFlex?.toString().replace('.', ',') || '',
        msLeft: p.msLeft?.toString().replace('.', ',') || '',
        msLeftFlex: p.msLeftFlex?.toString().replace('.', ',') || '',
        chest: p.chest?.toString().replace('.', ',') || '',
        waist: p.waist?.toString().replace('.', ',') || '',
        abdomen: p.abdomen?.toString().replace('.', ',') || '',
        hips: p.hips?.toString().replace('.', ',') || '',
        thighR: p.thighR?.toString().replace('.', ',') || '',
        thighL: p.thighL?.toString().replace('.', ',') || ''
      }));

      const avaliacoes: AvaliacaoFisica[] = userDB.avaliacoes.map((a: typeof userDB.avaliacoes[number]) => ({
        date: a.date ? format(a.date, 'dd/MM/yyyy') : '',
        pushUps: a.pushUps?.toString() || '',
        sitUps: a.sitUps?.toString() || '',
        mile: a.mile || '',
        mileResult: a.mileResult || '',
        notes: a.notes || ''
      }));

      const result: UserSheetData = {
        personalInfo,
        pesagens,
        perimetros,
        avaliacoes,
        referenceTables,
      };

      // Cache the result
      setCachedUserData(email, result);

      return result;
    });
  }

  /**
   * Refresh user data in background (for stale-while-revalidate)
   */
  private static async refreshUserDataInBackground(email: string): Promise<void> {
    try {
      // In background refresh, we just invalidate cache or re-fetch
      // For now, simpler to just invalidate so next request fetches fresh
      clearCachedUserData(email);
    } catch (error) {
      // Ignore
    }
  }
}





