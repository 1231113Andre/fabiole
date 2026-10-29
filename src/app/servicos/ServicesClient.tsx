"use client";
import { useState, useCallback, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ServiceCard } from "./components/ServiceCard";
import { ServiceHero } from "./components/ServiceHero";
import { ServiceFeatures } from "./components/ServiceFeatures";
import { ServiceCTA } from "./components/ServiceCTA";
import { services } from "./data/services";

// Lazy load modal - only loads when needed
const ServiceModal = lazy(() =>
    import("./components/ServiceModal").then(module => ({ default: module.ServiceModal }))
);

const SERVICES_WITHOUT_MODAL = new Set(
    services.filter(service => service.contactOnly).map(service => service.title)
);

interface ServicesClientProps {
    initialSettings?: Record<string, any>;
}

export function ServicesClient({ initialSettings = {} }: ServicesClientProps) {
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    // Dynamically update service display prices based on settings
    const dynamicServices = services.map(service => {
        // Create a shallow copy to modify price
        const updatedService = { ...service };

        // Deep clone price if it exists
        if (service.price && typeof service.price === 'object') {
            updatedService.price = { ...service.price };

            if (service.title === "Treinos Presenciais") {
                const price = initialSettings['price_presencial_1hora'];
                if (price) updatedService.price.amount = `€${price}`;
            } else if (service.title === "Treinos Online") {
                const price = initialSettings['price_online_1hora'];
                if (price) updatedService.price.amount = `€${price}`;
            } else if (service.title === "Acompanhamento Online") {
                const price = initialSettings['price_acompanhamento_mensal'];
                if (price) updatedService.price.amount = `€${price}`;
            }
        } else if (service.priceSettingKey) {
            const price = initialSettings[service.priceSettingKey];
            if (price) updatedService.price = price;
        }

        return updatedService;
    });

    const handleServiceClick = useCallback((serviceTitle: string) => {
        // Contact-only services redirect directly to contact without showing pricing modal
        if (SERVICES_WITHOUT_MODAL.has(serviceTitle)) {
            const params = new URLSearchParams({
                service: serviceTitle
            });
            router.push(`/contacto?${params.toString()}`);
            return;
        }

        setSelectedService(serviceTitle);
        setShowModal(true);
    }, [router]);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setSelectedService(null);
    }, []);

    return (
        <main className="min-h-screen overflow-hidden bg-white">
            {/* Hero Section */}
            <ServiceHero />

            {/* Main Content Grid */}
            <div className="ui-container ui-section">
                <div className="flex w-full flex-wrap justify-center gap-10 lg:max-w-screen-2xl mx-auto">
                    {dynamicServices.map((service, index) => (
                        <div
                            key={service.title}
                            className="w-full md:w-[calc((100%-2.5rem)/2)] lg:w-[calc((100%-5rem)/3)]"
                        >
                            <ServiceCard
                                service={service}
                                index={index}
                                onSelect={handleServiceClick}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Service Selection Modal - Lazy loaded */}
            {showModal && (
                <Suspense fallback={null}>
                    <ServiceModal
                        serviceTitle={selectedService}
                        onClose={handleCloseModal}
                        pricingConfig={initialSettings}
                    />
                </Suspense>
            )}

            {/* Additional Info */}
            <ServiceFeatures />

            {/* CTA Section */}
            <ServiceCTA />
        </main>
    );
}
