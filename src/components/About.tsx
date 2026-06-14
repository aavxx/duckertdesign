"use client";

import Link from "next/link";

const VALUES = [
  { label: "Æstetik",    desc: "Design der er smukt og funktionelt på én gang — uden kompromis." },
  { label: "Hastighed",  desc: "Fra idé til live hjemmeside hurtigere end du forventer." },
  { label: "Resultater", desc: "Vi måler succes i konverteringer og vækst, ikke likes." },
  { label: "Dialog",     desc: "Tæt samarbejde fra første møde til lancering." },
];

export default function About() {
  return (
    <section
      id="om"
      style={{
        background: "#ffffff",
        padding: "clamp(80px, 12vw, 160px) clamp(20px, 5vw, 80px)",
        borderTop: "1px solid #ebebeb",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Section label */}
        <div style={{ marginBottom: "clamp(48px, 8vw, 80px)" }}>
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
            Om os
          </span>
        </div>

        {/* Two-column grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: "clamp(48px, 8vw, 120px)", alignItems: "start" }}
        >
          {/* Left — headline + CTA */}
          <div>
            <h2
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontSize: "clamp(28px, 4vw, 52px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "#080808",
                margin: "0 0 clamp(20px, 3vw, 36px)",
              }}
            >
              Vi er et lille studio med{" "}
              <em style={{ fontStyle: "italic", fontWeight: 300, color: "#1647FB" }}>
                store ambitioner.
              </em>
            </h2>

            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "15px",
                color: "#888",
                lineHeight: 1.8,
                margin: "0 0 clamp(28px, 4vw, 44px)",
                maxWidth: "420px",
                fontWeight: 400,
              }}
            >
              Duckert Design er grundlagt i 2024 med ét mål: at give danske virksomheder adgang til
              professionelt webdesign — uanset størrelse eller budget.
            </p>

            <Link
              href="/kontakt"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "11px",
                fontWeight: 700,
                color: "#1647FB",
                textDecoration: "none",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                transition: "opacity 0.18s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Start et projekt →
            </Link>
          </div>

          {/* Right — values list */}
          <div style={{ borderTop: "1px solid #ebebeb" }}>
            {VALUES.map((v) => (
              <div
                key={v.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr",
                  gap: "20px",
                  padding: "clamp(18px, 2.5vw, 28px) 0",
                  borderBottom: "1px solid #ebebeb",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#1647FB",
                    paddingTop: "2px",
                  }}
                >
                  {v.label}
                </span>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "14px",
                    color: "#666",
                    lineHeight: 1.7,
                  }}
                >
                  {v.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
