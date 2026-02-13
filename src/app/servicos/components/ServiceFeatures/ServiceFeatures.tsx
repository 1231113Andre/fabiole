export function ServiceFeatures() {
    return (
        <section className="py-20 bg-gradient-to-br from-orange-50 to-white">
            <div className="ui-container w-full max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="mb-4 font-fugazone text-4xl uppercase text-gray-900 md:text-5xl lg:text-6xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Porque Escolher os <span className="ui-text-accent">Meus Serviços</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-center text-lg font-medium text-gray-700 md:text-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Foco em resultados reais e sustentáveis
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full mr-auto">
                    <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-default hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                            <i className="fa-duotone fa-user-check text-2xl text-white"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 font-montserrat">Personalizado</h3>
                        <p className="text-gray-600 font-montserrat leading-relaxed">
                            Cada plano é adaptado às tuas necessidades, objetivos e rotina diária.
                        </p>
                    </div>

                    <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-default hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                            <i className="fa-duotone fa-chart-line text-2xl text-white"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 font-montserrat">Resultados</h3>
                        <p className="text-gray-600 font-montserrat leading-relaxed">
                            Foco em resultados reais e sustentáveis, com acompanhamento contínuo.
                        </p>
                    </div>

                    <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-default hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                            <i className="fa-duotone fa-headset text-2xl text-white"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 font-montserrat">Suporte</h3>
                        <p className="text-gray-600 font-montserrat leading-relaxed">
                            Suporte dedicado e motivação constante para manteres o foco.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}



