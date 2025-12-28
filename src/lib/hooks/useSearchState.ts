"use client";

import { useState, useCallback } from "react";

/**
 * Custom hook for managing search state with memoized setter
 * Provides a clean interface for search inputs with performance optimization
 */
export function useSearchState(initialValue: string = ""): [string, (value: string) => void] {
    const [value, setValue] = useState(initialValue);

    const setSearchValue = useCallback((newValue: string) => {
        setValue(newValue);
    }, []);

    return [value, setSearchValue];
}
