// components/ui/spinner.tsx
import React from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: string;
    color?: string;
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'h-4 w-4',
    color = 'text-primary',
    className
}) => {
    return (
        <ImSpinner2
            className={cn(
                'animate-spin',
                size,
                color,
                className
            )}
        />
    );
};

export default LoadingSpinner;
