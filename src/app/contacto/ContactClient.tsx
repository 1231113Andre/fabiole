"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import NewButton from "@/app/components/newButton";

function ContactoPageInner() {
    const [selectedService, setSelectedService] = useState<string>("");
    const [trainingFrequency, setTrainingFrequency] = useState<string>("");
    const [trainingDuration, setTrainingDuration] = useState<string>("");
    const [trainingType, setTrainingType] = useState<string>("");

    const searchParams = useSearchParams();

    useEffect(() => {
        // First try to get from Session Storage (clean URL approach)
        if (typeof window !== 'undefined') {
            const storedSelection = sessionStorage.getItem('contact_selection');
            if (storedSelection) {
                try {
                    const data = JSON.parse(storedSelection);
                    if (data.service) setSelectedService(data.service);
                    if (data.frequency) setTrainingFrequency(data.frequency);
                    if (data.duration) setTrainingDuration(data.duration);
                    if (data.type) setTrainingType(data.type);

                    // Optional: Clear storage after reading if you want it to be one-time
                    // sessionStorage.removeItem('contact_selection');
                } catch (error) {
                    console.error('Error parsing contact selection from storage:', error);
                }
            }
        }

        // Fallback to URL parameters (if provided directly)
        const service = searchParams.get("service");
        const frequency = searchParams.get("frequency");
        const duration = searchParams.get("duration");
        const type = searchParams.get("type");

        if (service) setSelectedService(service);
        if (frequency) setTrainingFrequency(frequency);
        if (duration) setTrainingDuration(duration);
        if (type) setTrainingType(type);
    }, [searchParams]);

    const hasSelectedOptions = selectedService && trainingFrequency && trainingDuration;

    return (
        <main className="min-h-screen overflow-hidden bg-white">
            {/* Hero Section */}
            <section className="relative h-[40vh] w-full flex items-center justify-center overflow-hidden">
                <Image
                    key="contact-banner"
                    src="/images/banners/banner-01.png"
                    alt="Contactos Fábio Lé"
                    fill
                    className="absolute inset-0 h-full w-full object-cover brightness-[0.6]"
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50"></div>

                {/* Hero Content */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-16">
                    <h1 className="font-fugazone text-4xl tracking-wide md:text-5xl lg:text-6xl text-white mb-4 drop-shadow-2xl">
                        CONTACT<span className="text-primary">OS</span>
                    </h1>
                    <div className="h-2 w-32 md:w-48 bg-primary rounded-full mx-auto mb-8 shadow-[0_0_20px_rgba(230,145,91,0.8)]"></div>
                    <p className="text-gray-100 font-montserrat text-xl md:text-3xl font-bold max-w-4xl mx-auto drop-shadow-lg tracking-wide">
                        "Pronto para começar a tua transformação?"
                    </p>
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="py-24 container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-10">
                    {/* Contact Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow-xl border border-gray-100 rounded-2xl h-full overflow-hidden">
                            <div className="p-8">
                                <h2 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-wide font-fugazone border-b-2 border-primary/20 pb-2 w-fit animate-fade-in-up">
                                    Envia-me uma Mensagem
                                </h2>

                                {/* Selected Service Options Display */}
                                {hasSelectedOptions && (
                                    <div className="bg-blue-50/50 border border-blue-100 text-blue-900 rounded-xl p-5 mb-6 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-sm font-bold flex items-center gap-2">
                                                <i className="fa-duotone fa-clipboard-list text-primary"></i>
                                                Opções Selecionadas:
                                            </h3>
                                            <NewButton
                                                onClick={() => (window.location.href = "/servicos")}
                                                variant="new_secondary_no_border_on_idle"
                                                className="!px-3 !py-1 !text-xs !font-bold !uppercase !tracking-wider !bg-white !border-gray-200 !text-gray-600 hover:!bg-gray-50 hover:!text-gray-800 !h-auto !shadow-sm"
                                                icon={<i className="fa-duotone fa-arrow-left mr-1"></i>}
                                            >
                                                ALTERAR
                                            </NewButton>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-100 text-xs font-bold text-gray-700 shadow-sm">
                                                <i className="fa-duotone fa-dumbbell text-primary"></i>
                                                {selectedService}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-100 text-xs font-bold text-gray-700 shadow-sm">
                                                <i className="fa-duotone fa-calendar-check text-emerald-500"></i>
                                                {trainingFrequency}x por semana
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-100 text-xs font-bold text-gray-700 shadow-sm">
                                                <i className="fa-duotone fa-timer text-amber-500"></i>
                                                {trainingDuration}
                                            </span>
                                            {trainingType && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-100 text-xs font-bold text-gray-700 shadow-sm capitalize">
                                                    <i className="fa-duotone fa-user text-blue-500"></i>
                                                    {trainingType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* FormSubmit Form */}
                                <form
                                    action="https://formsubmit.co/fabiole.pt@gmail.com"
                                    method="POST"
                                    className="space-y-5"
                                >
                                    <div>
                                        <label htmlFor="name" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide font-montserrat">Nome Completo *</label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 font-medium"
                                            placeholder="O teu nome completo"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide font-montserrat">Email *</label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 font-medium"
                                            placeholder="nome@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide font-montserrat">
                                            Mensagem *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={5}
                                            required
                                            className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 font-medium resize-none"
                                            placeholder={
                                                hasSelectedOptions
                                                    ? `Olá Fábio! Estou interessado no serviço "${selectedService}" ...`
                                                    : "Conta-me sobre os teus objetivos de fitness e como te posso ajudar..."
                                            }
                                            defaultValue={
                                                hasSelectedOptions
                                                    ? `Olá Fábio! Estou interessado no serviço "${selectedService}" com ${trainingFrequency} treinos por semana de ${trainingDuration}. Gostaria de saber mais sobre este plano e como podemos começar.`
                                                    : ""
                                            }
                                        />
                                    </div>

                                    {/* Hidden Fields */}
                                    {selectedService && <input type="hidden" name="service" value={selectedService} />}
                                    {trainingFrequency && <input type="hidden" name="frequency" value={trainingFrequency} />}
                                    {trainingDuration && <input type="hidden" name="duration" value={trainingDuration} />}
                                    <input type="hidden" name="_next" value="https://www.fabiole.com/contacto" />
                                    <input type="hidden" name="_captcha" value="false" />

                                    <div className="flex justify-center pt-2">
                                        <NewButton
                                            type="submit"
                                            variant="new_primary_rounded"
                                            className="uppercase tracking-wider px-12"
                                            icon={<i className="fa-duotone fa-paper-plane"></i>}
                                        >
                                            ENVIAR MENSAGEM
                                        </NewButton>
                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>
                    {/* Contact Info Section */}
                    <div className="lg:col-span-1">
                        <div className="flex flex-col gap-8 h-full">
                            {/* Contact Info */}
                            <div className="bg-white shadow-xl border border-gray-100 rounded-2xl overflow-hidden group hover:border-primary/30 transition-colors duration-300">
                                <div className="p-8">
                                    <h2 className="text-xl font-black text-gray-800 mb-8 uppercase tracking-wide font-fugazone border-b-2 border-primary/20 pb-2 w-fit animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                                        Informações de Contacto
                                    </h2>

                                    <div className="space-y-6">
                                        <a href="tel:+351964553301" className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-primary/5 transition-all group/item border border-transparent hover:border-primary/20">
                                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary group-hover/item:text-primary-dark group-hover/item:scale-110 transition-all mr-4">
                                                <i className="fa-duotone fa-phone text-xl"></i>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Telemóvel</p>
                                                <p className="text-gray-800 font-bold text-lg">+351 964 553 301</p>
                                            </div>
                                        </a>

                                        <a href="mailto:fabiole.pt@gmail.com" className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-primary/5 transition-all group/item border border-transparent hover:border-primary/20">
                                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary group-hover/item:text-primary-dark group-hover/item:scale-110 transition-all mr-4">
                                                <i className="fa-duotone fa-envelope text-xl"></i>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                                                <p className="text-gray-800 font-bold text-lg">fabiole.pt@gmail.com</p>
                                            </div>
                                        </a>

                                        <div className="flex items-start p-4 rounded-xl bg-gray-50 hover:bg-primary/5 transition-all group/item border border-transparent hover:border-primary/20">
                                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary group-hover/item:text-primary-dark group-hover/item:scale-110 transition-all mr-4 mt-1">
                                                <i className="fa-duotone fa-map-location-dot text-xl"></i>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Localização</p>
                                                <div className="space-y-2">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-800">S. Félix da Marinha</span>
                                                        <span className="text-sm text-gray-500">Estrada de Brito, 851 | 4410-206</span>
                                                    </div>
                                                    <div className="h-px w-full bg-gray-200"></div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-800">Vila Nova de Gaia</span>
                                                        <span className="text-sm text-gray-500">Rua Arcos do Sardão, 22 | 4430-272</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="bg-white shadow-xl border border-gray-100 rounded-2xl overflow-hidden p-8">
                                <h3 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-wide font-fugazone border-b-2 border-primary/20 pb-2 w-fit animate-fade-in-up" style={{ animationDelay: '0.2s' }}>Redes Sociais</h3>
                                <div className="flex gap-4 flex-wrap">
                                    <a
                                        href="https://www.instagram.com/pt_fabiole"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-14 h-14 bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:-translate-y-1 transition-all duration-300"
                                        aria-label="Instagram"
                                    >
                                        <i className="fa-brands fa-instagram text-2xl"></i>
                                    </a>
                                    <a
                                        href="https://www.facebook.com/fabiole13"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-14 h-14 bg-gradient-to-br from-[#1877F2] to-[#166fe5] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300"
                                        aria-label="Facebook"
                                    >
                                        <i className="fa-brands fa-facebook-f text-2xl"></i>
                                    </a>
                                    <a
                                        href="https://www.linkedin.com/in/fabio-le"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-14 h-14 bg-gradient-to-br from-[#0077b5] to-[#006396] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:-translate-y-1 transition-all duration-300"
                                        aria-label="LinkedIn"
                                    >
                                        <i className="fa-brands fa-linkedin-in text-2xl"></i>
                                    </a>
                                    <a
                                        href="https://www.youtube.com/channel/UCaVEJUlceBfmF-6GxKYeqhQ"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-14 h-14 bg-gradient-to-br from-[#FF0000] to-[#cc0000] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-1 transition-all duration-300"
                                        aria-label="YouTube"
                                    >
                                        <i className="fa-brands fa-youtube text-2xl"></i>
                                    </a>
                                    <a
                                        href="https://chat.whatsapp.com/Bzf2RZ500Ef2lOEcuu6m2S"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-14 h-14 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-1 transition-all duration-300"
                                        aria-label="WhatsApp"
                                    >
                                        <i className="fa-brands fa-whatsapp text-2xl"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <section className="py-5 bg-gradient-to-r from-primary to-primary" style={{ background: 'linear-gradient(to right, #1E90FF, #0066cc)' }}>
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Não Esperes Mais!</h2>
                    <p className="text-xl text-white/70 mb-4 max-w-2xl mx-auto">
                        A tua transformação começa hoje. Marca já a tua primeira sessão!
                    </p>
                    <a
                        href="tel:+351964553301"
                        className="inline-block bg-secondary text-white px-8 py-3 rounded-full shadow-lg hover:bg-secondary/90 transition-colors text-lg font-semibold"
                    >
                        Ligar Agora
                    </a>
                </div>
            </section>
        </main>
    );
}

export function ContactClient() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <ContactoPageInner />
        </Suspense>
    );
}
