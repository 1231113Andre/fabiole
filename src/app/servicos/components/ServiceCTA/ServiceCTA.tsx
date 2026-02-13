import NewButton from "@/app/components/newButton";

export function ServiceCTA() {
    return (
        <section className="py-20 bg-gradient-to-r from-primary via-primary-hover to-primary">
            <div className="ui-container text-center max-w-4xl mr-auto">
                <h2 className="mb-4 font-fugazone text-4xl uppercase text-white md:text-5xl lg:text-6xl drop-shadow-lg animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    Pronto para Começar?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto font-montserrat animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    Contacta-me para uma avaliação gratuita e descobre qual o melhor plano para ti
                </p>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <NewButton
                        href="/contacto"
                        variant="new_primary_rounded"
                        className="uppercase font-bold text-lg px-12 py-5"
                        icon={<i className="fa-duotone fa-arrow-right"></i>}
                        iconPosition="right"
                    >
                        Marca Avaliação Gratuita
                    </NewButton>
                </div>
            </div>
        </section>
    );
}



