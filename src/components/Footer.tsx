"use client";

import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "#080808",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "32px 40px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        <Logo style={{ height: "24px", width: "auto", filter: "brightness(0) invert(1)", opacity: 0.5 }} />
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.08em",
            margin: 0,
          }}
        >
          © {year} Duckert Design
        </p>
        <a
          href="mailto:hej@duckertdesign.dk"
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.3)",
            textDecoration: "none",
            letterSpacing: "0.08em",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >
          hej@duckertdesign.dk
        </a>
      </div>
    </footer>
  );
}
