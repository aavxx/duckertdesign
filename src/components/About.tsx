export default function About() {
  return (
    <section id="om" className="py-32 px-6 bg-[#1647FB]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-blue-300 font-medium mb-6">
              Om os
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight mb-8">
              Vi tror på at godt design løser problemer.
            </h2>
            <p className="text-blue-100 leading-relaxed text-lg mb-6">
              Duckert Design er et boutique webdesignbureau der specialiserer sig i at skabe digitale oplevelser med sjæl og formål.
            </p>
            <p className="text-blue-100 leading-relaxed">
              Vi arbejder tæt med vores klienter — fra startups til etablerede virksomheder — for at forstå deres unikke behov og omsætte dem til design der virker.
            </p>
          </div>
          <div className="space-y-8">
            {[
              { number: "50+", label: "Projekter leveret" },
              { number: "5+", label: "Års erfaring" },
              { number: "100%", label: "Tilfredse klienter" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border-t border-white/20 pt-8 flex justify-between items-baseline"
              >
                <span className="text-5xl font-semibold text-white">
                  {stat.number}
                </span>
                <span className="text-blue-200 text-sm font-medium uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
