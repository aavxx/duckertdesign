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
        padding: "clamp(80px, 12vw, 160px) clamp(20px, 5vw, 80px)",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
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
        padding: "clamp(32px, 5vw, 52px) 0",
        borderBottom: "1px solid #ebebeb",
        cursor: "default",
        transition: "opacity 0.2s",
        opacity: hovered ? 1 : 0.88,
      }}
    >
      {/* Desktop layout */}
      <div className="hidden md:grid" style={{ gridTemplateColumns: "72px 1fr 32px", gap: "40px", alignItems: "start" }}>
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
        <ServiceContent service={service} hovered={hovered} />
        <div
          style={{
            fontSize: "22px",
            color: hovered ? "#1647FB" : "#ddd",
            paddingTop: "6px",
            transition: "color 0.2s, transform 0.25s",
            transform: hovered ? "translate(3px, -3px)" : "translate(0, 0)",
            userSelect: "none",
            lineHeight: 1,
          }}
        >
          ↗
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={{ fontSize: "10px", color: "#ddd", fontWeight: 600, letterSpacing: "0.1em" }}>
            {service.number}
          </span>
          <span style={{ fontSize: "18px", color: hovered ? "#1647FB" : "#ddd", transition: "color 0.2s" }}>↗</span>
        </div>
        <ServiceContent service={service} hovered={hovered} />
      </div>
    </div>
  );
}

function ServiceContent({
  service,
  hovered,
}: {
  service: (typeof services)[0];
  hovered: boolean;
}) {
  return (
    <div>
      <h3
        style={{
          fontSize: "clamp(26px, 3.5vw, 48px)",
          fontWeight: 700,
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
          margin: "0 0 14px",
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
          margin: "0 0 18px",
        }}
      >
        {service.description}
      </p>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {service.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#bbb",
              border: "1px solid #e8e8e8",
              padding: "5px 12px",
              whiteSpace: "nowrap",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
