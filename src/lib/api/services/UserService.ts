import { db } from '@/lib/db/client';
import { UserSheetData, PersonalInfo, Pesagem, PerimetroCorporal, AvaliacaoFisica } from '@/lib/types/dashboard';
import { classifyBMI, classifyBodyFat, calculateBMI, calculateAge } from '@/lib/body-metrics';
import { format } from 'date-fns';
import {
  getUserData as getCachedUserData,
  setUserData as setCachedUserData,
  clearUserData as clearCachedUserData,
  CacheKeys as UserCacheKeys,
} from '@/lib/cache/userCache';
import { redisCache } from '@/lib/cache/redisCache';
import { deduplicateRequest } from '@/lib/cache/requestDeduplication';
import { Logger } from '@/lib/utils/logger';

export interface GetUserDataOptions {
  /** Force refresh (bypass cache) */
  forceRefresh?: boolean;
  /** Limit for pesagens (default: 100, use null for all) */
  pesagensLimit?: number | null;
  /** Limit for perimetros (default: 100, use null for all) */
  perimetrosLimit?: number | null;
  /** Limit for avaliacoes (default: 100, use null for all) */
  avaliacoesLimit?: number | null;
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
    const pesagensLimit = options.pesagensLimit ?? 100; // Default limit: 100 records
    const perimetrosLimit = options.perimetrosLimit ?? 100;
    const avaliacoesLimit = options.avaliacoesLimit ?? 100;

    // Build cache key that includes limits (using consistent cache key helper)
    const limitsKey = `p${pesagensLimit ?? 'all'}:pe${perimetrosLimit ?? 'all'}:a${avaliacoesLimit ?? 'all'}`;
    const cacheKey = UserCacheKeys.userDataWithLimits(email, limitsKey);

    // If force refresh, clear cache
    if (forceRefresh) {
      await clearCachedUserData(email);
      Logger.info('UserService', `Manual cache invalidation triggered for user: ${email}.`);
    }

    // Check cache first (unless force refresh)
    // Use redisCache directly since cache key includes limits
    if (!forceRefresh) {
      const cached = await redisCache.get<UserSheetData>(cacheKey);
      if (cached) {
        Logger.info('UserData API', `Cache hit: Successfully retrieved data for ${email} with limits ${limitsKey}.`);
        return cached;
      }
    }

    // Use request deduplication to prevent duplicate API calls
    return deduplicateRequest<UserSheetData>(cacheKey, async () => {
      // 1. Fetch User from Prisma with optional limits
      Logger.info('Database', `Executing PostgreSQL lookup for user profile: ${email}.`);

      // Build include with optional limits
      const includeConfig: {
        pesagens: { orderBy: { date: 'desc' }; take?: number };
        perimetros: { orderBy: { date: 'desc' }; take?: number };
        avaliacoes: { orderBy: { date: 'desc' }; take?: number };
      } = {
        pesagens: { orderBy: { date: 'desc' } },
        perimetros: { orderBy: { date: 'desc' } },
        avaliacoes: { orderBy: { date: 'desc' } }
      };

      // Add limits if specified
      if (pesagensLimit !== null) {
        includeConfig.pesagens.take = pesagensLimit;
      }
      if (perimetrosLimit !== null) {
        includeConfig.perimetros.take = perimetrosLimit;
      }
      if (avaliacoesLimit !== null) {
        includeConfig.avaliacoes.take = avaliacoesLimit;
      }

      const userDB = await db.user.findUnique({
        where: { email },
        include: includeConfig
      });

      if (!userDB) {
        Logger.error('Database', `User not found: ${email}.`);
        throw new Error('User not found in database');
      }

      Logger.success('Database', `Identity confirmed: ${userDB.name} ${userDB.surname} (${userDB.email}).`);

      // Check account status - block access if suspended or banned
      if (userDB.status === 'SUSPENDED' || userDB.status === 'BANNED') {
        Logger.warn('Security', `Access denied for ${userDB.status} user: ${email}`);
        const error = new Error(`A sua conta encontra-se ${userDB.status === 'SUSPENDED' ? 'suspensa' : 'banida'}. Contacte o administrador.`);
        (error as any).code = 'ACCOUNT_LOCKED';
        throw error;
      }

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
        age: userDB.birth ? String(calculateAge(userDB.birth) ?? '') : '',
        // Legacy
        notas: userDB.notes || '',
        inicio: userDB.gender || '',
        avatarUrl: userDB.avatarUrl || undefined,
        gender: userDB.gender || 'male',
        birth: userDB.birth ? format(userDB.birth, 'yyyy-MM-dd') : ''
      };

      // User gender for %MG classification
      const userGender = userDB.gender || 'M';

      const pesagens: Pesagem[] = userDB.pesagens.map((p) => {
        // Auto-calculate BMI if not present but we have weight and height
        let imcValue: number | null = p.imc ? Number(p.imc) : null;
        if (imcValue === null && p.peso && p.height) {
          imcValue = calculateBMI(Number(p.peso), Number(p.height));
        }

        const mgValue = p.percentualMG ? Number(p.percentualMG) : null;
        const userAge = userDB.birth ? calculateAge(userDB.birth) : null;

        // Use existing result if available, otherwise auto-classify (age-based thresholds)
        const resultadoIMC = p.resultadoIMC || classifyBMI(imcValue);
        const resultadoPercentualMG = p.resultadoPercentMG || classifyBodyFat(mgValue, userGender, userAge);

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

          notas: p.notas || '',
          msRight: p.msRight ? Number(p.msRight).toFixed(2).replace('.', ',') : '',
          msLeft: p.msLeft ? Number(p.msLeft).toFixed(2).replace('.', ',') : '',
          miRight: p.miRight ? Number(p.miRight).toFixed(2).replace('.', ',') : '',
          miLeft: p.miLeft ? Number(p.miLeft).toFixed(2).replace('.', ',') : ''
        };
      });

      const perimetros: PerimetroCorporal[] = userDB.perimetros.map((p) => ({
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

      const avaliacoes: AvaliacaoFisica[] = userDB.avaliacoes.map((a) => ({
        date: a.date ? format(a.date, 'dd/MM/yyyy') : '',
        pushUps: a.pushUps?.toString() || '',
        sitUps: a.sitUps?.toString() || '',
        mile: a.mile || '',
        mileResult: a.mileResult || '',
        pushUpsResult: a.pushUpsResult || '',
        notes: a.notes || ''
      }));

      const result: UserSheetData = {
        personalInfo,
        pesagens,
        perimetros,
        avaliacoes,
        referenceTables,
      };

      // Cache the result with the limits-aware cache key
      // Use redisCache directly and also cache in userCache with default key (for backward compatibility)
      await Promise.all([
        redisCache.set(cacheKey, result, 60), // 60 seconds TTL for Redis
        setCachedUserData(email, result) // Also cache with default key for backward compatibility
      ]);

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
      await clearCachedUserData(email);
    } catch (error) {
      // Ignore
    }
  }
}





