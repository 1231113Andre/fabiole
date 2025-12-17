import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const infoBoxVariants = cva(
    'relative w-full group transition-transform duration-300 ease-in-out',
    {
        variants: {
            variant: {
                default: '[&_.aurora]:bg-primary [&_.gradient-border]:from-primary/50',
                destructive: '[&_.aurora]:bg-destructive [&_.gradient-border]:from-destructive/50',
                guarantee: '[&_.aurora]:bg-green-500 [&_.gradient-border]:from-green-500/50',
                warning: '[&_.aurora]:bg-yellow-500 [&_.gradient-border]:from-yellow-500/50',
                modal: 'z-[9999]',
                alert: 'fixed top-6 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-x-3 w-auto max-w-lg rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 px-6 py-4 text-white text-sm font-semibold shadow-2xl backdrop-blur-sm border border-red-400/30',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

export interface InfoBoxProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof infoBoxVariants> { }

const InfoBox = React.forwardRef<HTMLDivElement, InfoBoxProps>(
    ({ className, variant, children, ...props }, ref) => {
        const isAlertVariant = variant === 'alert';

        return (
            <div
                ref={ref}
                className={cn(infoBoxVariants({ variant }), className)}
                {...props}
            >
                {!isAlertVariant ? (
                    <>
                        <div className="aurora absolute -inset-20 top-1/2 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl animate-aurora-pulse group-hover:opacity-50 transition-opacity duration-300" />
                        <div
                            className="gradient-border relative rounded-xl p-[1px] shadow-xl shadow-primary/10
                         bg-gradient-to-br via-border to-transparent bg-[length:200%_200%]
                         group-hover:animate-border-shimmer"
                        >
                            <div className="relative h-full w-full overflow-hidden rounded-[11px] bg-card/90 p-3 backdrop-blur-md">
                                <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
                                <div className="relative z-10">{children}</div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <i className="fa-solid fa-circle-exclamation text-lg flex-shrink-0"></i>
                        <span className="flex-1 text-center">{children}</span>
                    </>
                )}
            </div>
        );
    },
);

InfoBox.displayName = 'InfoBox';

export { InfoBox, infoBoxVariants };
