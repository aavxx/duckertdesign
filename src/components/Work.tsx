"use client";

import { useState } from "react";

const PROJECTS = [
  {
    category: "Webdesign",
    title: "Projekt Alfa",
    year: "2024",
    bg: "#101010",
    visual: "dots",
  },
  {
    category: "Branding",
    title: "Projekt Beta",
    year: "2024",
    bg: "#1647FB",
    visual: "letter",
  },
  {
    category: "UI/UX",
    title: "Projekt Gamma",
    year: "2024",
    bg: "#0d0d18",
    visual: "lines",
  },
  {
    category: "Webudvikling",
    title: "Projekt Delta",
    year: "2024",
    bg: "#131313",
    visual: "code",
  },
];

function CardVisual({ type, bg }: { type: string; bg: string }) {
  if (type === "dots") {
    return (
      <svg aria-hidden="true" viewBox="0 0 400 300" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="18" cy="18" r="1.8" fill="#1647FB" opacity="0.28" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#dot-grid)" />
      </svg>
    );
  }
  if (type === "letter") {
    return (
      <svg aria-hidden="true" viewBox="0 0 400 300" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid slice">
        <text x="30" y="270" fontFamily="Archivo, sans-serif" fontSize="260" fontWeight="900" fill="white" opacity="0.07">B</text>
      </svg>
    );
  }
  if (type === "lines") {
    return (
      <svg aria-hidden="true" viewBox="0 0 400 300" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid slice">
        {[56, 104, 152, 200, 248].map((y, i) => (
          <rect key={i} x="24" y={y} width={[200, 140, 240, 100, 180][i]} height="2" rx="1" fill="#1647FB" opacity="0.22" />
        ))}
      </svg>
    );
  }
  if (type === "code") {
    return (
      <svg aria-hidden="true" viewBox="0 0 400 300" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid slice">
        <text x="20" y="230" fontFamily="monospace" fontSize="190" fill="#1647FB" opacity="0.07">{"{ }"}</text>
      </svg>
    );
  }
  return null;
}

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
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.18)",
            }}
          >
            Udvalgte projekter
          </span>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "10px",
              color: "rgba(255,255,255,0.12)",
              fontWeight: 600,
              letterSpacing: "0.1em",
            }}
          >
            04
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "10px" }}>
          {PROJECTS.map((p) => (
            <ProjectCard key={p.title} project={p} />
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
        transition: "border-color 0.22s ease",
        borderColor: hovered ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
      }}
    >
      <CardVisual type={project.visual} bg={project.bg} />

      {/* Top */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.28)",
          }}
        >
          {project.category}
        </span>
        <span
          style={{
            fontSize: "18px",
            color: project.bg === "#1647FB" ? "rgba(255,255,255,0.9)" : "#1647FB",
            lineHeight: 1,
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translate(0,0)" : "translate(-5px,5px)",
            transition: "opacity 0.22s, transform 0.28s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          ↗
        </span>
      </div>

      {/* Bottom */}
      <div style={{ position: "relative", zIndex: 1 }}>
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
            color: "rgba(255,255,255,0.22)",
            letterSpacing: "0.06em",
          }}
        >
          {project.year}
        </span>
      </div>
    </div>
  );
}
