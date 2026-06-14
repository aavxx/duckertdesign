"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";

const NAV = [
  { label: "Ydelser",  id: "#ydelser" },
  { label: "Arbejde",  id: "#arbejde" },
  { label: "Om",       id: "#om" },
];

export default function Header() {
  const [scrolled,  setScrolled]  = useState(false);
  const [visible,   setVisible]   = useState(true);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      if (menuOpen) return;
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y < 60)                          setVisible(true);
      else if (y > lastScrollY.current + 4) setVisible(false);
      else if (y < lastScrollY.current - 4) setVisible(true);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    if (window.location.pathname !== "/") {
      window.location.href = "/" + id;
      return;
    }
    setTimeout(() => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          background:    scrolled ? "rgba(8,8,8,0.82)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom:  scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
          transform:     visible || menuOpen ? "translateY(0)" : "translateY(-100%)",
          transition:    "transform 0.4s cubic-bezier(0.16,1,0.3,1), background 0.3s, backdrop-filter 0.3s, border-color 0.3s",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 clamp(20px, 5vw, 80px)",
            height: "72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link href="/" aria-label="Duckert Design" style={{ display: "flex", alignItems: "center" }}>
            <Logo style={{ height: "36px", width: "auto", filter: "brightness(0) invert(1)" }} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex" style={{ alignItems: "center", gap: "36px" }}>
            {NAV.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "14px",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 500,
                  cursor: "pointer",
                  padding: "4px 0",
                  transition: "color 0.18s",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA + mobile hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/kontakt"
              className="hidden md:inline-block"
              style={{
                padding: "10px 22px",
                background: "#1647FB",
                color: "#fff",
                borderRadius: "4px",
                fontSize: "13px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                letterSpacing: "0.02em",
                textDecoration: "none",
                transition: "background 0.18s, transform 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#2355FF"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#1647FB"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Kontakt
            </Link>

            <button
              aria-label="Åbn menu"
              className="md:hidden"
              onClick={() => setMenuOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
            >
              <span style={{ display: "block", width: "22px", height: "1px", background: "#fff" }} />
              <span style={{ display: "block", width: "22px", height: "1px", background: "#fff" }} />
              <span style={{ display: "block", width: "22px", height: "1px", background: "#fff" }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 clamp(20px, 6vw, 48px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <button
          aria-label="Luk menu"
          onClick={() => setMenuOpen(false)}
          style={{
            position: "absolute",
            top: "20px",
            right: "clamp(20px, 6vw, 48px)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="4" x2="20" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="20" y1="4" x2="4" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <nav>
          {[...NAV, { label: "Kontakt", id: "/kontakt" }].map((link, i) => (
            <div key={link.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={() => {
                  if (link.id.startsWith("/")) {
                    setMenuOpen(false);
                    window.location.href = link.id;
                  } else {
                    scrollTo(link.id);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "22px 0",
                  cursor: "pointer",
                  fontFamily: "'Archivo', sans-serif",
                }}
              >
                <span style={{
                  fontSize: "clamp(32px, 8vw, 56px)",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}>
                  {link.label}
                </span>
                <span style={{ fontSize: "11px", color: "#2a2a2a", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}>
                  0{i + 1}
                </span>
              </button>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
