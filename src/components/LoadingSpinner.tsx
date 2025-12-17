
import React from 'react';
import { ImSpinner2 } from 'react-icons/im';

export const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-[500px]">
        <ImSpinner2 className="h-20 w-20 animate-spin text-primary" />
    </div>
);
