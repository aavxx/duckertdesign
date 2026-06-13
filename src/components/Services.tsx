"use client";

import { useState } from "react";

const services = [
  {
    number: "01",
    title: "Webdesign",
    description:
      "Skræddersyede hjemmesider fra bunden — med fokus på brugeroplevelse, konvertering og æstetik.",
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
      "Hurtige, tilgængelige og skalerbare webapplikationer bygget med moderne teknologier.",
    tags: ["Next.js", "React", "Headless CMS"],
  },
];

export default function Services() {
  return (
    <section
      id="ydelser"
      style={{
        padding: "120px 40px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          paddingBottom: "24px",
          borderBottom: "1px solid #ebebeb",
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
          Ydelser
        </span>
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.14em",
            color: "#bbb",
            fontWeight: 600,
          }}
        >
          03
        </span>
      </div>

      {services.map((s) => (
        <ServiceRow key={s.number} service={s} />
      ))}
    </section>
  );
}

function ServiceRow({ service }: { service: (typeof services)[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "72px 1fr 32px",
        gap: "40px",
        alignItems: "start",
        padding: "48px 0",
        borderBottom: "1px solid #ebebeb",
        cursor: "default",
        transition: "opacity 0.2s",
        opacity: hovered ? 1 : 0.85,
      }}
    >
      <span
        style={{
          fontSize: "11px",
          color: "#ddd",
          fontWeight: 600,
          letterSpacing: "0.1em",
          paddingTop: "8px",
        }}
      >
        {service.number}
      </span>

      <div>
        <h3
          style={{
            fontSize: "clamp(28px, 3.5vw, 48px)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            margin: "0 0 16px",
            color: hovered ? "#1647FB" : "#080808",
            transition: "color 0.2s",
          }}
        >
          {service.title}
        </h3>
        <p
          style={{
            fontSize: "15px",
            color: "#999",
            lineHeight: 1.75,
            maxWidth: "480px",
            margin: "0 0 20px",
          }}
        >
          {service.description}
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {service.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#bbb",
                border: "1px solid #ebebeb",
                padding: "5px 12px",
                whiteSpace: "nowrap",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          fontSize: "20px",
          color: hovered ? "#1647FB" : "#ddd",
          paddingTop: "8px",
          transition: "color 0.2s, transform 0.2s",
          transform: hovered ? "translate(3px, -3px)" : "translate(0, 0)",
          userSelect: "none",
          lineHeight: 1,
        }}
      >
        ↗
      </div>
    </div>
  );
}
