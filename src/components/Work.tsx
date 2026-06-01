const projects = [
  {
    category: "Webdesign",
    title: "Projekt Alfa",
    year: "2024",
    bg: "bg-gray-50",
  },
  {
    category: "Branding",
    title: "Projekt Beta",
    year: "2024",
    bg: "bg-[#1647FB]",
    light: true,
  },
  {
    category: "UI/UX",
    title: "Projekt Gamma",
    year: "2023",
    bg: "bg-gray-900",
    light: true,
  },
  {
    category: "Webudvikling",
    title: "Projekt Delta",
    year: "2023",
    bg: "bg-gray-50",
  },
];

export default function Work() {
  return (
    <section id="arbejde" className="py-32 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20">
          <p className="text-xs uppercase tracking-[0.25em] text-[#1647FB] font-medium mb-4">
            Udvalgte projekter
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Vores arbejde
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.title}
              className={`${project.bg} aspect-[4/3] flex flex-col justify-end p-8 group cursor-pointer overflow-hidden relative`}
            >
              <div className="relative z-10">
                <span
                  className={`text-xs uppercase tracking-widest font-medium ${
                    project.light ? "text-white/60" : "text-gray-400"
                  }`}
                >
                  {project.category} · {project.year}
                </span>
                <h3
                  className={`text-2xl font-semibold mt-2 ${
                    project.light ? "text-white" : "text-gray-900"
                  }`}
                >
                  {project.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
