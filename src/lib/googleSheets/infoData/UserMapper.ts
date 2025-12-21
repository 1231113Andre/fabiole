import { InfoDataRow } from '@/types/user';
import { calculateAge } from '../utils';

/**
 * Handles data transformation between Google Sheets rows and Domain objects.
 * Pure stateless transformations for maximum performance.
 */
export class UserMapper {
    /**
     * Maps a raw Google Sheets row to a strongly typed InfoDataRow object.
     * Performs basic validation and sanitation.
     * 
     * @param row Raw array from Google Sheets
     * @returns InfoDataRow or null if invalid
     */
    static toDomain(row: any[]): InfoDataRow | null {
        if (!row || row.length < 3) return null; // Minimal validation (need at least email)

        const email = (row[2] || '').trim();
        if (!email) return null; // Email is mandatory

        const birth = (row[4] || '').trim();
        // Age is calculated on-the-fly from birth date, not stored
        // UUID is in column G (index 6)
        const uuid = (row[6] || '').trim();

        return {
            name: (row[0] || '').trim(),
            surname: (row[1] || '').trim(),
            email: email, // Email kept as-is, normalization happens in repository logic if needed, but standard is usually lowercase there
            password: (row[3] || '').trim(),
            birth: birth,
            uuid: uuid
        };
    }

    /**
     * Maps an InfoDataRow domain object to a Google Sheets row array.
     * Ensures correct column order.
     * 
     * @param user InfoDataRow object
     * @returns Array ready for Google Sheets API
     */
    static toRow(user: InfoDataRow): string[] {
        return [
            user.name,
            user.surname,
            user.email,
            user.password,
            user.birth,
            '', // Age is calculated, not stored
            user.uuid || ''
        ];
    }
}
