import { db } from './src/lib/db/client';

async function checkColumn() {
    try {
        const result = await db.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'avatarUrl';
    `;
        console.log('Column check result:', result);
    } catch (error) {
        console.error('Error checking column:', error);
    } finally {
        await db.$disconnect();
    }
}

checkColumn();
