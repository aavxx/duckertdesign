"use client";

import { useState } from "react";

const SERVICES = [
  {
    title: "Webdesign",
    description: "Skræddersyede hjemmesider fra bunden — med fokus på brugeroplevelse, konvertering og æstetik.",
    tags: ["Landing pages", "E-commerce", "Portfolios"],
  },
  {
    title: "UI/UX Design",
    description: "Intuitive grænseflader og brugerflows der gør komplekse produkter enkle og behagelige at navigere.",
    tags: ["Wireframes", "Prototyping", "User testing"],
  },
  {
    title: "Webudvikling",
    description: "Hurtige, tilgængelige og skalerbare webapplikationer bygget med moderne teknologier.",
    tags: ["Next.js", "React", "Headless CMS"],
  },
];

export default function Services() {
  return (
    <section id="ydelser" style={{
      background: "var(--bg)",
      padding: "clamp(48px, 6vw, 80px) clamp(20px, 5vw, 80px)",
      borderTop: "1px solid var(--border)",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        {/* Section header */}
        <div style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          paddingBottom: "20px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "0",
        }}>
          <span style={{
            fontFamily: "var(--f-body)",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}>
            Ydelser
          </span>
          <span style={{
            fontFamily: "var(--f-mono)",
            fontSize: "10px",
            color: "#1647FB",
            letterSpacing: "0.1em",
          }}>
            03
          </span>
        </div>

        {SERVICES.map((s, i) => (
          <ServiceRow key={s.title} service={s} index={i} />
        ))}
      </div>
    </section>
  );
}

function ServiceRow({ service, index }: { service: (typeof SERVICES)[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const num = String(index + 1).padStart(2, "0");

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1fr",
        padding: "clamp(36px, 5vw, 56px) 0 clamp(36px, 5vw, 56px) clamp(16px, 2vw, 28px)",
        borderBottom: "1px solid var(--border)",
        overflow: "hidden",
        boxShadow: hovered ? "inset 3px 0 0 #1647FB" : "inset 3px 0 0 transparent",
        transition: "box-shadow 0.22s ease",
        cursor: "default",
      }}
    >
      {/* Ghost number — signature element */}
      <span aria-hidden style={{
        position: "absolute",
        right: "-0.02em",
        top: "50%",
        transform: "translateY(-50%)",
        fontFamily: "var(--f-display)",
        fontSize: "clamp(100px, 16vw, 200px)",
        fontWeight: 800,
        color: hovered ? "rgba(22,71,251,0.1)" : "rgba(22,71,251,0.05)",
        lineHeight: 1,
        letterSpacing: "-0.05em",
        pointerEvents: "none",
        userSelect: "none",
        transition: "color 0.3s ease",
      }}>
        {num}
      </span>

      {/* Mono index */}
      <span style={{
        fontFamily: "var(--f-mono)",
        fontSize: "11px",
        color: "#1647FB",
        letterSpacing: "0.06em",
        marginBottom: "20px",
        display: "block",
      }}>
        {num}
      </span>

      {/* Title */}
      <h3 style={{
        fontFamily: "var(--f-display)",
        fontSize: "clamp(28px, 4.5vw, 56px)",
        fontWeight: 700,
        letterSpacing: "-0.03em",
        lineHeight: 1.05,
        margin: "0 0 16px",
        color: hovered ? "#1647FB" : "var(--text)",
        transition: "color 0.25s ease",
        position: "relative",
        zIndex: 1,
      }}>
        {service.title}
      </h3>

      {/* Description */}
      <p style={{
        fontFamily: "var(--f-body)",
        fontSize: "15px",
        color: "var(--muted)",
        lineHeight: 1.75,
        maxWidth: "480px",
        margin: "0 0 20px",
        fontWeight: 400,
        position: "relative",
        zIndex: 1,
      }}>
        {service.description}
      </p>

      {/* Tags */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
        {service.tags.map((tag) => (
          <span key={tag} style={{
            fontFamily: "var(--f-mono)",
            fontSize: "9px",
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#333",
            border: "1px solid #1E1E1E",
            padding: "5px 11px",
            borderRadius: "2px",
            whiteSpace: "nowrap",
          }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
