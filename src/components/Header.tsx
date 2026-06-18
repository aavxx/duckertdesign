"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";

const NAV = [
  { label: "Ydelser",  id: "#ydelser" },
  { label: "Om",       id: "#om" },
  { label: "Kontakt",  href: "/kundeservice" },
];

export default function Header() {
  const [scrolled,  setScrolled]  = useState(false);
  const [visible,   setVisible]   = useState(true);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const lastScrollY = useRef(0);
  const router = useRouter();
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
      {/* ── Fixed header bar ── */}
      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          background:     scrolled ? "rgba(255,255,255,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(24px) saturate(1.6)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px) saturate(1.6)" : "none",
          borderBottom:   scrolled ? "1px solid #ebebeb" : "1px solid transparent",
          transform:      visible || menuOpen ? "translateY(0)" : "translateY(-100%)",
          transition:     [
            "transform 0.45s cubic-bezier(0.16,1,0.3,1)",
            "background 0.3s ease",
            "border-color 0.3s ease",
            "backdrop-filter 0.3s ease",
          ].join(", "),
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 clamp(20px, 5vw, 80px)",
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          {/* Left side */}
          {isKundeservice ? (
            <Link href="/" style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "13px", fontWeight: 600, color: "#080808",
              textDecoration: "none", opacity: 0.55,
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="#080808" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Forside
            </Link>
          ) : (
            <div style={{ width: "38px" }} />
          )}

          {/* Logo — absolute center */}
          <Link
            href="/"
            aria-label="Duckert Design"
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Logo style={{ height: "44px", width: "auto" }} />
          </Link>

          {/* Right side */}
          {isKundeservice ? (
            <div style={{ width: "38px" }} />
          ) : (
            <button
              aria-label="Åbn menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                marginRight: "-8px",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.5")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <span style={{ display: "block", width: "22px", height: "1px", background: "#080808" }} />
              <span style={{ display: "block", width: "22px", height: "1px", background: "#080808" }} />
              <span style={{ display: "block", width: "22px", height: "1px", background: "#080808" }} />
            </button>
          )}
        </div>
      </header>

      {/* ── Full-screen blue overlay menu ── */}
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
          transition: "opacity 0.4s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Close */}
        <button
          aria-label="Luk menu"
          onClick={() => setMenuOpen(false)}
          style={{
            position: "absolute",
            top: "clamp(20px, 4vh, 32px)",
            right: "clamp(24px, 6vw, 80px)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.5")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="4" x2="20" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="20" y1="4" x2="4" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Nav items */}
        <nav>
          {NAV.map((link, i) => (
            <div
              key={link.label}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}
            >
              <button
                onClick={() => {
                  if (link.href) {
                    setMenuOpen(false);
                    router.push(link.href);
                  } else if (link.id) {
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
                  padding: "clamp(20px, 3.5vh, 28px) 0",
                  cursor: "pointer",
                  fontFamily: "'Archivo', sans-serif",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.55")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <span
                  style={{
                    fontSize: "clamp(36px, 7vw, 72px)",
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: "-0.025em",
                    lineHeight: 1,
                  }}
                >
                  {link.label}
                </span>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.4)",
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                  }}
                >
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
