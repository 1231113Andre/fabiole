// Re-export color functions from central location
export {
    getBmiClassColor,
    getFatClassColor,
    getDeltaPesoColor,
    formatDeltaPeso as formatDelta,
    getMileResultStyle
} from "@/lib/utils/bodyMetrics";

// Base box style for inputs
export const BOX_CLASS = "h-8 px-2 text-xs font-medium bg-white border border-gray-200 rounded-md shadow-sm outline-none transition-all text-center";

// Input styling with focus states
export const INPUT_CLASS = `w-full ${BOX_CLASS} text-gray-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-gray-300 hover:border-gray-300`;

// Create a new row helper
export const createNewRow = (): { id: string; date: string } => ({
    id: crypto.randomUUID(),
    date: new Date().toISOString().split('T')[0]
});
