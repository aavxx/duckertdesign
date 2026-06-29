"use client";

import Link from "next/link";

const STATS = [
  { value: "2024", label: "Grundlagt" },
  { value: "24t",  label: "Svartid" },
  { value: "100%", label: "Tilfredse kunder" },
];

export default function About() {
  return (
    <section id="om" style={{
      background: "var(--bg)",
      padding: "clamp(48px, 6vw, 80px) clamp(20px, 5vw, 80px)",
      borderTop: "1px solid var(--border)",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        {/* Section label */}
        <span style={{
          fontFamily: "var(--f-body)",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--muted)",
          display: "block",
          marginBottom: "clamp(40px, 6vw, 64px)",
        }}>
          Om os
        </span>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{
          gap: "clamp(48px, 8vw, 100px)",
          alignItems: "start",
        }}>

          {/* Left — headline + body */}
          <div>
            <h2 style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(28px, 4vw, 52px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "var(--text)",
              margin: "0 0 clamp(20px, 3vw, 32px)",
            }}>
              Et lille studio.{" "}
              <em style={{ fontStyle: "italic", fontWeight: 700, color: "#1647FB" }}>
                Store resultater.
              </em>
            </h2>

            <p style={{
              fontFamily: "var(--f-body)",
              fontSize: "15px",
              color: "var(--muted)",
              lineHeight: 1.8,
              margin: "0 0 clamp(28px, 4vw, 40px)",
              maxWidth: "420px",
              fontWeight: 400,
            }}>
              Duckert Design er grundlagt i 2024 med ét mål: at give danske virksomheder adgang til
              professionelt webdesign — uanset størrelse eller budget.
            </p>

            <Link href="/kontakt" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "var(--f-body)",
              fontSize: "11px",
              fontWeight: 700,
              color: "#1647FB",
              textDecoration: "none",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              transition: "opacity 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.55")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
              Start et projekt →
            </Link>
          </div>

          {/* Right — stat cards */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            overflow: "hidden",
          }}>
            {STATS.map((stat, i) => (
              <div key={stat.label} style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: "20px",
                padding: "clamp(20px, 3vw, 28px) clamp(20px, 3vw, 32px)",
                borderBottom: i < STATS.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center",
              }}>
                <span style={{
                  fontFamily: "var(--f-mono)",
                  fontSize: "clamp(22px, 3vw, 30px)",
                  fontWeight: 400,
                  color: "#1647FB",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}>
                  {stat.value}
                </span>
                <span style={{
                  fontFamily: "var(--f-body)",
                  fontSize: "13px",
                  color: "var(--muted)",
                  fontWeight: 400,
                  lineHeight: 1.4,
                }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
