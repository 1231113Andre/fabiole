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
      <section className="relative flex h-[100vh] min-h-[600px] w-full items-center justify-center overflow-hidden sm:min-h-[500px]">
        <Image
          key="hero-banner"
          src="/images/fabiobanner.png"
          alt="Fábio Lé Personal Trainer"
          fill
          className="absolute inset-0 h-full w-full object-cover brightness-[0.6]"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50"></div>

        {/* Hero Content */}
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl animate-fade-in-up flex flex-col items-center gap-0">
            {/* Main Title */}
            <h1 className="mb-4 font-fugazone text-5xl tracking-wide md:text-7xl lg:text-8xl ui-text-hero">
              <span className="drop-shadow-2xl">FÁBIO LÉ</span>
            </h1>

            {/* Subtitle */}
            <h2 className="mb-6 font-fugazone text-2xl tracking-wider ui-text-accent md:text-4xl lg:text-5xl">
              PERSONAL TRAINER
            </h2>

            {/* Description */}
            <p className="mx-auto mb-0 max-w-2xl text-lg ui-text-light font-montserrat md:text-xl lg:text-2xl">
              Transforma o teu corpo, transforma a tua vida.
            </p>
            <p className="mt-0 mb-4 pt-1 text-lg font-semibold font-montserrat ui-text-accent md:mb-6 md:text-xl">
              Resultados que se notam por dentro e por fora.
            </p>

            {/* CTA Buttons */}
            <div className="mt-0 flex flex-col items-center justify-center gap-4 uppercase sm:flex-row">
              <NewButton
                href="/contacto"
                variant="new_primary_rounded"
                icon={<i className="fa-duotone fa-calendar-check text-xl"></i>}
                iconPosition="right"
                className="w-[250px] min-w-[250px] max-w-[250px] py-3 text-lg font-bold leading-tight ui-text-light gap-1"
              >
                Marca já a tua sessão
              </NewButton>
              <NewButton
                href="/servicos"
                variant="new_primary_no_bg_rounded"
                icon={<i className="fa-duotone fa-briefcase text-xl"></i>}
                iconPosition="right"
                className="w-[250px] min-w-[250px] max-w-[250px] py-3 text-lg font-bold leading-tight ui-text-light gap-1"
              >
                Ver serviços
              </NewButton>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative z-10 w-full bg-slate-50 py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">

            {/* Title */}
            <h2 className="mb-4 font-fugazone text-4xl uppercase text-gray-900 md:text-5xl lg:text-6xl text-center">
              Os Meus <span className="ui-text-accent">Serviços</span>
            </h2>

            {/* Subtitle */}
            <p className="mb-12 max-w-2xl text-center text-lg font-medium text-gray-700 md:text-xl">
              Planos personalizados para diferentes objetivos e níveis de fitness
            </p>

            {/* Badges Grid (2 top, 1 bottom center) */}
            <div className="mb-16 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">

              {/* Badge 1 */}
              <div className="flex flex-row items-center justify-center text-center gap-2 rounded-2xl border-2 border-emerald-700 bg-white px-8 py-1 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-800/30 transition-transform">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-xl text-red-600">
                  <i className="fa-duotone fa-heart-pulse"></i>
                </div>
                <p className="font-semibold text-gray-800 text-sm md:text-base whitespace-nowrap">
                  Avaliação física inicial é gratuita!
                </p>
              </div>

              {/* Badge 2 */}
              <div className="flex flex-row items-center justify-center text-center gap-2 rounded-2xl border-2 border-emerald-700 bg-white px-8 py-1 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-800/30 transition-transform">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-xl text-orange-600">
                  <i className="fa-duotone fa-clipboard-list"></i>
                </div>
                <p className="font-semibold text-gray-800 text-sm md:text-base whitespace-nowrap">
                  Planos 100% personalizados
                </p>
              </div>

              {/* Badge 3 (Centered) */}
              <div className="col-span-1 flex flex-row items-center justify-center text-center gap-2 rounded-2xl border-2 border-emerald-700 bg-white px-8 py-1 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-800/30 transition-transform md:col-span-2 md:mx-auto md:w-3/5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-xl text-blue-600">
                  <i className="fa-duotone fa-calendar-check"></i>
                </div>
                <p className="font-semibold text-gray-800 text-sm md:text-base whitespace-nowrap">
                  Acompanhamento semanal
                </p>
              </div>

            </div>

            {/* Divider */}
            <div className="mb-12 mt-6 h-px w-full bg-gray-900 opacity-20"></div>

            {/* Transforme-se Connosco Header */}
            <div className="mb-14 flex flex-col items-center text-center">
              <h2 className="mb-6 text-center font-fugazone text-4xl uppercase text-gray-900 md:text-5xl lg:text-6xl">
                Transforme-se <span className="ui-text-accent">Connosco</span>
              </h2>
              <p className="max-w-3xl text-center text-xl font-medium text-gray-700 md:text-2xl">
                Escolha o plano que melhor se adapta à sua rotina e objetivos
              </p>
            </div>

            {/* Service Cards Grid */}
            <div className="grid w-full gap-10 md:grid-cols-2 lg:grid-cols-3 lg:max-w-screen-2xl px-4">
              {[
                {
                  title: "Treinos Presenciais",
                  desc: "Sessões 1:1 com acompanhamento personalizado no ginásio ou ao ar livre.",
                  icon: "fa-dumbbell",
                  href: "/servicos/presencial",
                },
                {
                  title: "Treinos Online",
                  desc: "Planos remotos com acompanhamento semanal e ajustes personalizados.",
                  icon: "fa-laptop-code",
                  href: "/servicos/online",
                },
                {
                  title: "Planos Alimentares",
                  desc: "Nutrição alinhada ao teu objetivo de treino e estilo de vida.",
                  icon: "fa-apple-whole",
                  href: "/servicos/nutricao",
                },
              ].map((service, index) => (
                <div
                  key={index}
                  className="group relative flex h-full flex-col items-center justify-between overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-10 text-center shadow-lg transition-colors"
                >
                  {/* Icon with hover effect */}
                  <div className="mb-6 flex justify-center">
                    <i className={`fa-duotone ${service.icon} text-6xl text-gray-900 transition-colors duration-300 group-hover:text-primary`}></i>
                  </div>

                  {/* Title */}
                  <h3 className="mb-4 font-fugazone text-3xl uppercase leading-tight text-gray-900 transition-colors group-hover:text-primary">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="mb-8 font-medium text-gray-600 text-lg">
                    {service.desc}
                  </p>

                  {/* Button */}
                  <div className="mt-auto w-full">
                    <NewButton
                      href={service.href}
                      variant="new_primary_rounded"
                      className="mx-auto h-12 w-auto gap-3 px-8 text-base uppercase font-bold shadow-md"
                    >
                      Saber mais <i className="fa-regular fa-arrow-right"></i>
                    </NewButton>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Divider matching the top one */}
            <div className="mb-12 mt-20 h-px w-full bg-gray-900 opacity-20"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-white">
        <div className="ui-container">
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
        <div className="ui-container">
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

        <div className="ui-container text-center relative z-10">
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
