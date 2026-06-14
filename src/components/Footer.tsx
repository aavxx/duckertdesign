"use client";

import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "#060606",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* CTA section */}
      <div
        style={{
          padding: "clamp(80px, 12vw, 160px) clamp(20px, 5vw, 80px) clamp(60px, 8vw, 100px)",
          maxWidth: "1400px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: "clamp(36px, 7vw, 96px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 0.93,
            color: "#fff",
            margin: "0 0 clamp(24px, 3vw, 40px)",
          }}
        >
          Klar til at komme<br />
          <span style={{ color: "#1647FB" }}>online?</span>
        </h2>

        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "15px",
            color: "#444",
            lineHeight: 1.75,
            margin: "0 auto clamp(32px, 4vw, 52px)",
            maxWidth: "400px",
          }}
        >
          Vi vender tilbage inden for 24 timer. Fortæl os om dit projekt.
        </p>

        <Link
          href="/kontakt"
          style={{
            display: "inline-block",
            padding: "16px 44px",
            background: "#1647FB",
            color: "#fff",
            borderRadius: "4px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "0.03em",
            textDecoration: "none",
            transition: "background 0.18s, transform 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#2355FF"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#1647FB"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          Start et projekt →
        </Link>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
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
        <Logo
          style={{
            height: "28px",
            width: "auto",
            filter: "brightness(0) invert(1)",
            opacity: 0.3,
          }}
        />

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
              fontSize: "13px",
              color: "#333",
              textDecoration: "none",
              transition: "color 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
          >
            hej@duckert.design
          </a>

          <Link
            href="/service-vilkar"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "13px",
              color: "#333",
              textDecoration: "none",
              transition: "color 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
          >
            Service Vilkår
          </Link>

          <Link
            href="/privatlivspolitik"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "13px",
              color: "#333",
              textDecoration: "none",
              transition: "color 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
          >
            Privatlivspolitik
          </Link>

          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "13px",
              color: "#222",
            }}
          >
            © {year} Duckert Design
          </span>
        </div>
      </div>
    </footer>
  );
}
