"use client";

import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#f7f7f7" }}>
      {/* Blue rounded CTA block */}
      <div
        style={{
          background: "#1647FB",
          borderRadius: "80px 80px 0 0",
          padding: "clamp(80px, 12vw, 140px) clamp(24px, 6vw, 100px) clamp(64px, 10vw, 120px)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: "clamp(40px, 8vw, 110px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 0.92,
            color: "#ffffff",
            margin: "0 0 clamp(12px, 2vw, 24px)",
          }}
        >
          Lad os skabe
          <br />
          <em style={{ fontStyle: "italic", fontWeight: 300, color: "rgba(255,255,255,0.45)" }}>
            noget fedt.
          </em>
        </h2>

        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "15px",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.75,
            margin: "clamp(20px, 3vw, 36px) auto clamp(28px, 4vw, 48px)",
            maxWidth: "380px",
            fontWeight: 400,
          }}
        >
          Vi vender tilbage inden for 24 timer. Fortæl os om dit projekt.
        </p>

        <Link
          href="/kontakt"
          style={{
            display: "inline-block",
            padding: "15px 44px",
            background: "#ffffff",
            color: "#1647FB",
            borderRadius: "3px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textDecoration: "none",
            transition: "opacity 0.2s ease, transform 0.18s cubic-bezier(0.16,1,0.3,1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.88";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Start et projekt
        </Link>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          padding: "28px clamp(20px, 5vw, 80px)",
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <Logo style={{ height: "26px", width: "auto", opacity: 0.35 }} />

        <div
          style={{
            display: "flex",
            gap: "clamp(16px, 3vw, 32px)",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="mailto:hej@duckert.design"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "12px",
              color: "#aaa",
              textDecoration: "none",
              transition: "color 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#080808")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
          >
            hej@duckert.design
          </a>

          <Link
            href="/service-vilkar"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "12px",
              color: "#aaa",
              textDecoration: "none",
              transition: "color 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#080808")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
          >
            Service Vilkår
          </Link>

          <Link
            href="/privatlivspolitik"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "12px",
              color: "#aaa",
              textDecoration: "none",
              transition: "color 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#080808")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
          >
            Privatlivspolitik
          </Link>

          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "12px",
              color: "#bbb",
            }}
          >
            © {year} Duckert Design
          </span>
        </div>
      </div>
    </footer>
  );
}
