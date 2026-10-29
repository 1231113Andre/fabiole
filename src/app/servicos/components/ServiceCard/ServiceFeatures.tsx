import { memo, useMemo } from "react";
import { Service } from "../../types";

interface ServiceFeaturesProps {
    service: Service;
}

// Memoize feature text rendering function
const renderFeatureText = (featureText: string, highlightWords: string[] = []) => {
    if (highlightWords.length === 0) {
        return <span className="font-medium">{featureText}</span>;
    }
    
    const words = featureText.split(' ');
    return (
        <span>
            {words.map((word, wordIndex) => {
                const cleanWord = word.replace(/[.,;:!?]/g, '');
                const isHighlighted = highlightWords.some(hw => 
                    cleanWord.toLowerCase() === hw.toLowerCase()
                );
                return (
                    <span key={wordIndex}>
                        <span className={isHighlighted ? "font-semibold" : "font-medium"}>
                            {word}
                        </span>
                        {wordIndex < words.length - 1 && ' '}
                    </span>
                );
            })}
        </span>
    );
};

function ServiceFeaturesComponent({ service }: ServiceFeaturesProps) {
    if (!service.features) {
        return null;
    }

    return (
        <div className="mb-6 flex items-center justify-center gap-2 text-gray-700 text-xs flex-wrap">
            {service.features.map((feature, featureIndex) => {
                const featureText = typeof feature === 'string' ? feature : feature.text;
                const featureIcon = typeof feature === 'string' ? 'fa-check-circle' : feature.icon;
                const highlightWords = typeof feature === 'object' && feature.highlightWords ? feature.highlightWords : [];
                
                return (
                    <span key={featureIndex} className="flex items-center gap-1.5">
                        <i className={`fa-duotone ${featureIcon} text-blue-600 text-sm flex-shrink-0`}></i>
                        {renderFeatureText(featureText, highlightWords)}
                    </span>
                );
            })}
        </div>
    );
}

// Memoize features component
export const ServiceFeatures = memo(ServiceFeaturesComponent, (prevProps, nextProps) => {
    return prevProps.service.title === nextProps.service.title &&
           prevProps.service.pdf?.href === nextProps.service.pdf?.href &&
           JSON.stringify(prevProps.service.features) === JSON.stringify(nextProps.service.features);
});

