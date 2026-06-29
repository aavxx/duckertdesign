"use client";

import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient blue glow */}
      <div aria-hidden style={{
        position: "absolute",
        top: "-15%", left: "-5%",
        width: "70vw", height: "70vw",
        maxWidth: "800px", maxHeight: "800px",
        background: "radial-gradient(ellipse, rgba(22,71,251,0.07) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "0 clamp(20px, 5vw, 80px)",
        maxWidth: "1400px",
        margin: "0 auto",
        width: "100%",
        position: "relative",
        zIndex: 1,
      }}>

        {/* Eyebrow */}
        <div className="hero-badge" style={{
          paddingTop: "clamp(110px, 14vh, 148px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "clamp(40px, 6vw, 72px)",
        }}>
          <span style={{
            fontFamily: "var(--f-body)",
            fontSize: "10px",
            letterSpacing: "0.2em",
            color: "var(--muted)",
            textTransform: "uppercase",
            fontWeight: 600,
          }}>
            Webdesign Studio
          </span>
          <span style={{
            fontFamily: "var(--f-mono)",
            fontSize: "10px",
            letterSpacing: "0.12em",
            color: "#1647FB",
          }}>
            Est. 2024
          </span>
        </div>

        {/* Headline */}
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <h1 className="hero-headline" style={{
            fontFamily: "var(--f-display)",
            fontSize: "clamp(52px, 10vw, 128px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.93,
            color: "var(--text)",
            margin: 0,
          }}>
            Vi designer<br />
            hjemmesider<br />
            <span style={{ color: "#1647FB" }}>der virker.</span>
          </h1>
        </div>

        {/* Bottom row */}
        <div className="hero-ctas" style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "clamp(24px, 3vw, 36px)",
          paddingBottom: "clamp(48px, 6vw, 72px)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "32px",
          flexWrap: "wrap",
        }}>
          <p className="hero-sub" style={{
            fontFamily: "var(--f-body)",
            fontSize: "15px",
            color: "var(--muted)",
            lineHeight: 1.8,
            maxWidth: "360px",
            margin: 0,
            fontWeight: 400,
          }}>
            Professionelle hjemmesider til virksomheder der vil stå stærkt online.
          </p>

          <div style={{ display: "flex", gap: "10px", flexShrink: 0, flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/kontakt")}
              style={{
                padding: "14px 30px",
                background: "#1647FB",
                color: "#fff",
                border: "none",
                borderRadius: "3px",
                fontSize: "11px",
                fontFamily: "var(--f-body)",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "background 0.2s, transform 0.18s cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#2E5AFF"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#1647FB"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Start et projekt
            </button>

            <button
              onClick={() => scrollTo("#ydelser")}
              style={{
                padding: "14px 30px",
                background: "transparent",
                color: "var(--text)",
                border: "1px solid #2A2A2A",
                borderRadius: "3px",
                fontSize: "11px",
                fontFamily: "var(--f-body)",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "border-color 0.2s, transform 0.18s cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Se ydelser
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
