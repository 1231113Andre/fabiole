// Re-export color functions from central location
export {
    getBmiClassColor,
    getFatClassColor,
    getDeltaPesoColor,
    formatDeltaPeso as formatDelta,
    getMileResultStyle
} from "@/lib/body-metrics";

// Base box style for inputs (compact for bulk table)
export const BOX_CLASS = "h-6 px-1 text-[10px] font-medium bg-white border border-gray-200 rounded shadow-sm outline-none transition-all text-center";

// Input styling with focus states
export const INPUT_CLASS = `w-full ${BOX_CLASS} text-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 placeholder:text-gray-300 hover:border-gray-300`;

// Create a new row helper
export const createNewRow = (): { id: string; date: string } => ({
    id: crypto.randomUUID(),
    date: new Date().toISOString().split('T')[0]
});
