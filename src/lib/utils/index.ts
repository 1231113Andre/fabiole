import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export * from "./date"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Zamień spacje na myślniki
        .replace(/[^\w\-]+/g, '') // Usuń wszystkie znaki niebędące słowami (poza myślnikami)
        .replace(/\-\-+/g, '-')   // Zamień wielokrotne myślniki na pojedyncze
}

export function generateUniqueId(prefix: string = 'id'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
