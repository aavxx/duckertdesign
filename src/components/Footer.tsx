"use client";

import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "#1647FB",
        borderRadius: "100px 100px 0 0",
        position: "relative",
        overflow: "hidden",
        padding: "64px 80px 48px",
        marginTop: "0",
      }}
    >
      {/* Decorative circle */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: "#054FFF",
          top: "163px",
          left: "107px",
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
