"use client";

import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "#1647FB",
        borderRadius: "80px 80px 0 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative ellipse */}
      <div
        style={{
          position: "absolute",
          width: "130%",
          height: "700px",
          borderRadius: "50%",
          background: "#0540F2",
          top: "160px",
          left: "-15%",
          pointerEvents: "none",
        }}
      />

      {/* CTA block */}
      <div
        style={{
          padding: "clamp(64px, 10vw, 112px) clamp(32px, 6vw, 80px) 0",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h2
          style={{
            fontSize: "clamp(40px, 7.5vw, 108px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.92,
            color: "#ffffff",
            margin: "0 0 clamp(32px, 4vw, 52px)",
          }}
        >
          Lad os skabe{" "}
          <em
            style={{
              fontStyle: "italic",
              fontWeight: 400,
              fontFamily: "'Instrument Serif', Georgia, serif",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            noget fedt.
          </em>
        </h2>
        <Link
          href="/kontakt"
          style={{
            display: "inline-block",
            padding: "15px 36px",
            background: "#ffffff",
            color: "#1647FB",
            fontSize: "10px",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Start et projekt
        </Link>
      </div>

      {/* Footer content */}
      <div
        style={{
          padding: "clamp(60px, 8vw, 96px) clamp(32px, 6vw, 80px) clamp(32px, 4vw, 48px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "40px" }}>
          <Logo
            style={{
              height: "clamp(48px, 6vw, 72px)",
              width: "auto",
              filter: "brightness(0) invert(1)",
            }}
          />
        </div>

        {/* Contact links */}
        <div style={{ display: "flex", gap: "clamp(20px, 4vw, 40px)", flexWrap: "wrap", marginBottom: "56px" }}>
          <a
            href="mailto:hej@duckert.design"
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.75)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
          >
            hej@duckert.design
          </a>
          <a
            href="https://kundeservice.duckert.design"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.75)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
          >
            Kontakt Formular
          </a>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", gap: "clamp(16px, 3vw, 32px)", flexWrap: "wrap" }}>
            <Link
              href="/service-vilkar"
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.55)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
            >
              Service Vilkår
            </Link>
            <Link
              href="/privatlivspolitik"
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.55)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
            >
              Privatlivspolitik
            </Link>
          </div>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            © {year} Duckert Design
          </span>
        </div>
      </div>
    </footer>
  );
}
