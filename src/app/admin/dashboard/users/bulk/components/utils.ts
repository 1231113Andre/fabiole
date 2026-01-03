// Re-export color functions from central location
export {
    getBmiClassColor,
    getFatClassColor,
    getDeltaPesoColor,
    formatDeltaPeso as formatDelta
} from "@/lib/utils/bodyMetrics";

// Input styling constant
// Input styling constant - Ghost style
// Shared Box Style for consistency
export const BOX_CLASS = "h-8 px-2 text-xs font-medium bg-white border border-gray-200 rounded-md shadow-sm outline-none transition-all text-center";

// Input styling constant - Premium Modern Style
export const INPUT_CLASS = `w-full ${BOX_CLASS} text-gray-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-gray-300 hover:border-gray-300`;

// Text classes matching PesagensTable
export const TEXT_Classes = {
    Muted: "text-gray-500",
    Default: "text-gray-700",
    Bold: "font-bold text-gray-900"
};

// Create a new row helper
export const createNewRow = (): { id: string; date: string } => ({
    id: crypto.randomUUID(),
    date: new Date().toISOString().split('T')[0]
});
