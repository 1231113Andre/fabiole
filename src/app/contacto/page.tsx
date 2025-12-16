"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ContactoPageInner() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [trainingFrequency, setTrainingFrequency] = useState<string>("");
  const [trainingDuration, setTrainingDuration] = useState<string>("");

  const searchParams = useSearchParams();

  useEffect(() => {
    const service = searchParams.get("service");
    const frequency = searchParams.get("frequency");
    const duration = searchParams.get("duration");

    if (service) setSelectedService(service);
    if (frequency) setTrainingFrequency(frequency);
    if (duration) setTrainingDuration(duration);
  }, [searchParams]);

  const hasSelectedOptions = selectedService && trainingFrequency && trainingDuration;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-100 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              <span className="text-[#1E90FF]">Contacta</span> Comigo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pronto para começar a tua transformação? Vamos conversar sobre os teus objetivos
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Contact Form */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-lg border-0 rounded-2xl h-full">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">Envia-me uma Mensagem</h2>

                  {/* Selected Service Options Display */}
                  {hasSelectedOptions && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold mb-0">
                          <i className="fas fa-clipboard-list mr-2"></i>
                          Opções Selecionadas:
                        </h3>
                        <button
                          onClick={() => (window.location.href = "/servicos")}
                          className="bg-secondary text-white px-3 py-1 rounded text-sm hover:bg-secondary/90 transition-colors"
                        >
                          Alterar
                        </button>
                      </div>
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Serviço:</span>
                          <span className="font-semibold text-primary">{selectedService}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Frequência:</span>
                          <span className="font-semibold text-secondary">{trainingFrequency}x por semana</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duração:</span>
                          <span className="font-semibold text-secondary">{trainingDuration}</span>
                        </div>
                      </div>
                    </div>
                  )}

              {/* FormSubmit Form */}
              <form
                action="https://formsubmit.co/fabiole.pt@gmail.com"
                method="POST"
              >
                <div className="mb-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    placeholder="O teu nome completo"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    placeholder="nome@email.com"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    placeholder={
                      hasSelectedOptions
                        ? `Olá Fábio! Estou interessado no serviço "${selectedService}" com ${trainingFrequency} treinos por semana de ${trainingDuration}. Conta-me sobre os teus objetivos de fitness e como posso ajudar...`
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

                <button
                  type="submit"
                  className="modern-btn-submit w-full"
                >
                  Enviar Mensagem
                </button>
              </form>
                </div>
              </div>

          </div>
            {/* Contact Info Section */}
            <div className="lg:col-span-1">
              <div className="flex flex-col gap-4 h-full">
                {/* Contact Info */}
                <div className="bg-white shadow-lg border-0 rounded-2xl">
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Informações de Contacto</h2>

                    <div className="flex items-center mb-3">
                      <i className="fas fa-phone-alt text-primary text-xl mr-3"></i>
                      <a href="tel:+351964553301" className="no-underline text-gray-600 text-lg hover:text-primary transition-colors">
                        +351 964 553 301
                      </a>
                    </div>

                    <div className="flex items-center mb-3">
                      <i className="fas fa-envelope text-primary text-xl mr-3"></i>
                      <a href="mailto:fabiole.pt@gmail.com" className="no-underline text-gray-600 text-lg hover:text-primary transition-colors">
                        fabiole.pt@gmail.com
                      </a>
                    </div>

                    <div className="flex items-start">
                      <i className="fas fa-map-marker-alt text-primary text-xl mr-3 mt-1"></i>
                      <div className="flex flex-col">
                        <span className="text-gray-600 text-lg">S. Félix da Marinha: Estrada de Brito, 851 | 4410-206</span>
                        <span className="text-gray-600 text-lg">Vila Nova de Gaia: Rua Arcos do Sardão, 22 | 4430-272</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-white shadow-lg border-0 rounded-2xl">
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-4">Redes Sociais</h3>
                    <div className="flex gap-3">
                      <a 
                        href="https://www.instagram.com/pt_fabiole" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform" 
                        aria-label="Instagram"
                      >
                        <i className="fab fa-instagram text-lg"></i>
                      </a>
                      <a 
                        href="https://www.facebook.com/fabiole13" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform" 
                        aria-label="Facebook"
                      >
                        <i className="fab fa-facebook-f text-lg"></i>
                      </a>
                      <a 
                        href="https://www.linkedin.com/in/fabio-le" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-12 h-12 bg-gradient-to-r from-blue-700 to-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform" 
                        aria-label="LinkedIn"
                      >
                        <i className="fab fa-linkedin-in text-lg"></i>
                      </a>
                      <a 
                        href="https://www.youtube.com/channel/UCaVEJUlceBfmF-6GxKYeqhQ" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-400 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform" 
                        aria-label="YouTube"
                      >
                        <i className="fab fa-youtube text-lg"></i>
                      </a>
                      <a 
                        href="https://chat.whatsapp.com/Bzf2RZ500Ef2lOEcuu6m2S" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform" 
                        aria-label="WhatsApp"
                      >
                        <i className="fab fa-whatsapp text-lg"></i>
                      </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

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

// Wrapper com Suspense para evitar erro no build
export default function ContactoPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ContactoPageInner />
    </Suspense>
  );
}
