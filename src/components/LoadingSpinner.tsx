"use client";

import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Loading the assets...",
    "Preparing your dashboard...",
    "Almost there..."
];

export const LoadingSpinner: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2000); // Change message every 2 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
            {/* Two-part spinner */}
            <div className="relative w-20 h-20">
                {/* Outer ring - slower rotation */}
                <div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500"
                    style={{
                        animation: 'spin 1.5s linear infinite',
                    }}
                />
                {/* Inner ring - faster rotation, opposite direction */}
                <div
                    className="absolute inset-3 rounded-full border-4 border-transparent border-b-blue-400 border-l-blue-400"
                    style={{
                        animation: 'spin-reverse 1s linear infinite',
                    }}
                />
                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                </div>
            </div>

            {/* Loading message */}
            <p
                className="mt-8 text-blue-400 text-lg font-medium tracking-wide transition-opacity duration-300"
                key={messageIndex}
            >
                {loadingMessages[messageIndex]}
            </p>

            {/* Custom keyframes */}
            <style jsx>{`
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                @keyframes spin-reverse {
                    from {
                        transform: rotate(360deg);
                    }
                    to {
                        transform: rotate(0deg);
                    }
                }
            `}</style>
        </div>
    );
};
