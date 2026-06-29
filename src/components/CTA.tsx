"use client";

import { useRouter } from "next/navigation";

export default function CTA() {
  const router = useRouter();

  return (
    <section style={{
      background: "#1647FB",
      padding: "clamp(56px, 8vw, 100px) clamp(20px, 5vw, 80px)",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        {/* Eyebrow */}
        <span style={{
          display: "block",
          fontFamily: "var(--f-mono)",
          fontSize: "10px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)",
          marginBottom: "clamp(32px, 5vw, 52px)",
        }}>
          Start dit projekt
        </span>

        {/* Headline */}
        <h2 style={{
          fontFamily: "var(--f-display)",
          fontSize: "clamp(48px, 9vw, 120px)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 0.93,
          color: "#ffffff",
          margin: "0 0 clamp(40px, 6vw, 64px)",
        }}>
          Lad os skabe<br />
          <em style={{ fontStyle: "italic", fontWeight: 700, color: "rgba(255,255,255,0.35)" }}>
            noget fedt.
          </em>
        </h2>

        {/* Bottom row */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.15)",
          paddingTop: "clamp(24px, 3vw, 36px)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "32px",
          flexWrap: "wrap",
        }}>
          <p style={{
            fontFamily: "var(--f-body)",
            fontSize: "15px",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.78,
            maxWidth: "340px",
            margin: 0,
            fontWeight: 400,
          }}>
            Vi vender tilbage inden for 24 timer. Fortæl os om dit projekt.
          </p>

          <button
            onClick={() => router.push("/kontakt")}
            style={{
              padding: "14px 30px",
              background: "#ffffff",
              color: "#1647FB",
              border: "none",
              borderRadius: "3px",
              fontSize: "11px",
              fontFamily: "var(--f-body)",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              flexShrink: 0,
              transition: "opacity 0.2s, transform 0.18s cubic-bezier(0.16,1,0.3,1)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Start et projekt
          </button>
        </div>
      </div>
    </section>
  );
}
