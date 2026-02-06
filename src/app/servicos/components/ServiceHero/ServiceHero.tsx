import Image from "next/image";

export function ServiceHero() {
    return (
        <section className="relative ui-hero-subpage w-full flex items-center justify-center overflow-hidden">
            <Image
                key="servicos-banner"
                src="/images/banners/banner-01.png"
                alt="Fábio Lé Personal Trainer"
                fill
                className="absolute inset-0 h-full w-full object-cover brightness-[0.6]"
                priority
                sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50"></div>

            {/* Hero Content - Centered (pt-16 offsets navbar for visual centering) */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-16">
                <h1 className="font-fugazone text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wide text-white mb-3 sm:mb-4 drop-shadow-2xl">
                    SERVI<span className="text-primary">ÇOS</span>
                </h1>
                <div className="h-1.5 sm:h-2 w-24 sm:w-32 md:w-48 bg-primary rounded-full mx-auto mb-4 sm:mb-8 shadow-[0_0_20px_rgba(230,145,91,0.8)]"></div>
                <p className="text-gray-100 font-montserrat text-base sm:text-xl md:text-3xl font-bold max-w-4xl mx-auto drop-shadow-lg tracking-wide px-2">
                    "Escolhe o serviço que melhor encaixa nos teus objetivos e estilo de vida"
                </p>
            </div>
        </section>
    );
}



