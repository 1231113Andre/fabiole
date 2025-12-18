"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ServicosPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [trainingFrequency, setTrainingFrequency] = useState<number>(1);
  const [trainingDuration, setTrainingDuration] = useState<string>("30 minutos");
  const [trainingType, setTrainingType] = useState<string>("individual");
  const router = useRouter();

  const services = [
    {
      title: "Treinos Presenciais",
      desc: "Sessões 1:1 com acompanhamento personalizado no ginásio ou ao ar livre. Correção técnica em tempo real e motivação constante.",
      price: "A partir de €30/hora",
      features: ["Acompanhamento 1:1", "Correção técnica", "Flexibilidade de horários", "Ajustes na hora"],
      icon: "/images/presencial1.jpg",
      color: "from-[#1E90FF] to-blue-600",
      popular: true
    },
    {
      title: "Treinos Online",
      desc: "Planos remotos com acompanhamento semanal e ajustes personalizados. Ideal para quem prefere treinar em casa.",
      price: "A partir de €25€/hora",
      features: ["Planos personalizados", "Acompanhamento semanal", "Ajustes contínuos", "Videochamada"],
      icon: "/images/online1.png",
      color: "from-[#FF6B35] to-orange-600",
      popular: false
    },
    {
      title: "Acompanhamento Online",
      desc: "Através de uma app e contacto regular, recebe um plano de treino personalizado com exercícios detalhados (vídeo e imagem).",
      price: "€30/mês",
      features: ["Plano personalizado", "App dedicada", "Vídeos e imagens", "Contacto regular"],
      icon: "/images/online1.png",
      color: "from-purple-500 to-pink-600",
      popular: false
    },
    {
      title: "Ginástica Laboral / Teambuilding para Empresas",
      desc: "Sessões de ginástica laboral e atividades de teambuilding para promover saúde, bem-estar e espírito de equipa nas empresas.",
      price: "Sob consulta",
      icon: "/images/coletivo.jpg",
      color: "from-green-500 to-emerald-600",
      popular: false,
      pdf: "https://1b7dd9d4-91c7-449f-be0e-7e7479c5029f.filesusr.com/ugd/3342dc_0223ae79b6854f449c15e195b1428f49.pdf"
    }
  ];

  const handleServiceClick = (serviceTitle: string) => {
    // For Ginástica Laboral and Acompanhamento Online, redirect directly to contact without showing pricing modal
    if (serviceTitle === "Ginástica Laboral / Teambuilding para Empresas" || serviceTitle === "Acompanhamento Online") {
      const params = new URLSearchParams({
        service: serviceTitle
      });
      router.push(`/contacto?${params.toString()}`);
      return;
    }

    setSelectedService(serviceTitle);
    setShowModal(true);
  };

  const handleContinue = () => {
    const params = new URLSearchParams({
      service: selectedService || "",
      frequency: trainingFrequency.toString(),
      duration: trainingDuration,
      type: trainingType
    });

    router.push(`/contacto?${params.toString()}`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setTrainingFrequency(1);
    setTrainingDuration("30 minutos");
    setTrainingType("individual");
  };

  const calculatePrice = () => {
    let basePrice = 0;

    if (selectedService === "Treinos Presenciais") {
      switch (trainingDuration) {
        case "30 minutos":
          basePrice = 20;
          break;
        case "45 minutos":
          basePrice = 25;
          break;
        case "1 hora":
          basePrice = 30;
          break;
      }
    } else if (selectedService === "Treinos Online") {
      switch (trainingDuration) {
        case "30 minutos":
          basePrice = 15;
          break;
        case "45 minutos":
          basePrice = 21;
          break;
        case "1 hora":
          basePrice = 25;
          break;
      }
    }

    // Adicionar preços extras para dupla e trio
    if (trainingType === "dupla") {
      switch (trainingDuration) {
        case "30 minutos":
          basePrice += 2;
          break;
        case "45 minutos":
          basePrice += 3;
          break;
        case "1 hora":
          basePrice += 5;
          break;
      }
    } else if (trainingType === "trio") {
      switch (trainingDuration) {
        case "30 minutos":
          basePrice += 4;
          break;
        case "45 minutos":
          basePrice += 6;
          break;
        case "1 hora":
          basePrice += 8;
          break;
      }
    }

    return basePrice * trainingFrequency;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-36">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-100 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <Image
                src="/images/logo.png"
                alt="Fábio Lé Logo"
                width={120}
                height={120}
                className="drop-shadow-lg"
                priority
              />
            </div>
            {/* Brand Name */}
            <div className="mb-6">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-2">
                FÁBIO LÉ
              </h2>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-700">
                PERSONAL TRAINER
              </h3>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-800 mb-6">
              Os Meus <span className="text-[#1E90FF]">Serviços</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Escolhe o serviço que melhor encaixa nos teus objetivos e estilo de vida
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {services.map((service, index) => (
              <div key={service.title} className="lg:col-span-1">
                <div
                  className={`bg-white shadow-lg border-0 rounded-2xl h-full relative cursor-pointer ${service.popular ? 'border-2 border-secondary' : ''}`}
                  onClick={() => handleServiceClick(service.title)}
                >
                  {service.popular && (
                    <span className="bg-secondary text-white absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-full shadow-lg text-sm font-semibold">
                      MAIS POPULAR
                    </span>
                  )}

                  <div className="p-4">
                    <div className="mb-4">
                      <div className="w-full" style={{ height: '192px' }}>
                        <Image
                          src={service.icon}
                          alt={service.title}
                          width={400}
                          height={192}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-center mb-2">{service.title}</h3>
                    <p className="text-gray-600 text-center mb-3">{service.desc}</p>
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-primary">{service.price}</div>
                    </div>

                    {service.pdf ? (
                      <div className="mb-4 text-center">
                        <a
                          href={service.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-bold no-underline p-0 hover:text-primary/80 transition-colors"
                        >
                          Informação detalhada (PDF)
                        </a>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {service.features && service.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center text-gray-600 text-sm">
                            <i className="fas fa-check-circle text-success mr-2"></i>
                            <span className="truncate">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-center">
                      <button
                        className={`w-full modern-btn-service ${service.popular ? 'modern-btn-service-popular' : 'modern-btn-service-standard'}`}
                      >
                        {service.title === "Ginástica Laboral / Teambuilding para Empresas" || service.title === "Acompanhamento Online" ? "Contactar Para Informações" : "Escolher Plano"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Personalizar {selectedService}
              </h3>
              <p className="text-gray-600">
                Escolhe a frequência e duração dos teus treinos
              </p>
            </div>

            <div className="space-y-6">
              {/* Training Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Frequência de Treinos por Semana
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setTrainingFrequency(freq)}
                      className={`modern-btn-option ${trainingFrequency === freq ? 'modern-btn-option-active' : 'modern-btn-option-inactive'}`}
                    >
                      {freq}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Training Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Duração do Treino
                </label>
                <div className="space-y-2">
                  {["30 minutos", "45 minutos", "1 hora"].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setTrainingDuration(duration)}
                      className={`w-full modern-btn-option ${trainingDuration === duration ? 'modern-btn-option-active-secondary' : 'modern-btn-option-inactive'}`}
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>

              {/* Training Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Treino
                </label>
                <div className="space-y-2">
                  {[
                    { value: "individual", label: "Individual", desc: "Treino 1:1" },
                    { value: "dupla", label: "Dupla", desc: "+€2-5 por treino" },
                    { value: "trio", label: "Trio", desc: "+€4-8 por treino" }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setTrainingType(type.value)}
                      className={`w-full text-left modern-btn-option ${trainingType === type.value ? 'modern-btn-option-active-success' : 'modern-btn-option-inactive'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{type.label}</span>
                        <small className="opacity-75">{type.desc}</small>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Display */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Preço/Semana</p>
                  <p className="text-3xl font-bold text-[#1E90FF]">€{calculatePrice()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {trainingFrequency}x por semana • {trainingDuration} • {trainingType === "individual" ? "Individual" : trainingType === "dupla" ? "Dupla" : "Trio"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="modern-btn-cancel flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleContinue}
                  className="modern-btn-submit flex-1"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Porque Escolher os <span className="text-[#1E90FF]">Meus Serviços</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#1E90FF] to-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Personalizado</h3>
              <p className="text-gray-600">
                Cada plano é adaptado às tuas necessidades, objetivos e rotina diária.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B35] to-orange-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Resultados</h3>
              <p className="text-gray-600">
                Foco em resultados reais e sustentáveis, com acompanhamento contínuo.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Suporte</h3>
              <p className="text-gray-600">
                Suporte dedicado e motivação constante para manteres o foco.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1E90FF] to-blue-600">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para Começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Contacta-me para uma avaliação gratuita e descobre qual o melhor plano para ti
          </p>
          <button
            onClick={() => router.push('/contacto')}
            className="inline-block bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-bold text-xl px-12 py-5 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Marca Avaliação Gratuita
          </button>
        </div>
      </section>
    </main>
  );
}


