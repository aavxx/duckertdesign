"use client";

import { useState } from "react";

const SERVICES = [
  {
    number: "01",
    title: "Webdesign",
    description:
      "Skræddersyede hjemmesider med fokus på brugeroplevelse, konvertering og visuel identitet. Fra idé til live.",
    tags: ["Landing pages", "E-commerce", "Portfolios"],
  },
  {
    number: "02",
    title: "UI/UX Design",
    description:
      "Intuitive grænseflader og brugerflows der gør komplekse produkter enkle og behagelige at navigere.",
    tags: ["Wireframes", "Prototyping", "User testing"],
  },
  {
    number: "03",
    title: "Webudvikling",
    description:
      "Hurtige, tilgængelige og skalerbare webapplikationer bygget med moderne teknologier som Next.js og React.",
    tags: ["Next.js", "React", "Headless CMS"],
  },
];

export default function Services() {
  return (
    <section
      id="ydelser"
      style={{ padding: "clamp(80px, 12vw, 160px) clamp(20px, 5vw, 80px)" }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            paddingBottom: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            marginBottom: "clamp(40px, 6vw, 64px)",
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
            Ydelser
          </span>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "11px",
              color: "#222",
              fontWeight: 500,
            }}
          >
            03
          </span>
        </div>

        {/* Cards — separated by 1px dividers */}
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: "1px", background: "rgba(255,255,255,0.07)" }}
        >
          {SERVICES.map((s) => (
            <ServiceCard key={s.number} service={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service }: { service: (typeof SERVICES)[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#0f0f0f" : "#080808",
        padding: "clamp(28px, 4vw, 52px)",
        transition: "background 0.22s",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Blue top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "2px",
          background: "#1647FB",
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 0.32s cubic-bezier(0.16,1,0.3,1)",
        }}
      />

      {/* Number + arrow */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "clamp(20px, 3vw, 36px)",
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "11px",
            color: "#222",
            fontWeight: 500,
          }}
        >
          {service.number}
        </span>
        <span
          style={{
            fontSize: "18px",
            color: hovered ? "#1647FB" : "#222",
            transition: "color 0.2s, transform 0.22s",
            transform: hovered ? "translate(2px,-2px)" : "translate(0,0)",
            lineHeight: 1,
          }}
        >
          ↗
        </span>
      </div>

      <h3
        style={{
          fontFamily: "'Archivo', sans-serif",
          fontSize: "clamp(22px, 2.5vw, 34px)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "#fff",
          margin: "0 0 14px",
          lineHeight: 1.1,
        }}
      >
        {service.title}
      </h3>

      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "14px",
          color: "#555",
          lineHeight: 1.72,
          margin: "0 0 24px",
        }}
      >
        {service.description}
      </p>

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {service.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#333",
              border: "1px solid rgba(255,255,255,0.07)",
              padding: "4px 10px",
              borderRadius: "2px",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
