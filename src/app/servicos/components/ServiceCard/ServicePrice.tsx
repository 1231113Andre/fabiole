import { memo } from "react";
import { ServicePrice as ServicePriceType } from "../../types";

interface ServicePriceProps {
    price: ServicePriceType | string;
}

function ServicePriceComponent({ price }: ServicePriceProps) {
    return (
        <div className="mb-2 text-center h-20 flex items-center justify-center">
            {typeof price === 'string' ? (
                <div className="text-3xl font-bold text-primary">{price}</div>
            ) : (
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-black">{price.amount}</span>
                    <span className="text-5xl font-bold text-black">/</span>
                    <span className="text-xs font-medium text-gray-700">{price.prefix} {price.unit}</span>
                </div>
            )}
        </div>
    );
}

// Memoize price component
export const ServicePrice = memo(ServicePriceComponent, (prevProps, nextProps) => {
    if (typeof prevProps.price === 'string' && typeof nextProps.price === 'string') {
        return prevProps.price === nextProps.price;
    }
    if (typeof prevProps.price === 'object' && typeof nextProps.price === 'object') {
        return prevProps.price.amount === nextProps.price.amount &&
               prevProps.price.unit === nextProps.price.unit;
    }
    return false;
});

