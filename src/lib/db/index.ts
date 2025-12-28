/**
 * @fileoverview Database module exports
 * @description Central entry point for database access
 * 
 * @example
 * import { db, userRepository, pesagemRepository } from '@/lib/db';
 */

export { db, disconnectDB } from './client';
export * from './repositories';
