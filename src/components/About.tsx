"use client";

import Link from "next/link";

const VALUES = [
  {
    label: "Æstetik",
    desc: "Design der er smukt og funktionelt på én gang — uden kompromis.",
  },
  {
    label: "Hastighed",
    desc: "Fra idé til live hjemmeside hurtigere end du forventer.",
  },
  {
    label: "Resultater",
    desc: "Vi måler succes i konverteringer og vækst, ikke likes.",
  },
];

export default function About() {
  return (
    <section
      id="om"
      style={{
        padding: "clamp(80px, 12vw, 160px) clamp(20px, 5vw, 80px)",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Section label */}
        <div
          style={{
            paddingBottom: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            marginBottom: "clamp(56px, 8vw, 100px)",
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
                fontSize: "clamp(30px, 4vw, 56px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: "#fff",
                margin: "0 0 clamp(20px, 3vw, 36px)",
              }}
            >
              Godt design løser<br />
              <span style={{ color: "#1647FB" }}>problemer</span> —<br />
              ikke bare ser godt ud.
            </h2>

            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "15px",
                color: "#555",
                lineHeight: 1.8,
                margin: "0 0 clamp(28px, 4vw, 44px)",
                maxWidth: "460px",
              }}
            >
              Vi er et dansk webdesign studio med fokus på at skabe professionelle digitale løsninger der reelt bidrager til din virksomheds vækst online.
            </p>

            <Link
              href="/kontakt"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "#1647FB",
                textDecoration: "none",
                letterSpacing: "0.02em",
                transition: "opacity 0.18s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.65")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Start et projekt →
            </Link>
          </div>

          {/* Right — values list */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {VALUES.map((v) => (
              <div
                key={v.label}
                style={{
                  display: "flex",
                  gap: "clamp(16px, 3vw, 36px)",
                  padding: "clamp(18px, 2.5vw, 28px) 0",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#1647FB",
                    minWidth: "84px",
                    paddingTop: "2px",
                    flexShrink: 0,
                  }}
                >
                  {v.label}
                </span>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "14px",
                    color: "#555",
                    lineHeight: 1.68,
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
