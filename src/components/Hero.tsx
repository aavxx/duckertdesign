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
        paddingTop: "64px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "64px 40px 60px",
        maxWidth: "1400px",
        margin: "0 auto",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: "64px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1400px",
          width: "100%",
        }}
      >
        <span style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#aaa", textTransform: "uppercase", fontWeight: 500 }}>
          Duckert Design Studio
        </span>
        <span style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#aaa", textTransform: "uppercase", fontWeight: 500 }}>
          © 2026
        </span>
      </div>

      {/* Main headline */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "80px" }}>
        <h1
          style={{
            fontSize: "clamp(52px, 9vw, 140px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 0.95,
            color: "#080808",
            margin: 0,
            maxWidth: "900px",
          }}
        >
          Design der
          <br />
          <em
            style={{
              fontStyle: "italic",
              fontWeight: 200,
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
          marginTop: "80px",
          paddingTop: "32px",
          borderTop: "1px solid #ebebeb",
        }}
      >
        <p
          style={{
            fontSize: "15px",
            color: "#888",
            fontWeight: 400,
            lineHeight: 1.7,
            maxWidth: "420px",
            margin: 0,
          }}
        >
          Vi designer og udvikler professionelle hjemmesider til virksomheder, der ønsker et stærkt, stilrent og moderne udtryk online.
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => router.push("/kontakt")}
            style={{
              padding: "14px 32px",
              background: "#1647FB",
              color: "#fff",
              border: "none",
              fontSize: "11px",
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 600,
              letterSpacing: "0.12em",
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
              padding: "14px 32px",
              background: "transparent",
              color: "#080808",
              border: "1px solid #ebebeb",
              fontSize: "11px",
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#080808")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ebebeb")}
          >
            Se ydelser
          </button>
        </div>
      </div>
    </section>
  );
}
