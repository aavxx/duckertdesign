"use client";

export default function Hero() {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-16">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-[#1647FB] font-medium mb-6">
          Webdesign · Branding · UI/UX
        </p>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.1] mb-8">
          Design der
          <br />
          <span className="text-[#1647FB]">skiller sig ud.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 font-light leading-relaxed max-w-xl mx-auto mb-12">
          Vi bygger digitale oplevelser, der er smukke, funktionelle og skabt til at konvertere.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => scrollTo("#kontakt")}
            className="px-8 py-4 bg-[#1647FB] text-white text-sm font-medium tracking-wide hover:bg-blue-700 transition-colors duration-200"
          >
            Start et projekt
          </button>
          <button
            onClick={() => scrollTo("#arbejde")}
            className="px-8 py-4 border border-gray-200 text-sm font-medium tracking-wide hover:border-[#1647FB] hover:text-[#1647FB] transition-colors duration-200"
          >
            Se vores arbejde
          </button>
        </div>
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-[1px] h-16 bg-gray-200 mx-auto" />
      </div>
    </section>
  );
}
