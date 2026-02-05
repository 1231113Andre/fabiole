// components/ui/spinner.tsx
import React from 'react';
import { cn } from '@/lib/utils';

export interface StepItem {
    label: string;
    description: string;
}

interface LoadingSpinnerProps {
    size?: string;
    color?: string;
    className?: string;
    steps?: StepItem[];
    stepInterval?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'text-7xl',
    color = 'text-primary',
    className,
    steps,
    stepInterval = 800 // High-speed cycling for immediate visual progress
}) => {
    const [mountTime] = React.useState(Date.now());
    const [currentStep, setCurrentStep] = React.useState(0);

    React.useEffect(() => {
        if (!steps || steps.length <= 1) return;

        const update = () => {
            const now = Date.now();
            const elapsed = now - mountTime;
            const index = Math.floor(elapsed / stepInterval) % steps.length;

            // Console log to help user verify cycling during F5
            console.log(`[Loading] Phase ${index + 1}: ${steps[index].label}`);

            setCurrentStep(index);
        };

        // Immediate check and then frequent polling
        update();
        const timer = setInterval(update, 50);
        return () => clearInterval(timer);
    }, [steps, stepInterval]);

    return (
        <div className={cn("relative flex flex-col items-center justify-center min-h-[300px] overflow-hidden p-4", className)}>
            {/* Energy Core - Compact Reactor Design */}
            <div className="relative flex items-center justify-center scale-90 sm:scale-100 mb-6 sm:mb-10">
                {/* Layered Atmospheric Glow - More subtle */}
                <div className="absolute inset-0 bg-primary/20 blur-[50px] sm:blur-[80px] rounded-full scale-[2] sm:scale-[2.5] animate-pulse" />

                {/* Advanced Orbital Ring System - Smaller diameters */}
                <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-primary/5 animate-[premium-spin_10s_linear_infinite]" />
                <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border-t-2 border-primary/20 animate-[premium-spin_0.8s_linear_infinite]" />
                <div className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full border-l-2 border-primary/10 animate-[premium-spin_15s_linear_infinite_reverse]" />

                {/* Central Ionized Core - Smaller icon size */}
                <div className="relative z-10 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full scale-110" />
                    <i className={cn(
                        "fa-duotone fa-spinner-third relative z-20 drop-shadow-[0_0_15px_rgba(230,145,91,0.6)]",
                        "text-3xl sm:text-5xl",
                        color
                    )} style={{ animation: 'premium-spin 0.3s linear infinite' }}></i>
                </div>
            </div>

            {/* System Output HUD - Compact Terminal */}
            <div className="mt-8 sm:mt-12 flex flex-col items-center min-h-[120px] w-full max-w-[600px] relative px-4 text-center">
                {steps && steps.length > 0 && (
                    <div
                        key={currentStep}
                        className="flex flex-col items-center gap-3 sm:gap-4 animate-hud-reveal"
                    >
                        {/* Status Identifier - Smaller font */}
                        <div className="flex items-center gap-2 py-1 px-4 rounded-full bg-white/10 border border-white/10 shadow-lg">
                            <i className="fa-duotone fa-signal-stream text-[10px] text-primary animate-pulse"></i>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70" style={{ textRendering: 'optimizeLegibility' }}>
                                Transmitting Phase {currentStep + 1}/{steps.length}
                            </span>
                        </div>

                        {/* Primary Load Status - Reduced heading size */}
                        <div className="relative group">
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none italic drop-shadow-lg">
                                {steps[currentStep].label}
                            </h2>
                            <div className="mt-2 h-[1px] w-16 sm:w-32 bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto" />
                        </div>

                        {/* Detailed Description Panel - Reduced subtext size */}
                        <div className="relative max-w-[450px]">
                            <p className="text-sm sm:text-lg lg:text-xl font-bold text-bodydark2 leading-snug tracking-tight font-montserrat opacity-80">
                                {steps[currentStep].description}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes premium-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes hud-reveal {
                    0% { 
                        opacity: 0; 
                        transform: translateY(30px) scale(0.95); 
                        filter: brightness(2);
                    }
                    100% { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                        filter: brightness(1);
                    }
                }
                .animate-hud-reveal {
                    animation: hud-reveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    backface-visibility: hidden;
                    -webkit-font-smoothing: antialiased;
                }
            `}</style>
        </div>
    );
};

export default LoadingSpinner;
