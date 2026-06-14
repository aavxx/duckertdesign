"use client";

import { useState } from "react";

const PROJECTS = [
  {
    number: "01",
    category: "Webdesign",
    title: "Projekt Alfa",
    year: "2024",
    bg: "#101010",
    accent: "#1647FB",
  },
  {
    number: "02",
    category: "Branding",
    title: "Projekt Beta",
    year: "2024",
    bg: "#1647FB",
    accent: "#ffffff",
  },
  {
    number: "03",
    category: "UI/UX",
    title: "Projekt Gamma",
    year: "2024",
    bg: "#0d0d18",
    accent: "#4d72ff",
  },
  {
    number: "04",
    category: "Webudvikling",
    title: "Projekt Delta",
    year: "2024",
    bg: "#131313",
    accent: "#1647FB",
  },
];

export default function Work() {
  return (
    <section
      id="arbejde"
      style={{
        padding: "clamp(80px, 12vw, 160px) clamp(20px, 5vw, 80px)",
        background: "#060606",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            paddingBottom: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            marginBottom: "clamp(40px, 6vw, 52px)",
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#333",
            }}
          >
            Udvalgte projekter
          </span>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "11px",
              color: "#222",
              fontWeight: 500,
            }}
          >
            04
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "10px" }}>
          {PROJECTS.map((p) => (
            <ProjectCard key={p.number} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: (typeof PROJECTS)[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: project.bg,
        aspectRatio: "4 / 3",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "clamp(24px, 3vw, 40px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "4px",
        transition: "transform 0.38s cubic-bezier(0.16,1,0.3,1), border-color 0.22s",
        transform: hovered ? "scale(0.984)" : "scale(1)",
        borderColor: hovered ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)",
      }}
    >
      {/* Top */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "11px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          {project.number}
        </span>
        <span
          style={{
            fontSize: "20px",
            color: project.accent,
            lineHeight: 1,
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translate(0,0)" : "translate(-6px,6px)",
            transition: "opacity 0.22s, transform 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          ↗
        </span>
      </div>

      {/* Bottom */}
      <div>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            margin: "0 0 8px",
          }}
        >
          {project.category}
        </p>
        <h3
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: "clamp(20px, 2.2vw, 32px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#fff",
            margin: "0 0 8px",
            lineHeight: 1.05,
          }}
        >
          {project.title}
        </h3>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "11px",
            color: "rgba(255,255,255,0.2)",
          }}
        >
          {project.year}
        </span>
      </div>
    </div>
  );
}
