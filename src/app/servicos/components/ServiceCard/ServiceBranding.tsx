import { memo } from "react";
import Image from "next/image";
import { ASSETS } from "@/lib/constants/assets";

function ServiceBrandingComponent() {
    return (
        <div className="mb-1 -mt-6 flex items-center justify-center">
            <Image
                src={ASSETS.logo}
                alt="Fábio Lé Logo"
                width={120}
                height={120}
                className="w-32 h-32 object-contain"
            />
            <div className="flex flex-col justify-center -ml-17">
                <span className="font-montserrat text-2xl font-bold leading-none tracking-wide text-gray-900 drop-shadow-md whitespace-nowrap">
                    FÁBIO LÉ
                </span>
                <span className="font-montserrat text-xs font-bold leading-none tracking-[0.35em] text-primary drop-shadow-sm mt-1 whitespace-nowrap">
                    PERSONAL TRAINER
                </span>
            </div>
        </div>
    );
}

// Memoize branding component - it's the same for all cards
export const ServiceBranding = memo(ServiceBrandingComponent);

