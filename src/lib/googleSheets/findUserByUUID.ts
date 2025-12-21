/**
 * Find user by UUID in infoData
 * @description Searches the infoData sheet for a user matching UUID
 * 
 * @param {string} uuid - User's UUID
 * @returns {Promise<{user: InfoDataRow; rowIndex: number} | null>} User record and row index if found
 */
export async function findUserByUUID(uuid: string): Promise<{
    user: import('@/types/user').InfoDataRow;
    rowIndex: number;
} | null> {
    const { getAllInfoDataUsers } = await import('./infoData');

    const users = await getAllInfoDataUsers();
    const index = users.findIndex(
        (user) => user.uuid && user.uuid.toLowerCase() === uuid.toLowerCase()
    );

    if (index === -1) {
        return null;
    }

    return {
        user: users[index],
        rowIndex: index,
    };
}
