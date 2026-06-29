"use client";

import Link from "next/link";
import Logo from "./Logo";

const NAV_LINKS = [
  { label: "Ydelser",      href: "/#ydelser" },
  { label: "Om",           href: "/#om" },
  { label: "Kundeservice", href: "https://kundeservice.duckert.design" },
];

const LEGAL_LINKS = [
  { label: "Service Vilkår",    href: "/service-vilkar" },
  { label: "Privatlivspolitik", href: "/privatlivspolitik" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#0A0A0A", borderTop: "1px solid #1E1E1E" }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "clamp(48px, 6vw, 80px) clamp(20px, 5vw, 80px) 0",
      }}>

        {/* Main body */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "40px",
          flexWrap: "wrap",
          paddingBottom: "clamp(48px, 6vw, 72px)",
        }}>

          {/* Logo */}
          <Logo style={{ height: "56px", width: "56px", flexShrink: 0 }} />

          {/* Links */}
          <div style={{ display: "flex", gap: "clamp(40px, 6vw, 100px)", flexWrap: "wrap" }}>

            {/* Navigation */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{
                fontFamily: "var(--f-mono)",
                fontSize: "9px",
                fontWeight: 500,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#2A2A2A",
                marginBottom: "24px",
              }}>
                Navigation
              </span>
              {NAV_LINKS.map((link, i) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    fontFamily: "var(--f-body)",
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "var(--muted)",
                    textDecoration: "none",
                    marginBottom: i < NAV_LINKS.length - 1 ? "16px" : "0",
                    transition: "color 0.18s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Social */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{
                fontFamily: "var(--f-mono)",
                fontSize: "9px",
                fontWeight: 500,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#2A2A2A",
                marginBottom: "24px",
              }}>
                Følg Os
              </span>
              <a
                href="https://www.facebook.com/people/Duckert-Design/61575584739688/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: "14px",
                  color: "var(--muted)",
                  textDecoration: "none",
                  transition: "color 0.18s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid #1E1E1E",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          padding: "24px 0 32px",
        }}>
          <span style={{
            fontFamily: "var(--f-mono)",
            fontSize: "10px",
            color: "#2A2A2A",
            letterSpacing: "0.06em",
          }}>
            © {year} Duckert Design
          </span>

          <div style={{ display: "flex", gap: "clamp(16px, 2vw, 28px)", flexWrap: "wrap" }}>
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: "11px",
                  color: "#2A2A2A",
                  textDecoration: "none",
                  transition: "color 0.18s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#2A2A2A")}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
