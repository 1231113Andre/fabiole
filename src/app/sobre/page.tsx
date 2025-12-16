import Image from "next/image";

export const metadata = {
  title: "Sobre",
};

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Hero Section */}
      <section className="pt-5 pb-3 bg-gradient-to-br from-blue-100 to-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-4 items-center">
            <div className="lg:col-span-1">
              <div className="relative">
                <div className="relative rounded-lg overflow-hidden shadow-lg mx-auto" style={{ maxWidth: '400px' }}>
                  <Image
                    src="/images/sobremim.png"
                    alt="Fábio Lé Personal Trainer"
                    width={400}
                    height={500}
                    className="w-full h-auto"
                  />
                  <div className="absolute top-0 left-0 right-0 bottom-0" style={{ background: 'linear-gradient(to top, rgba(107, 114, 128, 0.2), transparent)' }}></div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="mb-4">
                <h1 className="text-3xl font-bold mb-3">
                  <span className="text-primary">Sobre</span> Mim
                </h1>
                <div className="text-gray-600 leading-relaxed">
                  <p className="mb-3">
                    Olá! Sou o Fábio Lé, um apaixonado por saúde e bem-estar, dedicado a ajudar pessoas a alcançarem os seus objetivos de forma segura e eficaz.
                  </p>
                  <p className="mb-3">
                    Com a minha formação em diversas áreas tais como, lesões e patologias da coluna, pré e pós-parto ou pilates, estou aqui disponível para te ajudar a cumprir todos os teus objetivos.
                  </p>
                  <p className="mb-0">
                    O meu foco está em proporcionar treinos personalizados e adaptados às necessidades individuais. Acredito na importância de um trabalho pessoal e orientado, visando não apenas resultados visíveis, mas também a saúde e o bem-estar geral.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-1">
                  <div className="bg-white text-center border border-primary shadow-sm h-full rounded-lg">
                    <div className="p-4">
                      <div className="text-2xl font-bold text-primary mb-1">10+</div>
                      <div className="text-gray-600 text-sm font-medium">Anos de Experiência</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="bg-white text-center border border-secondary shadow-sm h-full rounded-lg">
                    <div className="p-4">
                      <div className="text-2xl font-bold text-secondary mb-1">100+</div>
                      <div className="text-gray-600 text-sm font-medium">Clientes Satisfeitos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valências Section */}
      <section className="py-4 bg-gradient-to-br from-orange-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Valências e <span className="text-primary">Competências</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="bg-white text-center border border-primary shadow-sm h-full rounded-lg">
                <div className="p-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg" style={{ background: 'linear-gradient(to right, #1E90FF, #0066cc)' }}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" style={{ width: '1.5rem', height: '1.5rem' }}>
                      <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                      <path d="M12 16l6-3.3v4.8c0 .4-.2.8-.6 1l-5.4 3c-.4.2-.8.2-1.2 0l-5.4-3c-.4-.2-.6-.6-.6-1v-4.8L12 16z"/>
                      <path d="M12 18l6-3.3v4.8c0 .4-.2.8-.6 1l-5.4 3c-.4.2-.8.2-1.2 0l-5.4-3c-.4-.2-.6-.6-.6-1v-4.8L12 18z"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold mb-0">Licenciado em Desporto e Atividade Física</h3>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-white text-center border border-secondary shadow-sm h-full rounded-lg">
                <div className="p-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg" style={{ background: 'linear-gradient(to right, #FF6B35, #e55a2b)' }}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" style={{ width: '1.5rem', height: '1.5rem' }}>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold mb-0">Professor de Natação & Instrutor de Pilates</h3>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-white text-center border border-green-500 shadow-sm h-full rounded-lg">
                <div className="p-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg" style={{ background: 'linear-gradient(to right, #28A745, #1e7e34)' }}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" style={{ width: '1.5rem', height: '1.5rem' }}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold mb-0">Bombeiro Voluntário</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-4 bg-gradient-to-br from-blue-100 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              O Que Podes <span className="text-primary">Esperar de Mim</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="bg-white text-center border border-primary shadow-sm h-full rounded-lg">
                <div className="p-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg" style={{ background: 'linear-gradient(to right, #1E90FF, #0066cc)' }}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" style={{ width: '1.5rem', height: '1.5rem' }}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-3">MISSÃO</h3>
                  <p className="text-gray-600 text-sm mb-0">
                    Inspirar e guiar os meus clientes para que alcancem os seus objetivos pessoais, promovendo uma vida mais saudável e ativa.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-white text-center border border-secondary shadow-sm h-full rounded-lg">
                <div className="p-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg" style={{ background: 'linear-gradient(to right, #FF6B35, #e55a2b)' }}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" style={{ width: '1.5rem', height: '1.5rem' }}>
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-3">VISÃO</h3>
                  <p className="text-gray-600 text-sm mb-0">
                    Um futuro em que cada cliente atinge o seu melhor potencial, e se torna a versão mais saudável e feliz de si mesmo com a minha ajuda.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-white text-center border border-green-500 shadow-sm h-full rounded-lg">
                <div className="p-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg" style={{ background: 'linear-gradient(to right, #28A745, #1e7e34)' }}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" style={{ width: '1.5rem', height: '1.5rem' }}>
                      <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.5 2.54l2.6 1.53c.56-1.24.9-2.62.9-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-3">VALORES</h3>
                  <p className="text-gray-600 text-sm mb-0">
                    Compromisso, integridade, melhoria e comunicação.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-4 bg-gradient-to-r from-primary to-primary" style={{ background: 'linear-gradient(to right, #1E90FF, #0066cc)' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Pronto para Começar a Tua Transformação?
          </h2>
          <p className="text-xl text-white/70 mb-4 max-w-2xl mx-auto">
            Junta-te aos meus clientes satisfeitos e descobre o teu potencial máximo
          </p>
          <a 
            href="/contacto" 
            className="inline-block bg-secondary text-white px-8 py-3 rounded-full shadow-lg hover:bg-secondary/90 transition-colors text-lg font-semibold"
          >
            Marca a Tua Primeira Sessão
          </a>
        </div>
      </section>
    </main>
  );
}
