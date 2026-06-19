"use client";

import { useRouter } from "next/navigation";

export default function CTA() {
  const router = useRouter();

  return (
    <section
      style={{
        background: "#ffffff",
        padding: "clamp(80px, 12vw, 160px) clamp(20px, 5vw, 80px)",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Section eyebrow */}
        <div style={{ marginBottom: "clamp(40px, 6vw, 64px)" }}>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.3)",
            }}
          >
            Start dit projekt
          </span>
        </div>

        {/* Headline */}
        <h2
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: "clamp(52px, 10vw, 130px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 0.94,
            color: "#0a0a0a",
            margin: "0 0 clamp(40px, 6vw, 72px)",
          }}
        >
          Lad os skabe{" "}
          <em
            style={{
              fontStyle: "italic",
              fontWeight: 300,
              color: "rgba(0,0,0,0.2)",
            }}
          >
            noget fedt.
          </em>
        </h2>

        {/* Bottom row */}
        <div
          style={{
            borderTop: "1px solid rgba(0,0,0,0.1)",
            paddingTop: "clamp(24px, 3vw, 36px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "15px",
              color: "rgba(0,0,0,0.45)",
              lineHeight: 1.78,
              maxWidth: "360px",
              margin: 0,
              fontWeight: 400,
            }}
          >
            Vi vender tilbage inden for 24 timer. Fortæl os om dit projekt.
          </p>

          <button
            onClick={() => router.push("/kundeservice")}
            style={{
              padding: "14px 30px",
              background: "#1647FB",
              color: "#fff",
              border: "none",
              borderRadius: "3px",
              fontSize: "11px",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              flexShrink: 0,
              transition: "background 0.22s ease, transform 0.18s cubic-bezier(0.16,1,0.3,1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#2355FF";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#1647FB";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Start et projekt
          </button>
        </div>
      </div>
    </section>
  );
}
