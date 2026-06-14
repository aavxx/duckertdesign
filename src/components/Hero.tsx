"use client";

import { useRouter } from "next/navigation";

const MARQUEE_BASE = [
  "Webdesign", "UI/UX Design", "Webudvikling",
  "Webdesign", "UI/UX Design", "Webudvikling",
  "Webdesign", "UI/UX Design", "Webudvikling",
];
const MARQUEE_ITEMS = [...MARQUEE_BASE, ...MARQUEE_BASE];

const STATS = [
  { num: "03",   label: "Ydelser" },
  { num: "Est.", label: "2024" },
  { num: "DK",   label: "Danmark" },
];

export default function Hero() {
  const router = useRouter();
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

      {/* Ambient gradient blobs */}
      <div
        data-blob
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "clamp(400px, 50vw, 700px)",
          height: "clamp(400px, 50vw, 700px)",
          background: "radial-gradient(circle, rgba(22,71,251,0.18) 0%, transparent 70%)",
          borderRadius: "50%",
          top: "0%",
          right: "-5%",
          pointerEvents: "none",
          animation: "blob-float 14s ease-in-out infinite",
        }}
      />
      <div
        data-blob
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "clamp(250px, 30vw, 420px)",
          height: "clamp(250px, 30vw, 420px)",
          background: "radial-gradient(circle, rgba(22,71,251,0.09) 0%, transparent 70%)",
          borderRadius: "50%",
          bottom: "15%",
          left: "-5%",
          pointerEvents: "none",
          animation: "blob-float 18s ease-in-out infinite reverse",
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
        {/* Badge row */}
        <div
          style={{
            paddingTop: "clamp(100px, 13vh, 140px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid rgba(22,71,251,0.3)",
              background: "rgba(22,71,251,0.08)",
              padding: "6px 14px",
              borderRadius: "999px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#1647FB",
                display: "block",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
              }}
            >
              Est. 2024 · Duckert Design Studio
            </span>
          </div>
        </div>

        {/* Headline + CTA */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", paddingBlock: "clamp(32px, 5vw, 56px)" }}>
          <div style={{ width: "100%" }}>
            <h1
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontSize: "clamp(46px, 9.5vw, 124px)",
                fontWeight: 900,
                letterSpacing: "-0.035em",
                lineHeight: 0.94,
                color: "#ffffff",
                margin: "0 0 clamp(24px, 3.5vw, 44px)",
              }}
            >
              Vi bygger<br />
              <span style={{ color: "#1647FB" }}>hjemmesider</span><br />
              der sætter spor.
            </h1>

            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(14px, 1.4vw, 17px)",
                color: "#555",
                lineHeight: 1.75,
                maxWidth: "460px",
                margin: "0 0 clamp(28px, 4vw, 48px)",
                fontWeight: 400,
              }}
            >
              Professionelt webdesign, UI/UX og webudvikling til virksomheder der vil stå stærkt online.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={() => router.push("/kontakt")}
                style={{
                  padding: "15px 34px",
                  background: "#1647FB",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  cursor: "pointer",
                  transition: "background 0.18s, transform 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#2355FF"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#1647FB"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Start et projekt →
              </button>

              <button
                onClick={() => scrollTo("#arbejde")}
                style={{
                  padding: "15px 34px",
                  background: "transparent",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "border-color 0.18s, background 0.18s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "transparent"; }}
              >
                Se vores arbejde
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingTop: "28px",
            paddingBottom: "44px",
            display: "flex",
            gap: "clamp(32px, 6vw, 80px)",
            flexWrap: "wrap",
          }}
        >
          {STATS.map((s) => (
            <div key={s.num}>
              <div
                style={{
                  fontFamily: "'Archivo', sans-serif",
                  fontSize: "clamp(18px, 2.2vw, 26px)",
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "11px",
                  color: "#333",
                  fontWeight: 500,
                  marginTop: "4px",
                  letterSpacing: "0.04em",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee */}
      <div
        aria-hidden="true"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <div
          className="marquee-inner"
          style={{
            display: "inline-flex",
            alignItems: "center",
            animation: "marquee 26s linear infinite",
            paddingBlock: "13px",
          }}
        >
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#2a2a2a",
                  paddingInline: "28px",
                }}
              >
                {item}
              </span>
              <span style={{ color: "#1647FB", fontSize: "10px", lineHeight: 1 }}>✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
