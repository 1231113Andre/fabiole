/**
 * Admin helper functions
 */

/**
 * Format a date as "Membro desde [day] de [month] de [year]"
 * @param dateString - ISO date string
 * @returns Formatted string like "Membro desde 23 de dezembro de 2025"
 */
export function formatMemberSince(dateString: string | null | undefined): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const day = date.getDate();
    const year = date.getFullYear();

    const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];

    const month = months[date.getMonth()];

    return `Membro desde ${day} de ${month} de ${year}`;
}

/**
 * Sort users alphabetically by name, then surname
 * @param users - Array of users to sort
 * @returns Sorted array
 */
export function sortUsersAlphabetically<T extends { name: string; surname: string }>(users: T[]): T[] {
    return [...users].sort((a, b) => {
        const nameA = `${a.name} ${a.surname}`.toLowerCase();
        const nameB = `${b.name} ${b.surname}`.toLowerCase();
        return nameA.localeCompare(nameB, 'pt-PT');
    });
}
