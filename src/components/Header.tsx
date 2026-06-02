"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "./Logo";

const navLinks = [
  { href: "#ydelser", label: "Ydelser", scroll: true },
  { href: "#om", label: "Om", scroll: true },
  { href: "/kontakt", label: "Kontakt", scroll: false },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (menuOpen) return;
      const currentY = window.scrollY;
      if (currentY < 60) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 4) {
        setVisible(false);
      } else if (currentY < lastScrollY.current - 4) {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  const handleNavClick = (link: typeof navLinks[0]) => {
    setMenuOpen(false);
    if (link.scroll) {
      if (window.location.pathname !== "/") {
        window.location.href = "/" + link.href;
        return;
      }
      setTimeout(() => {
        document.querySelector(link.href)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      router.push(link.href);
    }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white"
        style={{
          transform: (visible && !menuOpen) ? "translateY(0)" : "translateY(-100%)",
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
          {/* Empty left placeholder */}
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
            aria-label="Åbn menu"
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
            }}
          >
            <span style={{ display: "block", width: "22px", height: "1px", background: "#080808" }} />
            <span style={{ display: "block", width: "22px", height: "1px", background: "#080808" }} />
            <span style={{ display: "block", width: "22px", height: "1px", background: "#080808" }} />
          </button>
        </div>
      </header>

      {/* Full-screen menu overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
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
        {/* X close button */}
        <button
          aria-label="Luk menu"
          onClick={() => setMenuOpen(false)}
          style={{
            position: "absolute",
            top: "32px",
            right: "40px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="4" x2="20" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="20" y1="4" x2="4" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <nav>
          {navLinks.map((link, i) => (
            <div key={link.href} style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
              <button
                onClick={() => handleNavClick(link)}
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
