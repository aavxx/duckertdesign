"use client";

import { useRouter } from "next/navigation";

const stats = [
  { value: "30+", label: "Projekter leveret" },
  { value: "100%", label: "Tilfredse kunder" },
  { value: "3–6 uger", label: "Gennemsnitlig leveringstid" },
];

export default function Hero() {
  const router = useRouter();
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "0 40px",
        maxWidth: "1400px",
        margin: "0 auto",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      {/* Top label row */}
      <div
        style={{
          paddingTop: "128px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.18em",
            color: "#bbb",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Duckert Design Studio
        </span>
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.18em",
            color: "#bbb",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Est. 2024
        </span>
      </div>

      {/* Main headline */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(72px, 13vw, 180px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.88,
            color: "#080808",
            margin: 0,
          }}
        >
          Design
          <br />
          <span style={{ paddingLeft: "0.18em" }}>der</span>
          <br />
          <em
            style={{
              fontStyle: "italic",
              fontWeight: 300,
              color: "#1647FB",
              paddingLeft: "0.18em",
            }}
          >
            mærkes.
          </em>
        </h1>
      </div>

      {/* Stats + CTA row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "48px",
          alignItems: "end",
          paddingBottom: "64px",
          paddingTop: "40px",
          borderTop: "1px solid #ebebeb",
          flexWrap: "wrap",
        }}
      >
        {/* Stats */}
        <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
          {stats.map((s) => (
            <div key={s.value}>
              <div
                style={{
                  fontSize: "clamp(20px, 2.5vw, 32px)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: "#080808",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#bbb",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
          <button
            onClick={() => router.push("/kontakt")}
            style={{
              padding: "16px 36px",
              background: "#1647FB",
              color: "#fff",
              border: "none",
              fontSize: "10px",
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Start et projekt
          </button>
          <button
            onClick={() => scrollTo("#ydelser")}
            style={{
              padding: "16px 36px",
              background: "transparent",
              color: "#080808",
              border: "1px solid #d0d0d0",
              fontSize: "10px",
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#080808")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#d0d0d0")}
          >
            Se ydelser
          </button>
        </div>
      </div>
    </section>
  );
}
