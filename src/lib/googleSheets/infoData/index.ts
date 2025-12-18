export * from './UserRepository';
export * from './UserMapper';
export * from './UserCache';

import { userRepository } from './UserRepository';
import { InfoDataRow } from '@/types/user';

// Functional facade for backward compatibility and ease of use

export const initializeInfoDataSheet = () => userRepository.initialize();

export const getAllInfoDataUsers = () => userRepository.getAll();

export const findUserInInfoData = (email: string, password: string) =>
    userRepository.findByCredentials(email, password);

export const userExistsInInfoData = (email: string) => userRepository.exists(email);

export const addUserToInfoData = (userData: InfoDataRow) => userRepository.add(userData);
