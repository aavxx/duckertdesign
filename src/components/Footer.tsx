"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const NAV_LINKS = [
  { label: "Ydelser", href: "/#ydelser" },
  { label: "Om",      href: "/#om" },
  { label: "Kundeservice", href: "https://kundeservice.duckert.design" },
];

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();
  if (pathname?.startsWith("/mit")) return null;

  return (
    <footer>
      <div
        style={{
          background: "#1647FB",
          borderRadius: "50px 50px 0 0",
          padding: "67px clamp(24px, 5.5vw, 80px) 0",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

          {/* ── Main body: logo left, columns right ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "40px",
              flexWrap: "wrap",
              paddingBottom: "clamp(80px, 13vw, 170px)",
            }}
          >
            {/* Logo */}
            <Logo
              style={{
                height: "79px",
                width: "79px",
                filter: "brightness(0) invert(1)",
                flexShrink: 0,
              }}
            />

            {/* Navigation + Følg Os columns */}
            <div
              style={{
                display: "flex",
                gap: "clamp(48px, 8vw, 127px)",
                flexWrap: "wrap",
              }}
            >
              {/* Navigation */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "#ffffff",
                    marginBottom: "33px",
                  }}
                >
                  Navigation
                </span>
                {NAV_LINKS.map((link, i) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 500,
                      fontSize: "16px",
                      color: "#ffffff",
                      textDecoration: "none",
                      marginBottom: i < NAV_LINKS.length - 1 ? "27px" : "0",
                      transition: "opacity 0.18s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.65")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Følg Os */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "#ffffff",
                    marginBottom: "33px",
                  }}
                >
                  Følg Os
                </span>
                <a
                  href="https://www.facebook.com/people/Duckert-Design/61575584739688/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    textDecoration: "none",
                    transition: "opacity 0.18s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.65")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {/* White rectangle icon as per Figma (8×14px) */}
                  <span
                    aria-hidden="true"
                    style={{
                      display: "inline-block",
                      width: "8px",
                      height: "14px",
                      background: "#ffffff",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 500,
                      fontSize: "13px",
                      color: "#ffffff",
                    }}
                  >
                    Facebook
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* ── Divider ── */}
          <div style={{ borderTop: "1px solid rgba(54,93,252,1)" }} />

          {/* ── Bottom bar ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              padding: "28px 0 40px",
            }}
          >
            <span
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 400,
                fontSize: "11px",
                color: "#ffffff",
              }}
            >
              © {year} Duckert Design
            </span>

            <div style={{ display: "flex", gap: "clamp(16px, 2vw, 32px)", flexWrap: "wrap" }}>
              {[
                { label: "Service Vilkår",   href: "/service-vilkar" },
                { label: "Privatlivspolitik", href: "/privatlivspolitik" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 400,
                    fontSize: "11px",
                    color: "#ffffff",
                    textDecoration: "none",
                    transition: "opacity 0.18s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.65")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
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
