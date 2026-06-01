const services = [
  {
    number: "01",
    title: "Webdesign",
    description:
      "Skræddersyede hjemmesider designet fra bunden med fokus på brugeroplevelse, konvertering og æstetik.",
  },
  {
    number: "02",
    title: "Branding",
    description:
      "Visuel identitet der fortæller din virksomheds historie — logo, farver, typografi og tone of voice.",
  },
  {
    number: "03",
    title: "UI/UX Design",
    description:
      "Intuitive grænseflader og brugerflows der gør komplekse produkter enkle og behagelige at bruge.",
  },
  {
    number: "04",
    title: "Webudvikling",
    description:
      "Hurtige, tilgængelige og skalerbare webapplikationer bygget med moderne teknologier.",
  },
];

export default function Services() {
  return (
    <section id="ydelser" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20">
          <p className="text-xs uppercase tracking-[0.25em] text-[#1647FB] font-medium mb-4">
            Hvad vi gør
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Ydelser
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
          {services.map((service) => (
            <div
              key={service.number}
              className="bg-white p-10 group hover:bg-[#1647FB] transition-colors duration-300"
            >
              <span className="text-xs text-gray-400 group-hover:text-blue-200 font-medium tracking-widest transition-colors duration-300">
                {service.number}
              </span>
              <h3 className="text-2xl font-semibold mt-4 mb-4 group-hover:text-white transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-gray-500 group-hover:text-blue-100 leading-relaxed transition-colors duration-300">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
