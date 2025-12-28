"use client";

import { memo, useCallback } from "react";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
}

export const SearchInput = memo<SearchInputProps>(({ value, onChange }) => {
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    }, [onChange]);

    return (
        <div className="relative flex items-center w-64 border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
            <i className="fa-duotone fa-search text-gray-400 mr-2.5 text-sm shrink-0" />
            <input
                type="text"
                placeholder="Pesquisar utilizador..."
                value={value}
                onChange={handleChange}
                className="w-full bg-transparent border-none outline-none text-sm placeholder:text-gray-400 text-gray-700 h-full"
            />
        </div>
    );
});

SearchInput.displayName = 'SearchInput';
