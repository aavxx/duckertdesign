"use client";

import Link from "next/link";

export default function About() {
  return (
    <section
      id="om"
      style={{
        background: "#ffffff",
        padding: "120px 40px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            paddingBottom: "24px",
            borderBottom: "1px solid #ebebeb",
            marginBottom: "80px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#bbb",
            }}
          >
            Om os
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "start",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 52px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "#080808",
              margin: 0,
            }}
          >
            Vi tror på at godt design løser problemer —{" "}
            <em style={{ fontStyle: "italic", fontWeight: 300, color: "#1647FB" }}>
              ikke bare ser godt ud.
            </em>
          </h2>

          <div>
            <p
              style={{
                fontSize: "15px",
                color: "#888",
                lineHeight: 1.9,
                margin: "0 0 40px",
              }}
            >
              Vi designer og udvikler professionelle hjemmesider til virksomheder, der ønsker et stærkt, stilrent og moderne udtryk online. Vores mål er at gøre det nemt og overskueligt for dig at få en ny hjemmeside, der virker perfekt på alle skærmstørrelser.
            </p>
            <Link
              href="/kontakt"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#1647FB",
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Start et projekt
              <span style={{ fontSize: "18px", fontWeight: 300 }}>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
