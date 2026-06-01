"use client";

const projects = [
  {
    number: "01",
    category: "Webdesign",
    title: "Projekt Alfa",
    year: "2024",
    bg: "#f0f0f0",
    color: "#080808",
    wide: true,
  },
  {
    number: "02",
    category: "Branding",
    title: "Projekt Beta",
    year: "2024",
    bg: "#1647FB",
    color: "#ffffff",
    wide: false,
  },
  {
    number: "03",
    category: "UI/UX",
    title: "Projekt Gamma",
    year: "2023",
    bg: "#080808",
    color: "#ffffff",
    wide: false,
  },
  {
    number: "04",
    category: "Webudvikling",
    title: "Projekt Delta",
    year: "2023",
    bg: "#f0f0f0",
    color: "#080808",
    wide: true,
  },
];

export default function Work() {
  return (
    <section
      id="arbejde"
      style={{
        padding: "120px 40px",
        background: "#f9f9f9",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: "64px",
            borderBottom: "1px solid #e0e0e0",
            paddingBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#aaa",
              margin: 0,
            }}
          >
            Udvalgte projekter
          </h2>
          <span style={{ fontSize: "11px", color: "#aaa", letterSpacing: "0.1em" }}>
            04 projekter
          </span>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "16px",
          }}
        >
          {/* Row 1: wide + narrow */}
          <ProjectCard project={projects[0]} colSpan={7} />
          <ProjectCard project={projects[1]} colSpan={5} />
          {/* Row 2: narrow + wide */}
          <ProjectCard project={projects[2]} colSpan={5} />
          <ProjectCard project={projects[3]} colSpan={7} />
        </div>
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  colSpan,
}: {
  project: (typeof projects)[0];
  colSpan: number;
}) {
  return (
    <div
      style={{
        gridColumn: `span ${colSpan}`,
        background: project.bg,
        aspectRatio: colSpan === 7 ? "16/10" : "4/5",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "32px",
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(0.985)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
      }}
    >
      {/* Top: number */}
      <span
        style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.1em",
          color: project.color,
          opacity: 0.4,
        }}
      >
        {project.number}
      </span>

      {/* Bottom: info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: project.color,
              opacity: 0.5,
              margin: "0 0 8px",
            }}
          >
            {project.category}
          </p>
          <h3
            style={{
              fontSize: "clamp(20px, 2.5vw, 32px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: project.color,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {project.title}
          </h3>
        </div>
        <span
          style={{
            fontSize: "11px",
            color: project.color,
            opacity: 0.4,
            letterSpacing: "0.05em",
          }}
        >
          {project.year}
        </span>
      </div>
    </div>
  );
}
