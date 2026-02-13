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

const SERVICES_WITHOUT_MODAL = new Set([
    "Ginástica Laboral / Teambuilding para Empresas",
    "Acompanhamento Online"
]);

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
        } else if (service.title === "Ginástica Laboral / Teambuilding para Empresas") {
            const price = initialSettings['price_ginastica_laboral'];
            if (price) updatedService.price = price;
        }

        return updatedService;
    });

    const handleServiceClick = useCallback((serviceTitle: string) => {
        // For Ginástica Laboral and Acompanhamento Online, redirect directly to contact without showing pricing modal
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
                <div className="grid w-full gap-10 md:grid-cols-2 lg:grid-cols-3 lg:max-w-screen-2xl mr-auto">
                    {dynamicServices.map((service, index) => (
                        <ServiceCard
                            key={service.title}
                            service={service}
                            index={index}
                            onSelect={handleServiceClick}
                        />
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
