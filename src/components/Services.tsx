"use client";

import { useState } from "react";

const SERVICES = [
  {
    title: "Webdesign",
    description:
      "Skræddersyede hjemmesider fra bunden — med fokus på brugeroplevelse, konvertering og æstetik.",
    tags: ["Landing pages", "E-commerce", "Portfolios"],
  },
  {
    title: "UI/UX Design",
    description:
      "Intuitive grænseflader og brugerflows der gør komplekse produkter enkle og behagelige at navigere.",
    tags: ["Wireframes", "Prototyping", "User testing"],
  },
  {
    title: "Webudvikling",
    description:
      "Hurtige, tilgængelige og skalerbare webapplikationer bygget med moderne teknologier.",
    tags: ["Next.js", "React", "Headless CMS"],
  },
];

export default function Services() {
  return (
    <section
      id="ydelser"
      style={{
        background: "#ffffff",
        padding: "clamp(80px, 12vw, 160px) clamp(20px, 5vw, 80px)",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            paddingBottom: "20px",
            borderBottom: "1px solid #ebebeb",
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#bbb",
            }}
          >
            Ydelser
          </span>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "10px",
              color: "#bbb",
              fontWeight: 600,
              letterSpacing: "0.1em",
            }}
          >
            03
          </span>
        </div>

        {SERVICES.map((s) => (
          <ServiceRow key={s.title} service={s} />
        ))}
      </div>
    </section>
  );
}

function ServiceRow({ service }: { service: (typeof SERVICES)[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 28px",
        gap: "clamp(24px, 4vw, 48px)",
        alignItems: "start",
        padding: "clamp(36px, 5vw, 56px) 0",
        paddingLeft: "clamp(16px, 2vw, 24px)",
        borderBottom: "1px solid #ebebeb",
        cursor: "default",
        boxShadow: hovered ? "inset 3px 0 0 #1647FB" : "inset 3px 0 0 transparent",
        transition: "box-shadow 0.22s ease",
      }}
    >
      {/* Content */}
      <div>
        <h3
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: "clamp(26px, 3.5vw, 48px)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            margin: "0 0 14px",
            color: hovered ? "#1647FB" : "#080808",
            transition: "color 0.25s ease",
          }}
        >
          {service.title}
        </h3>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "15px",
            color: "#999",
            lineHeight: 1.75,
            maxWidth: "480px",
            margin: "0 0 18px",
            fontWeight: 400,
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
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#bbb",
                border: "1px solid #eee",
                padding: "5px 11px",
                borderRadius: "2px",
                whiteSpace: "nowrap",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div
        style={{
          fontSize: "20px",
          color: hovered ? "#1647FB" : "#ddd",
          paddingTop: "6px",
          lineHeight: 1,
          transition: "color 0.25s ease, transform 0.28s cubic-bezier(0.16,1,0.3,1)",
          transform: hovered ? "translate(3px,-3px)" : "translate(0,0)",
          userSelect: "none",
        }}
      >
        ↗
      </div>
    </div>
  );
}
