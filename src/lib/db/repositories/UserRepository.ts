/**
 * @fileoverview User repository for database operations
 * @description Handles all user-related CRUD operations with
 *              optimized queries and proper error handling.
 */

import { User, Prisma } from '@prisma/client';
import { BaseRepository, Result, PaginationParams, PaginatedResult } from './BaseRepository';
import { Logger } from '@/lib/utils/logger';
import { clearUserData } from '@/lib/cache/userCache';

/**
 * User creation data transfer object
 */
export interface CreateUserDTO {
    email: string;
    password: string;
    name: string;
    surname: string;
    birth: Date;
    phone?: string;
}

/**
 * User update data transfer object
 */
export interface UpdateUserDTO {
    name?: string;
    surname?: string;
    phone?: string;
    birth?: Date;
    trainingCredit?: number;
    trainingsScheduled?: number;
    debtValue?: number;
    paid?: string;
    q1?: string;
    q2?: string;
    q3?: string;
    q4?: string;
    goals?: string;
    notes?: string;
    gender?: string;
}

/**
 * User without password for safe returns
 */
export type SafeUser = Omit<User, 'password'>;

/**
 * User Repository
 * Handles all user database operations
 */
export class UserRepository extends BaseRepository {
    private static instance: UserRepository;

    private constructor() {
        super();
    }

    /**
     * Get singleton instance
     */
    static getInstance(): UserRepository {
        if (!UserRepository.instance) {
            UserRepository.instance = new UserRepository();
        }
        return UserRepository.instance;
    }

    /**
     * Find user by email (returns password for auth)
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.db.user.findUnique({
            where: { email: email.toLowerCase() },
        });
    }

    /**
     * Find user by ID
     */
    async findById(id: string): Promise<SafeUser | null> {
        const user = await this.db.user.findUnique({
            where: { id },
            select: this.safeUserSelect(),
        });
        return user;
    }

    /**
     * Find user by email (safe - no password)
     */
    async findByEmailSafe(email: string): Promise<SafeUser | null> {
        return this.db.user.findUnique({
            where: { email: email.toLowerCase() },
            select: this.safeUserSelect(),
        });
    }

    /**
     * Create new user
     */
    async create(data: CreateUserDTO): Promise<Result<SafeUser>> {
        return this.execute(async () => {
            const user = await this.db.user.create({
                data: {
                    email: data.email.toLowerCase(),
                    password: data.password,
                    name: data.name.toUpperCase(),
                    surname: data.surname.toUpperCase(),
                    birth: data.birth,
                    phone: data.phone || null,
                },
                select: this.safeUserSelect(),
            });
            return user;
        });
    }

    /**
     * Update user by ID
     */
    async update(id: string, data: UpdateUserDTO): Promise<Result<SafeUser>> {
        return this.execute(async () => {
            const updateData: Prisma.UserUpdateInput = {};

            if (data.name !== undefined) updateData.name = data.name.toUpperCase();
            if (data.surname !== undefined) updateData.surname = data.surname.toUpperCase();
            if (data.phone !== undefined) updateData.phone = data.phone;
            if (data.birth !== undefined) updateData.birth = data.birth;
            if (data.trainingCredit !== undefined) updateData.trainingCredit = data.trainingCredit;
            if (data.trainingsScheduled !== undefined) updateData.trainingsScheduled = data.trainingsScheduled;
            if (data.debtValue !== undefined) updateData.debtValue = data.debtValue;
            if (data.paid !== undefined) updateData.paid = data.paid;
            if (data.q1 !== undefined) updateData.q1 = data.q1;
            if (data.q2 !== undefined) updateData.q2 = data.q2;
            if (data.q3 !== undefined) updateData.q3 = data.q3;
            if (data.q4 !== undefined) updateData.q4 = data.q4;
            if (data.goals !== undefined) updateData.goals = data.goals;
            if (data.notes !== undefined) updateData.notes = data.notes;
            if (data.gender !== undefined) updateData.gender = data.gender;

            const user = await this.db.user.update({
                where: { id },
                data: updateData,
                select: this.safeUserSelect(),
            });

            // Clear cache for this user (by email) - await to prevent race conditions
            await clearUserData(user.email);
            Logger.info('Cache', `Stale data purge: Memory cache evicted for user ${user.email} following database update.`);

            return user;
        });
    }

