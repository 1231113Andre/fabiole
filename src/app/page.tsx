"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import NewButton from "./components/newButton";

export default function Home() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Simple intersection observer for fade-in animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".fade-in-on-scroll");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      elements.forEach((el) => observerRef.current?.unobserve(el));
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full viewport height */}
      <section className="banner banner--hero">
        <Image
          src="/images/fabiobanner.png"
          alt="Fábio Lé Personal Trainer"
          fill
          className="banner__image"
          priority
          sizes="100vw"
        />
        <div className="banner__overlay banner__overlay--dark"></div>

        {/* Hero Content */}
        <div className="banner__content">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            {/* Main Title */}
            <h1 className="font-fugazone text-5xl md:text-7xl lg:text-8xl mb-4 tracking-wide">
              <span className="text-white drop-shadow-2xl">FÁBIO LÉ</span>
            </h1>

            {/* Subtitle */}
            <h2 className="font-fugazone text-2xl md:text-4xl lg:text-5xl text-primary mb-8 tracking-wider">
              PERSONAL TRAINER
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-4 max-w-2xl mx-auto font-montserrat leading-relaxed">
              Transforma o teu corpo, transforma a tua vida.
            </p>
            <p className="text-lg md:text-xl text-primary font-semibold mb-12 font-montserrat">
              Resultados que se notam por dentro e por fora.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center uppercase items-center hero-cta-buttons-container">
              <NewButton
                href="/contacto"
                variant="new_primary_rounded"
                icon={<i className="fa-duotone fa-calendar-check text-xl"></i>}
                iconPosition="right"
                className="hero-cta-btn w-[250px] min-w-[250px] max-w-[250px] font-fugazone py-3 text-lg"
              >
                Marca já a tua sessão
              </NewButton>
              <NewButton
                href="/servicos"
                variant="new_primary_no_bg_rounded"
                icon={<i className="fa-duotone fa-briefcase text-xl"></i>}
                iconPosition="right"
                className="hero-cta-btn w-[250px] min-w-[250px] max-w-[250px] text-white font-fugazone py-3 text-lg"
              >
                Ver serviços
              </NewButton>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer between hero and services */}
      <div className="h-64 md:h-96 lg:h-[4rem]" style={{ backgroundColor: 'var(--background)' }}></div>

      {/* Services Section */}
      <section className="pt-16 md:pt-24 lg:pt-32 pb-20 md:pb-32 flex flex-col items-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20 fade-in-on-scroll flex flex-col items-center w-full">
            {/* Main Title - matching hero style */}
            <h2 className="font-fugazone text-4xl md:text-6xl lg:text-7xl mb-6 tracking-wide uppercase flex items-center justify-center gap-3" style={{ color: 'var(--foreground)' }}>
              <span>Os Meus <span style={{ color: 'var(--primary)' }}>Serviços</span></span>
              <span className="text-3xl md:text-5xl lg:text-6xl">💪</span>
            </h2>
            
            {/* Subtitle - matching hero style */}
            <p className="text-base md:text-lg lg:text-xl font-montserrat max-w-3xl leading-relaxed text-center mb-16 md:mb-20" style={{ color: 'var(--muted-foreground)' }}>
              Planos personalizados para diferentes objetivos e níveis de fitness
            </p>
            
            {/* Free Evaluation Banner */}
            <div className="services-free-evaluation-banner fade-in-on-scroll">
              <div className="services-free-evaluation-item">
                <span className="services-free-evaluation-emoji">🎯</span>
                <span>Avaliação física inicial é gratuita!</span>
              </div>
              <div className="services-free-evaluation-item">
                <span className="services-free-evaluation-emoji">💪</span>
                <span>Planos 100% personalizados</span>
              </div>
              <div className="services-free-evaluation-item services-free-evaluation-item-full">
                <span className="services-free-evaluation-emoji">📱</span>
                <span>Acompanhamento semanal</span>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="services-grid">
            {[
              {
                title: "Treinos Presenciais",
                desc: "Sessões 1:1 com acompanhamento personalizado no ginásio ou ao ar livre.",
                icon: "fa-duotone fa-dumbbell",
                titleIcon: "fa-duotone fa-dumbbell",
                color: "from-blue-500 to-blue-600"
              },
              {
                title: "Treinos Online",
                desc: "Planos remotos com acompanhamento semanal e ajustes personalizados.",
                icon: "fa-duotone fa-laptop",
                titleIcon: "fa-duotone fa-laptop",
                color: "from-primary to-orange-600"
              },
              {
                title: "Planos Alimentares",
                desc: "Nutrição alinhada ao teu objetivo de treino e estilo de vida.",
                icon: "fa-duotone fa-salad",
                titleIcon: "fa-duotone fa-salad",
                color: "from-green-500 to-emerald-600"
              }
            ].map((service, index) => (
              <div
                key={service.title}
                className="services-card fade-in-on-scroll card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="services-card-content">
                  {/* Icon */}
                  <div className={`services-card-icon bg-gradient-to-r ${service.color}`}>
                    <i className={service.icon}></i>
                  </div>
                  
                  {/* Title */}
                  <h3 className="services-card-title">
                    <i className={`${service.titleIcon} services-card-title-icon`}></i>
                    <span>{service.title}</span>
                  </h3>
                  
                  {/* Description */}
                  <p className="services-card-description">
                    {service.desc}
                  </p>
                  
                  {/* CTA Button */}
                  <NewButton
                    href="/servicos"
                    variant="new_primary_rounded"
                    icon={<i className="fa-duotone fa-arrow-right text-xl"></i>}
                    iconPosition="right"
                    className="mt-auto uppercase text-white font-bold text-lg w-full hero-cta-btn"
                  >
                    Saber mais
                  </NewButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in-on-scroll">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 font-montserrat">
                Sobre <span className="text-primary">Mim</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed font-montserrat">
                Sou um personal trainer apaixonado por fitness e transformação.
                Com anos de experiência, ajudo pessoas a alcançarem os seus objetivos
                através de treinos personalizados e acompanhamento dedicado.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-4 bg-white rounded-xl shadow-md">
                  <div className="text-3xl font-bold text-blue-500 mb-2 font-montserrat">10+</div>
                  <div className="text-gray-600 font-montserrat">Anos de Experiência</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-md">
                  <div className="text-3xl font-bold text-primary mb-2 font-montserrat">100+</div>
                  <div className="text-gray-600 font-montserrat">Clientes Satisfeitos</div>
                </div>
              </div>
              <div className="text-center mb-8">
                <NewButton href="/sobre" variant="primary" icon={<i className="fa-duotone fa-user-graduate"></i>}>
                  Saber Mais
                </NewButton>
              </div>
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl border-l-4 border-primary">
                <p className="text-lg text-gray-700 italic text-center font-montserrat">
                  <i className="fa-duotone fa-quote-left text-primary mr-2"></i>
                  Aquele que não tem tempo de cuidar da saúde, vai precisar de tempo para cuidar da doença
                  <i className="fa-duotone fa-quote-right text-primary ml-2"></i>
                </p>
              </div>
            </div>

            <div className="relative fade-in-on-scroll">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-md mx-auto">
                <Image
                  src="/images/bike.jpg"
                  alt="Fábio Lé Personal Trainer"
                  width={400}
                  height={500}
                  className="w-full h-auto"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-on-scroll">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 font-montserrat">
              O Que Dizem os <span className="text-primary">Meus Clientes</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "O Fábio transformou completamente a minha abordagem ao fitness. Resultados incríveis em apenas 3 meses!",
                name: "Maria Silva",
                result: "Perdeu 15kg"
              },
              {
                text: "Acompanhamento excepcional e planos personalizados. Recomendo a 100%!",
                name: "João Santos",
                result: "Ganhou 8kg músculo"
              },
              {
                text: "Finalmente encontrei alguém que me entende e adapta os treinos à minha rotina.",
                name: "Ana Costa",
                result: "Melhorou 40% força"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg fade-in-on-scroll card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-yellow-400 text-2xl mb-4">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                </div>
                <p className="text-gray-600 mb-6 italic font-montserrat">
                  <i className="fa-solid fa-quote-left text-gray-300 mr-2"></i>
                  {testimonial.text}
                  <i className="fa-solid fa-quote-right text-gray-300 ml-2"></i>
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <div className="font-semibold text-gray-800 font-montserrat">{testimonial.name}</div>
                  <div className="text-primary text-sm font-medium font-montserrat">
                    <i className="fa-duotone fa-trophy mr-1"></i>
                    {testimonial.result}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center relative z-10">
          <div className="fade-in-on-scroll">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 font-montserrat">
              <i className="fa-duotone fa-fire-flame-curved text-primary mr-3"></i>
              Pronto para Transformar o Teu Corpo?
            </h2>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto font-montserrat">
              Junta-te aos meus clientes satisfeitos e começa hoje mesmo a tua transformação
            </p>
            <NewButton
              href="/contacto"
              variant="new_primary_rounded"
              icon={<i className="fa-duotone fa-calendar-check"></i>}
              className="text-lg py-4 px-10"
            >
              Marca a Tua Primeira Sessão
            </NewButton>
          </div>
        </div>
      </section>
    </div>
  );
}
