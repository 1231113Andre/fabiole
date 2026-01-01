import Image from "next/image";
import NewButton from "@/app/components/newButton";

export const metadata = {
  title: "Sobre Mim",
  description: "Conheça o percurso e a missão do Fábio Lé, Personal Trainer dedicado à sua transformação.",
};

export default function SobrePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white">
      {/* Hero Section with Banner Image - Extends behind Navbar */}
      {/* Hero Section with Gradient Background (No Image) */}
      <section className="relative h-[40vh] w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">

        {/* Background Gradient Elements - Optional extra texture/blobs could go here, keeping it clean for now */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gray-800/30 via-transparent to-transparent z-0"></div>

        {/* Hero Content - Centered (pt-16 offsets navbar for visual centering) */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-16">
          <h1 className="font-fugazone text-4xl tracking-wide md:text-5xl lg:text-6xl text-white mb-4 drop-shadow-2xl">
            SOBRE <span className="text-primary">MIM</span>
          </h1>
          <div className="h-2 w-32 md:w-48 bg-primary rounded-full mx-auto mb-8 shadow-[0_0_20px_rgba(230,145,91,0.8)]"></div>
          <p className="text-gray-100 font-montserrat text-xl md:text-3xl font-bold max-w-4xl mx-auto drop-shadow-lg tracking-wide">
            "Transformando vidas através do movimento"
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="py-24 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-16 items-start">

          {/* Left Column: Image & Stats (Visuals) */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="relative z-10 mx-auto max-w-md lg:max-w-full group">
              {/* Main Image Container */}
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-[6px] border-white transition-transform duration-500 ease-out hover:scale-[1.02]">
                <Image
                  src="/images/sobremim.png"
                  alt="Fábio Lé Personal Trainer"
                  width={500}
                  height={650}
                  className="w-full h-auto object-cover"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
              </div>

              {/* Floating Stats Card 1 - Experience */}
              <div className="absolute -top-10 -left-10 z-20 hidden md:flex flex-col items-center justify-center w-36 h-36 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 animate-fade-in-up transition-transform duration-300 hover:scale-110 hover:rotate-3" style={{ animationDelay: '0.2s' }}>
                <span className="text-5xl font-fugazone text-primary drop-shadow-sm">10+</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1 text-center leading-tight">Anos de<br />Experiência</span>
              </div>

              {/* Floating Stats Card 2 - Clients */}
              <div className="absolute -bottom-8 -right-8 z-20 hidden md:flex flex-col items-center justify-center w-40 h-40 bg-gray-900 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-gray-800 animate-fade-in-up transition-transform duration-300 hover:scale-110 hover:-rotate-3" style={{ animationDelay: '0.4s' }}>
                <span className="text-5xl font-fugazone text-white drop-shadow-sm">100+</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1 text-center leading-tight">Clientes<br />Satisfeitos</span>
              </div>
            </div>

            {/* Mobile Stats */}
            <div className="grid grid-cols-2 gap-4 mt-12 md:hidden">
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-lg border border-gray-100">
                <span className="text-4xl font-fugazone text-primary">10+</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-2 text-center">Anos de<br />Experiência</span>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-gray-900 rounded-3xl shadow-lg border border-gray-800">
                <span className="text-4xl font-fugazone text-white">100+</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-2 text-center">Clientes<br />Satisfeitos</span>
              </div>
            </div>
          </div>

          {/* Right Column: Content (Text) */}
          <div className="lg:col-span-7 flex flex-col justify-center order-1 lg:order-2 space-y-10">

            {/* Main Description */}
            <div className="prose prose-xl text-gray-600 font-montserrat animate-fade-in-up space-y-8 text-center lg:text-left" style={{ animationDelay: '0.1s' }}>
              <p className="text-2xl md:text-3xl font-semibold leading-relaxed text-gray-800">
                Sou um personal trainer apaixonado por fitness e transformação.
              </p>
              <p className="leading-loose text-lg md:text-xl text-gray-600 text-justify">
                Com anos de experiência, ajudo pessoas a alcançarem os seus objetivos através de treinos personalizados e acompanhamento dedicado. O meu método foca-se não apenas no exercício físico, mas na mudança de mentalidade necessária para manter resultados a longo prazo.
              </p>
            </div>

            {/* Quote Section */}
            <div className="relative py-4 px-8 animate-fade-in-up mx-4 lg:mx-0" style={{ animationDelay: '0.2s' }}>
              <blockquote className="relative text-base md:text-lg font-normal italic text-gray-600 leading-relaxed text-center">
                "Aquele que não tem tempo de cuidar da saúde, vai precisar de tempo para cuidar da doença."
              </blockquote>
              <div className="mt-3 text-center">
                <span className="font-fugazone text-sm text-gray-500 tracking-wider uppercase">— Fábio Lé</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="animate-fade-in-up flex justify-center" style={{ animationDelay: '0.3s' }}>
              <NewButton
                href="/contacto"
                variant="new_primary_rounded"
                className="w-full sm:w-auto px-16 py-6 text-xl font-bold uppercase group shadow-xl shadow-primary/20 hover:shadow-primary/40"
                icon={<i className="fa-duotone fa-arrow-right group-hover:!text-black transition-colors duration-200"></i>}
                iconPosition="right"
              >
                <span className="group-hover:!text-black transition-colors duration-200">Saber Mais</span>
              </NewButton>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
