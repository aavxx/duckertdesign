"use client";

import { useState } from "react";

const projects = [
  {
    number: "01",
    category: "Webdesign",
    title: "Projekt Alfa",
    year: "2024",
    bg: "#f0f0f0",
    color: "#080808",
  },
  {
    number: "02",
    category: "Branding",
    title: "Projekt Beta",
    year: "2024",
    bg: "#1647FB",
    color: "#ffffff",
  },
  {
    number: "03",
    category: "UI/UX",
    title: "Projekt Gamma",
    year: "2024",
    bg: "#080808",
    color: "#ffffff",
  },
  {
    number: "04",
    category: "Webudvikling",
    title: "Projekt Delta",
    year: "2024",
    bg: "#f0f0f0",
    color: "#080808",
  },
];

export default function Work() {
  return (
    <section
      id="arbejde"
      style={{
        padding: "clamp(80px, 12vw, 160px) clamp(20px, 5vw, 80px)",
        background: "#f9f9f9",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: "clamp(32px, 4vw, 52px)",
            borderBottom: "1px solid #e0e0e0",
            paddingBottom: "20px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#bbb",
            }}
          >
            Udvalgte projekter
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "#bbb",
              letterSpacing: "0.14em",
              fontWeight: 600,
            }}
          >
            04
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "10px" }}>
          {projects.map((p) => (
            <ProjectCard key={p.number} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: (typeof projects)[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: project.bg,
        aspectRatio: "4/3",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "clamp(24px, 3vw, 40px)",
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: hovered ? "scale(0.984)" : "scale(1)",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.1em",
            color: project.color,
            opacity: 0.35,
          }}
        >
          {project.number}
        </span>
        <span
          style={{
            fontSize: "22px",
            color: project.color,
            lineHeight: 1,
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translate(0, 0)" : "translate(-6px, 6px)",
            transition: "opacity 0.25s, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          ↗
        </span>
      </div>

      {/* Bottom info */}
      <div>
        <p
          style={{
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: project.color,
            opacity: 0.5,
            margin: "0 0 10px",
          }}
        >
          {project.category}
        </p>
        <h3
          style={{
            fontSize: "clamp(22px, 2.5vw, 36px)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: project.color,
            margin: "0 0 10px",
            lineHeight: 1.05,
          }}
        >
          {project.title}
        </h3>
        <span
          style={{
            fontSize: "11px",
            color: project.color,
            opacity: 0.35,
            letterSpacing: "0.05em",
          }}
        >
          {project.year}
        </span>
      </div>
    </div>
  );
}
