import { db } from './src/lib/db/client';

async function addColumn() {
    try {
        console.log('Adding avatarUrl column to users table...');
        await db.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatarUrl" VARCHAR(512);`);
        console.log('Column added successfully or already exists.');
    } catch (error) {
        console.error('Error adding column:', error);
    } finally {
        await db.$disconnect();
    }
}

addColumn();
