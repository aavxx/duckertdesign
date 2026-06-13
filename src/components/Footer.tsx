"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useRouter } from "next/navigation";

export default function Footer() {
  const year = new Date().getFullYear();
  const router = useRouter();

  return (
    <footer style={{ background: "#1647FB" }}>
      {/* CTA block */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "120px 40px 80px",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <p
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            margin: "0 0 40px",
          }}
        >
          Næste skridt
        </p>
        <h2
          style={{
            fontSize: "clamp(40px, 6.5vw, 96px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            color: "#ffffff",
            margin: "0 0 56px",
            maxWidth: "900px",
          }}
        >
          Klar til et nyt projekt?
        </h2>
        <button
          onClick={() => router.push("/kontakt")}
          style={{
            padding: "18px 48px",
            background: "#ffffff",
            color: "#080808",
            border: "none",
            fontSize: "10px",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Tag kontakt
        </button>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "48px 40px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          gap: "40px",
          flexWrap: "wrap",
        }}
      >
        {/* Left: logo + links */}
        <div style={{ display: "flex", alignItems: "center", gap: "48px", flexWrap: "wrap" }}>
          <Logo
            style={{ height: "36px", width: "auto", filter: "brightness(0) invert(1)", opacity: 0.8 }}
          />
          <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
            <a
              href="mailto:hej@duckert.design"
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                letterSpacing: "0.04em",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >
              hej@duckert.design
            </a>
            <Link
              href="/service-vilkar"
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                letterSpacing: "0.04em",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >
              Service Vilkår
            </Link>
            <Link
              href="/privatlivspolitik"
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                letterSpacing: "0.04em",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >
              Privatlivspolitik
            </Link>
          </div>
        </div>

        {/* Right: copyright */}
        <span
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
          }}
        >
          © {year} Duckert Design
        </span>
      </div>
    </footer>
  );
}
