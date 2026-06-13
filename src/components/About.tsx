"use client";

import Link from "next/link";

const values = [
  {
    title: "Resultater frem for æstetik",
    body: "Godt design skal virke. Vi bygger hjemmesider der konverterer og skaber resultater for din virksomhed.",
  },
  {
    title: "Gennemsigtigt samarbejde",
    body: "Du ved altid præcist, hvor vi er i processen — ingen overraskelser, ingen forvirring.",
  },
  {
    title: "Solid teknologi",
    body: "Next.js, React og Headless CMS der skalerer med din virksomhed og vokser med dine behov.",
  },
];

export default function About() {
  return (
    <section
      id="om"
      style={{
        background: "#ffffff",
        padding: "120px 40px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Section label */}
        <div
          style={{
            paddingBottom: "24px",
            borderBottom: "1px solid #ebebeb",
            marginBottom: "80px",
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

        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "start",
            marginBottom: "80px",
          }}
        >
          {/* Left: big statement */}
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 52px)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              lineHeight: 1.1,
              color: "#080808",
              margin: 0,
            }}
          >
            Vi tror på at godt design løser problemer —{" "}
            <em style={{ fontStyle: "italic", fontWeight: 300, color: "#1647FB" }}>
              ikke bare ser godt ud.
            </em>
          </h2>

          {/* Right: description + CTA */}
          <div>
            <p
              style={{
                fontSize: "15px",
                color: "#888",
                lineHeight: 1.9,
                margin: "0 0 40px",
              }}
            >
              Vi designer og udvikler professionelle hjemmesider til virksomheder, der ønsker et stærkt, stilrent og moderne udtryk online. Vores mål er at gøre det nemt og overskueligt for dig at få en ny hjemmeside, der virker perfekt på alle skærmstørrelser.
            </p>
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

        {/* Values grid — white cards separated by thin lines */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "#ebebeb",
          }}
        >
          {values.map((v, i) => (
            <div
              key={v.title}
              style={{
                background: "#ffffff",
                padding: "40px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: "#1647FB",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                0{i + 1}
              </div>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  letterSpacing: "-0.015em",
                  color: "#080808",
                  margin: "0 0 12px",
                }}
              >
                {v.title}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#999",
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
