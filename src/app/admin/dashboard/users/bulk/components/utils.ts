// Re-export color functions from central location
export {
    getBmiClassColor,
    getFatClassColor,
    getDeltaPesoColor,
    formatDeltaPeso as formatDelta
} from "@/lib/utils/bodyMetrics";

// Input styling constant
export const INPUT_CLASS = "w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-300 bg-white hover:border-gray-300";

// Create a new row helper
export const createNewRow = (): { id: string; date: string } => ({
    id: crypto.randomUUID(),
    date: new Date().toISOString().split('T')[0]
});
