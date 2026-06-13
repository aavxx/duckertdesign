"use client";

import { useRouter } from "next/navigation";

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
        maxWidth: "1200px",
        margin: "0 auto",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      {/* Top labels */}
      <div
        style={{
          paddingTop: "120px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.16em",
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
            letterSpacing: "0.16em",
            color: "#bbb",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Est. 2024
        </span>
      </div>

      {/* Headline — centered vertically */}
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <h1
          style={{
            fontSize: "clamp(48px, 8vw, 96px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "#080808",
            margin: 0,
          }}
        >
          Design der{" "}
          <em
            style={{
              fontStyle: "italic",
              fontWeight: 300,
              color: "#1647FB",
            }}
          >
            mærkes.
          </em>
        </h1>
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "40px",
          flexWrap: "wrap",
          paddingBottom: "60px",
          paddingTop: "32px",
          borderTop: "1px solid #ebebeb",
        }}
      >
        <p
          style={{
            fontSize: "15px",
            color: "#888",
            lineHeight: 1.75,
            maxWidth: "360px",
            margin: 0,
          }}
        >
          Vi designer og udvikler professionelle hjemmesider til virksomheder der vil mere online.
        </p>
        <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
          <button
            onClick={() => router.push("/kontakt")}
            style={{
              padding: "14px 28px",
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
              padding: "14px 28px",
              background: "transparent",
              color: "#080808",
              border: "1px solid #e0e0e0",
              fontSize: "10px",
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#aaa")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
          >
            Se ydelser
          </button>
        </div>
      </div>
    </section>
  );
}
