"use client";

import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "#1647FB",
        position: "relative",
        overflow: "hidden",
        padding: "80px 80px 48px",
      }}
    >
      {/* Corner masks – create the illusion of rounded top corners */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "80px", height: "80px", background: "#ffffff", borderRadius: "0 0 80px 0", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", background: "#ffffff", borderRadius: "0 0 0 80px", pointerEvents: "none" }} />

      {/* Decorative circle */}
      <div
        style={{
          position: "absolute",
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          right: "-80px",
          bottom: "-120px",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div style={{ marginBottom: "40px" }}>
        <Logo style={{ height: "72px", width: "auto", filter: "brightness(0) invert(1)" }} />
      </div>

      {/* Kundeservice */}
      <div style={{ marginBottom: "80px" }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            margin: "0 0 16px",
          }}
        >
          Kundeservice
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <a
            href="mailto:hej@duckert.design"
            style={{
              fontSize: "16px",
              color: "#ffffff",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            hej@duckert.design
          </a>
          <Link
            href="/kontakt"
            style={{
              fontSize: "16px",
              color: "#ffffff",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Kontakt Formular
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.12)",
          paddingTop: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "40px",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/service-vilkar"
          style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
        >
          Service Vilkår
        </Link>
        <Link
          href="/privatlivspolitik"
          style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
        >
          Privatlivs Politik
        </Link>
        <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>© {year}</span>
      </div>
    </footer>
  );
}
