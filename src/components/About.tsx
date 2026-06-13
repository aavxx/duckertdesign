"use client";

import Link from "next/link";

const values = [
  {
    title: "Resultater frem for æstetik",
    body: "Godt design skal virke. Vi bygger hjemmesider der konverterer og skaber resultater.",
  },
  {
    title: "Gennemsigtigt samarbejde",
    body: "Du ved altid præcist, hvor vi er i processen — ingen overraskelser, ingen forvirring.",
  },
  {
    title: "Solid teknologi",
    body: "Vi bygger på moderne stack — Next.js, React og Headless CMS — der skalerer med din virksomhed.",
  },
];

export default function About() {
  return (
    <section
      id="om"
      style={{
        background: "#080808",
        padding: "120px 40px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Section label */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingBottom: "24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            marginBottom: "80px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Om os
          </span>
        </div>

        {/* Main statement */}
        <p
          style={{
            fontSize: "clamp(28px, 4vw, 60px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "#ffffff",
            margin: "0 0 80px",
            maxWidth: "900px",
          }}
        >
          Vi tror på at godt design løser problemer —{" "}
          <em style={{ fontStyle: "italic", fontWeight: 300, color: "rgba(255,255,255,0.4)" }}>
            ikke bare ser godt ud.
          </em>
        </p>

        {/* Values grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "rgba(255,255,255,0.1)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            marginBottom: "80px",
          }}
        >
          {values.map((v, i) => (
            <div
              key={v.title}
              style={{
                background: "#080808",
                padding: "48px 40px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: "#1647FB",
                  textTransform: "uppercase",
                  marginBottom: "20px",
                }}
              >
                0{i + 1}
              </div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "#ffffff",
                  margin: "0 0 16px",
                }}
              >
                {v.title}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                {v.body}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/kontakt"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#ffffff",
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.5")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Start et projekt
          <span style={{ fontSize: "20px", fontWeight: 300 }}>→</span>
        </Link>
      </div>
    </section>
  );
}