    /**
     * Update user password
     */
    async updatePassword(id: string, hashedPassword: string): Promise<Result<void>> {
        return this.execute(async () => {
            await this.db.user.update({
                where: { id },
                data: { password: hashedPassword },
            });
        });
    }

    /**
     * Update user email
     */
    async updateEmail(id: string, newEmail: string): Promise<Result<SafeUser>> {
        return this.execute(async () => {
            const user = await this.db.user.update({
                where: { id },
                data: { email: newEmail.toLowerCase() },
                select: this.safeUserSelect(),
            });
            return user;
        });
    }

    /**
     * Delete user
     */
    async delete(id: string): Promise<Result<void>> {
        return this.execute(async () => {
            await this.db.user.delete({ where: { id } });
        });
    }

    /**
     * Check if email exists
     */
    async emailExists(email: string): Promise<boolean> {
        const count = await this.db.user.count({
            where: { email: email.toLowerCase() },
        });
        return count > 0;
    }

    /**
     * Get all users with pagination
     */
    async findAll(params: PaginationParams = {}): Promise<PaginatedResult<SafeUser>> {
        const { skip, take } = this.buildPagination(params);

        const [items, total] = await Promise.all([
            this.db.user.findMany({
                skip,
                take,
                select: this.safeUserSelect(),
                orderBy: { createdAt: 'desc' },
            }),
            this.db.user.count(),
        ]);

        return this.buildPaginatedResult(items, total, params);
    }

    /**
     * Search users by name or email
     */
    async search(query: string, params: PaginationParams = {}): Promise<PaginatedResult<SafeUser>> {
        const { skip, take } = this.buildPagination(params);
        const searchQuery = query.toLowerCase();

        const where: Prisma.UserWhereInput = {
            OR: [
                { email: { contains: searchQuery, mode: 'insensitive' } },
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { surname: { contains: searchQuery, mode: 'insensitive' } },
            ],
        };

        const [items, total] = await Promise.all([
            this.db.user.findMany({
                where,
                skip,
                take,
                select: this.safeUserSelect(),
                orderBy: { createdAt: 'desc' },
            }),
            this.db.user.count({ where }),
        ]);

        return this.buildPaginatedResult(items, total, params);
    }

    /**
     * Get user with all related data
     */
    async findWithRelations(id: string): Promise<User & {
        pesagens: { id: number; date: Date }[];
        perimetros: { id: number; date: Date }[];
        avaliacoes: { id: number; date: Date }[];
    } | null> {
        return this.db.user.findUnique({
            where: { id },
            include: {
                pesagens: {
                    select: { id: true, date: true },
                    orderBy: { date: 'desc' },
                    take: 10,
                },
                perimetros: {
                    select: { id: true, date: true },
                    orderBy: { date: 'desc' },
                    take: 10,
                },
                avaliacoes: {
                    select: { id: true, date: true },
                    orderBy: { date: 'desc' },
                    take: 10,
                },
            },
        });
    }

    /**
     * Safe user select (excludes password)
     */
    private safeUserSelect(): Prisma.UserSelect {
        return {
            id: true,
            email: true,
            name: true,
            surname: true,
            phone: true,
            birth: true,
            trainingCredit: true,
            trainingsScheduled: true,
            debtValue: true,
            paid: true,
            q1: true,
            q2: true,
            q3: true,
            q4: true,
            goals: true,
            notes: true,
            gender: true,
            createdAt: true,
            updatedAt: true,
        };
    }
}

// Export singleton instance
export const userRepository = UserRepository.getInstance();
