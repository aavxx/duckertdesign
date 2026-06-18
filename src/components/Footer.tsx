"use client";

import Link from "next/link";
import Logo from "./Logo";

const NAV_LINKS = [
  { label: "Ydelser", href: "/#ydelser" },
  { label: "Om", href: "/#om" },
  { label: "Kontakt", href: "/kundeservice" },
];

const LEGAL_LINKS = [
  { label: "Service Vilkår", href: "/service-vilkar" },
  { label: "Privatlivspolitik", href: "/privatlivspolitik" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div
        style={{
          background: "#1647FB",
          borderRadius: "48px 48px 0 0",
          padding: "clamp(56px, 9vw, 96px) clamp(24px, 6vw, 80px) clamp(36px, 5vw, 56px)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* Top row: logo + nav */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "40px",
              flexWrap: "wrap",
              marginBottom: "clamp(48px, 8vw, 80px)",
            }}
          >
            <Logo style={{ height: "40px", width: "auto", filter: "brightness(0) invert(1)" }} />

            <nav style={{ display: "flex", gap: "clamp(24px, 4vw, 44px)", flexWrap: "wrap", alignItems: "center" }}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.6)",
                    textDecoration: "none",
                    letterSpacing: "0.04em",
                    transition: "color 0.18s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Email as featured element */}
          <a
            href="mailto:hej@duckert.design"
            style={{
              display: "block",
              fontFamily: "'Archivo', sans-serif",
              fontSize: "clamp(28px, 5.5vw, 72px)",
              fontWeight: 700,
              letterSpacing: "-0.035em",
              color: "rgba(255,255,255,0.18)",
              textDecoration: "none",
              lineHeight: 1,
              marginBottom: "clamp(40px, 6vw, 64px)",
              transition: "color 0.25s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.18)")}
          >
            hej@duckert.design
          </a>

          {/* Bottom bar */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.12)",
              paddingTop: "clamp(18px, 2.5vw, 24px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "12px",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              © {year} Duckert Design
            </span>

            <div style={{ display: "flex", gap: "clamp(16px, 2vw, 24px)", flexWrap: "wrap" }}>
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.35)",
                    textDecoration: "none",
                    transition: "color 0.18s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
