import Image from "next/image";

export const metadata = {
  title: "Sobre",
};

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Hero Section */}
      <section className="pt-20 pb-8 bg-gradient-to-br from-blue-100 to-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden shadow-xl max-w-md mx-auto">
                <Image
                  src="/images/sobremim.png"
                  alt="Fábio Lé Personal Trainer"
                  width={400}
                  height={500}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-400/20 to-transparent"></div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  <span className="text-[#1E90FF]">Sobre</span> Mim
                </h1>
                <div className="space-y-3 text-base text-gray-600 leading-relaxed">
                  <p>
                    Olá! Sou o Fábio Lé, um apaixonado por saúde e bem-estar, dedicado a ajudar pessoas a alcançarem os seus objetivos de forma segura e eficaz.
                  </p>
                  <p>
                    Com a minha formação em diversas áreas tais como, lesões e patologias da coluna, pré e pós-parto ou pilates, estou aqui disponível para te ajudar a cumprir todos os teus objetivos.
                  </p>
                  <p>
                    O meu foco está em proporcionar treinos personalizados e adaptados às necessidades individuais. Acredito na importância de um trabalho pessoal e orientado, visando não apenas resultados visíveis, mas também a saúde e o bem-estar geral.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border border-blue-200 shadow-md">
                  <div className="text-2xl font-bold text-[#1E90FF] mb-1">10+</div>
                  <div className="text-gray-600 text-sm font-medium">Anos de Experiência</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-orange-200 shadow-md">
                  <div className="text-2xl font-bold text-[#FF6B35] mb-1">100+</div>
                  <div className="text-gray-600 text-sm font-medium">Clientes Satisfeitos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valências Section */}
      <section className="py-8 bg-gradient-to-br from-orange-50 to-white">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Valências e <span className="text-[#1E90FF]">Competências</span>
            </h2>
          </div>

                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-[#1E90FF] to-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-md">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                  <path d="M12 16l6-3.3v4.8c0 .4-.2.8-.6 1l-5.4 3c-.4.2-.8.2-1.2 0l-5.4-3c-.4-.2-.6-.6-.6-1v-4.8L12 16z"/>
                  <path d="M12 18l6-3.3v4.8c0 .4-.2.8-.6 1l-5.4 3c-.4.2-.8.2-1.2 0l-5.4-3c-.4-.2-.6-.6-.6-1v-4.8L12 18z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Licenciado em Desporto e Atividade Física</h3>
            </div>

                         <div className="text-center p-6 bg-white rounded-xl border border-orange-200 shadow-md hover:shadow-lg transition-all duration-300">
               <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B35] to-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-md">
                 <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                 </svg>
               </div>
               <h3 className="text-lg font-bold text-gray-800 mb-2">Professor de Natação & Instrutor de Pilates</h3>
             </div>

             <div className="text-center p-6 bg-white rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-all duration-300">
               <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-md">
                 <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                 </svg>
               </div>
               <h3 className="text-lg font-bold text-gray-800 mb-2">Bombeiro Voluntário</h3>
             </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-8 bg-gradient-to-br from-blue-100 to-white">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              O Que Podes <span className="text-[#1E90FF]">Esperar de Mim</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-[#1E90FF] to-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-md">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">MISSÃO</h3>
              <p className="text-gray-600 text-sm">
                Inspirar e guiar os meus clientes para que alcancem os seus objetivos pessoais, promovendo uma vida mais saudável e ativa.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl border border-orange-200 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B35] to-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-md">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">VISÃO</h3>
              <p className="text-gray-600 text-sm">
                Um futuro em que cada cliente atinge o seu melhor potencial, e se torna a versão mais saudável e feliz de si mesmo com a minha ajuda.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-md">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.5 2.54l2.6 1.53c.56-1.24.9-2.62.9-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">VALORES</h3>
              <p className="text-gray-600 text-sm">
                Compromisso, integridade, melhoria e comunicação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 bg-gradient-to-r from-[#1E90FF] to-blue-600">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para Começar a Tua Transformação?
          </h2>
          <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
            Junta-te aos meus clientes satisfeitos e descobre o teu potencial máximo
          </p>
          <a 
            href="/contacto" 
            className="inline-block bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-bold text-lg px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Marca a Tua Primeira Sessão
          </a>
        </div>
      </section>
    </main>
  );
}


