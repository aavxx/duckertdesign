"use client";

import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Very subtle blue gradient — top-right corner only */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 90% -5%, rgba(22,71,251,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "0 clamp(20px, 5vw, 80px)",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Top labels */}
        <div
          className="hero-badge"
          style={{
            paddingTop: "clamp(110px, 14vh, 148px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
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
              fontFamily: "'Space Grotesk', sans-serif",
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

        {/* Headline */}
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <h1
            className="hero-headline"
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontSize: "clamp(52px, 10vw, 130px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.94,
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
            borderTop: "1px solid #ebebeb",
            paddingTop: "clamp(24px, 3vw, 36px)",
            paddingBottom: "clamp(48px, 6vw, 72px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          <p
            className="hero-sub"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "15px",
              color: "#888",
              lineHeight: 1.78,
              maxWidth: "360px",
              margin: 0,
              fontWeight: 400,
            }}
          >
            Vi designer og udvikler professionelle hjemmesider til virksomheder der vil mere online.
          </p>

          <div
            className="hero-ctas"
            style={{ display: "flex", gap: "10px", flexShrink: 0, flexWrap: "wrap" }}
          >
            <button
              onClick={() => router.push("/kontakt")}
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

            <button
              onClick={() => scrollTo("#ydelser")}
              style={{
                padding: "14px 30px",
                background: "transparent",
                color: "#080808",
                border: "1px solid #ddd",
                borderRadius: "3px",
                fontSize: "11px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "border-color 0.22s ease, transform 0.18s cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#080808";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#ddd";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Se ydelser
            </button>
          </div>
        </div>
      </div>

    </section>
  );
}
