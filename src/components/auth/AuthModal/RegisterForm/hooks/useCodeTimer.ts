import { useState, useEffect } from 'react';

/**
 * Custom hook for managing resend code timer
 * @param initialSeconds - Initial countdown seconds (default: 60)
 * @returns [timeLeft, startTimer] - Current time left and function to start timer
 */
export function useCodeTimer(initialSeconds: number = 60) {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timerId = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    const startTimer = (seconds: number = initialSeconds) => {
        setTimeLeft(seconds);
    };

    return [timeLeft, startTimer] as const;
}

