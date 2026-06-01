"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";

const navLinks = [
  { href: "#ydelser", label: "Ydelser" },
  { href: "#arbejde", label: "Arbejde" },
  { href: "#om", label: "Om" },
  { href: "#kontakt", label: "Kontakt" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 80) {
        setVisible(true);
      } else if (currentY > lastScrollY.current) {
        setVisible(false);
        setMenuOpen(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 transition-transform duration-400 ease-in-out"
        style={{ transform: visible ? "translateY(0)" : "translateY(-100%)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-10 h-10 flex flex-col justify-center items-center gap-[6px] group"
          >
            <span
              className="block w-6 h-[1.5px] bg-[#1647FB] transition-all duration-300 origin-center"
              style={
                menuOpen
                  ? { transform: "translateY(7.5px) rotate(45deg)" }
                  : {}
              }
            />
            <span
              className="block w-6 h-[1.5px] bg-[#1647FB] transition-all duration-300"
              style={menuOpen ? { opacity: 0, transform: "scaleX(0)" } : {}}
            />
            <span
              className="block w-6 h-[1.5px] bg-[#1647FB] transition-all duration-300 origin-center"
              style={
                menuOpen
                  ? { transform: "translateY(-7.5px) rotate(-45deg)" }
                  : {}
              }
            />
          </button>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2"
            aria-label="Duckert Design"
          >
            <Logo className="h-8 w-auto" />
          </Link>

          <div className="w-10" aria-hidden="true" />
        </div>
      </header>

      {/* Mobile overlay menu */}
      <div
        className="fixed inset-0 z-40 bg-white flex flex-col justify-center items-center transition-all duration-500 ease-in-out"
        style={
          menuOpen
            ? { opacity: 1, pointerEvents: "auto" }
            : { opacity: 0, pointerEvents: "none" }
        }
      >
        <nav className="flex flex-col items-center gap-10">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-3xl font-semibold tracking-tight text-[#1647FB] hover:opacity-60 transition-opacity duration-200"
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
