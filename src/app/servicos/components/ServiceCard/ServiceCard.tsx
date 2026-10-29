"use client";
import { memo } from "react";
import Image from "next/image";
import NewButton from "@/app/components/newButton";
import { Service } from "../../types";
import { ServiceFeatures } from "./ServiceFeatures";
import { ServiceBranding } from "./ServiceBranding";
import { ServicePrice } from "./ServicePrice";

interface ServiceCardProps {
    service: Service;
    index: number;
    onSelect: (title: string) => void;
}

function ServiceCardComponent({ service, index, onSelect }: ServiceCardProps) {
    return (
        <div
            className={`group relative flex h-full flex-col items-center justify-between overflow-hidden rounded-xl sm:rounded-[2rem] border border-gray-100 bg-white p-4 sm:p-8 text-center shadow-lg transition-all duration-300 hover:shadow-xl`}
        >
            {service.popular && (
                <span className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1.5 rounded-full shadow-lg text-xs font-bold uppercase tracking-wide z-10">
                    Mais Popular
                </span>
            )}

            {/* Image */}
            <div className="mb-1 w-full overflow-hidden rounded-2xl">
                <div className="relative h-48 w-full">
                    <Image
                        src={service.icon}
                        alt={service.title}
                        fill
                        className="object-cover"
                        loading={index < 3 ? "eager" : "lazy"}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                </div>
            </div>

            {/* Logo and brand text */}
            <ServiceBranding />

            {/* Divider */}
            <div className="mb-2 -mt-2 h-[2px] w-full bg-gray-400"></div>

            {/* Title */}
            <h3 className="mb-1 mt-1 font-fugazone text-lg sm:text-2xl uppercase leading-tight text-gray-900 transition-colors duration-300 group-hover:text-primary animate-fade-in-up flex items-center justify-center gap-2 sm:gap-4" style={{ animationDelay: `${index * 0.1}s` }}>
                {service.titleIcon && (
                    <i className={`fa-duotone ${service.titleIcon} text-blue-600 text-lg sm:text-2xl`}></i>
                )}
                <span>{service.title}</span>
            </h3>

            {/* Description */}
            <p className="mb-2 mt-1 flex-grow font-medium text-gray-600 text-base leading-relaxed animate-fade-in-up" style={{ animationDelay: `${index * 0.1 + 0.1}s` }}>
                {service.desc}
            </p>

            {/* Price */}
            <ServicePrice price={service.price} />

            {/* Features or PDF */}
            <ServiceFeatures service={service} />

            {/* Buttons */}
            <div className="flex w-full flex-col gap-3">
                {service.pdf ? (
                    <NewButton
                        variant="new_primary_rounded"
                        className="w-full uppercase font-bold"
                        href={service.pdf.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        icon={<i className={`fa-duotone ${service.pdf.icon ?? "fa-file-pdf"}`}></i>}
                        iconPosition="right"
                    >
                        {service.pdf.label}
                    </NewButton>
                ) : (
                    <NewButton
                        variant="new_primary_rounded"
                        className="w-full uppercase font-bold"
                        icon={<i className="fa-duotone fa-arrow-right"></i>}
                        iconPosition="right"
                        onClick={() => onSelect(service.title)}
                    >
                        {service.contactOnly ? "Contactar Para Informações" : "Escolher Plano"}
                    </NewButton>
                )}

                {service.secondaryAction && (
                    <NewButton
                        variant="new_primary_no_bg_rounded"
                        className="w-full uppercase font-bold"
                        href={service.secondaryAction.href}
                        icon={<i className={`fa-duotone ${service.secondaryAction.icon ?? "fa-arrow-right"}`}></i>}
                        iconPosition="right"
                    >
                        {service.secondaryAction.label}
                    </NewButton>
                )}
            </div>
        </div>
    );
}

// Memoize to prevent unnecessary re-renders
export const ServiceCard = memo(ServiceCardComponent, (prevProps, nextProps) => {
    return prevProps.service.title === nextProps.service.title &&
        prevProps.index === nextProps.index;
});

