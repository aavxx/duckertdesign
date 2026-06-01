"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";

const navLinks = [
  { href: "#ydelser", label: "Ydelser" },
  { href: "#arbejde", label: "Arbejde" },
  { href: "#om", label: "Om" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 60) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 4) {
        setVisible(false);
        setMenuOpen(false);
      } else if (currentY < lastScrollY.current - 4) {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white"
        style={{
          transform: visible ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 40px",
            height: "96px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #ebebeb",
          }}
        >
          {/* Empty left side to keep logo centered */}
          <div style={{ width: "36px" }} />

          {/* Logo centered */}
          <Link
            href="/"
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
            }}
            aria-label="Duckert Design"
          >
            <Logo style={{ height: "44px", width: "auto" }} />
          </Link>

          {/* Hamburger – right side */}
          <button
            aria-label={menuOpen ? "Luk menu" : "Åbn menu"}
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              marginRight: "-8px",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              width: "36px",
            }}
          >
            <span
              style={{
                display: "block",
                width: "22px",
                height: "1px",
                background: "#080808",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none",
              }}
            />
            <span
              style={{
                display: "block",
                width: "22px",
                height: "1px",
                background: "#080808",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                opacity: menuOpen ? 0 : 1,
                transform: menuOpen ? "scaleX(0)" : "none",
              }}
            />
            <span
              style={{
                display: "block",
                width: "22px",
                height: "1px",
                background: "#080808",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </header>

      {/* Full-screen menu */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "#1647FB",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 40px",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <nav>
          {navLinks.map((link, i) => (
            <div key={link.href} style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
              <button
                onClick={() => handleNavClick(link.href)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "28px 0",
                  cursor: "pointer",
                  fontFamily: "Montserrat, sans-serif",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <span
                  style={{
                    fontSize: "clamp(36px, 6vw, 72px)",
                    fontWeight: 600,
                    color: "#ffffff",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {link.label}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
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
