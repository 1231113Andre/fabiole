// Re-export body metrics functions from central location
export { calculateMM, calculateH2O } from "@/lib/body-metrics";

export const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    try {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
    } catch {
        return "";
    }
};
