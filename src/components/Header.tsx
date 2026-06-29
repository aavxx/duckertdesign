"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const NAV = [
  { label: "Ydelser",      id: "#ydelser" },
  { label: "Om",           id: "#om" },
  { label: "Kundeservice", href: "https://kundeservice.duckert.design" },
];

export default function Header() {
  const [scrolled,  setScrolled]  = useState(false);
  const [visible,   setVisible]   = useState(true);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const isKundeservice = pathname?.startsWith("/kundeservice");

  useEffect(() => {
    const onScroll = () => {
      if (menuOpen) return;
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y < 60)                           setVisible(true);
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
      <header style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        background:     scrolled ? "rgba(8,8,8,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom:   scrolled ? "1px solid #1E1E1E" : "1px solid transparent",
        transform:      visible || menuOpen ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1), background 0.3s ease, border-color 0.3s ease",
      }}>
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 clamp(20px, 5vw, 80px)",
          height: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}>
          {/* Left */}
          {isKundeservice ? (
            <Link href="/" style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "12px", fontWeight: 600, color: "#F0F0F0",
              textDecoration: "none", opacity: 0.4,
              fontFamily: "var(--f-body)",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Forside
            </Link>
          ) : (
            <div style={{ width: "38px" }} />
          )}

          {/* Logo — centered */}
          <Link href="/" aria-label="Duckert Design" style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
            <Logo style={{ height: "40px", width: "auto" }} />
          </Link>

          {/* Right */}
          {isKundeservice ? (
            <div style={{ width: "38px" }} />
          ) : (
            <button
              aria-label="Åbn menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "8px", marginRight: "-8px",
                display: "flex", flexDirection: "column", gap: "5px",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.45")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <span style={{ display: "block", width: "22px", height: "1px", background: "#F0F0F0" }} />
              <span style={{ display: "block", width: "22px", height: "1px", background: "#F0F0F0" }} />
              <span style={{ display: "block", width: "22px", height: "1px", background: "#F0F0F0" }} />
            </button>
          )}
        </div>
      </header>

      {/* Full-screen menu */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigationsmenu"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          background: "#1647FB",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 clamp(24px, 6vw, 80px)",
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
            top: "clamp(20px, 4vh, 32px)",
            right: "clamp(24px, 6vw, 80px)",
            background: "none", border: "none", cursor: "pointer",
            padding: "8px", transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.5")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="4" x2="20" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="20" y1="4" x2="4" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <nav>
          {NAV.map((link, i) => (
            <div key={link.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <button
                onClick={() => {
                  if (link.href) {
                    setMenuOpen(false);
                    window.location.href = link.href;
                  } else if (link.id) {
                    scrollTo(link.id);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  background: "none", border: "none",
                  padding: "clamp(20px, 3.5vh, 28px) 0",
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.5")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <span style={{
                  fontFamily: "var(--f-display)",
                  fontSize: "clamp(36px, 7vw, 72px)",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}>
                  {link.label}
                </span>
                <span style={{
                  fontFamily: "var(--f-mono)",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.35)",
                  fontWeight: 400,
                  letterSpacing: "0.08em",
                }}>
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
