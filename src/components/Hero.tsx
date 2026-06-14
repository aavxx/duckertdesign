"use client";

import { useRouter } from "next/navigation";

const MARQUEE_BASE = [
  "Webdesign", "UI/UX Design", "Webudvikling",
  "Webdesign", "UI/UX Design", "Webudvikling",
  "Webdesign", "UI/UX Design", "Webudvikling",
];
const MARQUEE_ITEMS = [...MARQUEE_BASE, ...MARQUEE_BASE];

export default function Hero() {
  const router = useRouter();
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "0 clamp(20px, 5vw, 80px)",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Top labels */}
        <div
          style={{
            paddingTop: "clamp(100px, 13vh, 140px)",
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

        {/* Headline */}
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <h1
            style={{
              fontSize: "clamp(54px, 10.5vw, 136px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              color: "#080808",
              margin: 0,
            }}
          >
            Design der{" "}
            <em
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                color: "#1647FB",
                fontFamily: "'Instrument Serif', Georgia, serif",
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
            gap: "32px",
            flexWrap: "wrap",
            paddingBottom: "56px",
            paddingTop: "32px",
            borderTop: "1px solid #ebebeb",
          }}
        >
          <p
            style={{
              fontSize: "15px",
              color: "#888",
              lineHeight: 1.8,
              maxWidth: "360px",
              margin: 0,
            }}
          >
            Vi designer og udvikler professionelle hjemmesider til virksomheder der vil mere online.
          </p>
          <div style={{ display: "flex", gap: "10px", flexShrink: 0, flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/kontakt")}
              style={{
                padding: "15px 32px",
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
                padding: "15px 32px",
                background: "transparent",
                color: "#080808",
                border: "1px solid #ddd",
                fontSize: "10px",
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#080808")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ddd")}
            >
              Se ydelser
            </button>
          </div>
        </div>
      </div>

      {/* Marquee ticker */}
      <div
        aria-hidden="true"
        style={{
          background: "#080808",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <div
          className="marquee-inner"
          style={{
            display: "inline-flex",
            alignItems: "center",
            animation: "marquee 22s linear infinite",
            paddingBlock: "14px",
          }}
        >
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  paddingInline: "28px",
                }}
              >
                {item}
              </span>
              <span style={{ color: "#1647FB", fontSize: "12px", lineHeight: 1 }}>✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
