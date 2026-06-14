"use client";

import Link from "next/link";

const differentiators = [
  {
    label: "Hurtig levering",
    desc: "Fra idé til færdig hjemmeside på rekordtid.",
  },
  {
    label: "Mobilvenlig",
    desc: "Alle sites fungerer perfekt på alle enheder.",
  },
  {
    label: "Personlig service",
    desc: "Direkte kontakt og løbende dialog undervejs.",
  },
];

export default function About() {
  return (
    <section
      id="om"
      style={{
        background: "#ffffff",
        padding: "clamp(80px, 12vw, 160px) clamp(20px, 5vw, 80px)",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Section label */}
        <div
          style={{
            paddingBottom: "20px",
            borderBottom: "1px solid #ebebeb",
            marginBottom: "clamp(56px, 8vw, 100px)",
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
            Om os
          </span>
        </div>

        {/* Main two-column grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: "clamp(40px, 7vw, 100px)", alignItems: "start" }}
        >
          {/* Left: headline */}
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 52px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "#080808",
              margin: 0,
            }}
          >
            Vi tror på at godt design løser problemer —{" "}
            <em
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                color: "#1647FB",
                fontFamily: "'Instrument Serif', Georgia, serif",
              }}
            >
              ikke bare ser godt ud.
            </em>
          </h2>

          {/* Right: body + differentiators + CTA */}
          <div>
            <p
              style={{
                fontSize: "15px",
                color: "#888",
                lineHeight: 1.9,
                margin: "0 0 48px",
              }}
            >
              Vi designer og udvikler professionelle hjemmesider til virksomheder, der ønsker et stærkt, stilrent og moderne udtryk online. Vores mål er at gøre det nemt og overskueligt for dig at få en ny hjemmeside, der virker perfekt på alle skærmstørrelser.
            </p>

            {/* Differentiators */}
            <div
              style={{
                borderTop: "1px solid #ebebeb",
                marginBottom: "48px",
              }}
            >
              {differentiators.map((d) => (
                <div
                  key={d.label}
                  style={{
                    display: "flex",
                    gap: "24px",
                    alignItems: "flex-start",
                    padding: "18px 0",
                    borderBottom: "1px solid #ebebeb",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#1647FB",
                      minWidth: "110px",
                      paddingTop: "3px",
                      flexShrink: 0,
                    }}
                  >
                    {d.label}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#888",
                      lineHeight: 1.65,
                    }}
                  >
                    {d.desc}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/kontakt"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#1647FB",
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Start et projekt
              <span style={{ fontSize: "18px", fontWeight: 300 }}>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
