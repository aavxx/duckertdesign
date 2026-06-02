"use client";

export default function About() {
  return (
    <section
      id="om"
      style={{
        padding: "120px 40px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: "64px",
          borderBottom: "1px solid #ebebeb",
          paddingBottom: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#aaa",
            margin: 0,
          }}
        >
          Om os
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "80px",
          alignItems: "start",
        }}
      >
        {/* Left: big statement */}
        <p
          style={{
            fontSize: "clamp(28px, 3.5vw, 52px)",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            color: "#080808",
            margin: 0,
          }}
        >
          Vi tror på at godt design løser problemer — ikke bare ser godt ud.
        </p>

        {/* Right: description */}
        <p
          style={{
            fontSize: "15px",
            color: "#888",
            lineHeight: 1.9,
            margin: 0,
          }}
        >
          Vi designer og udvikler professionelle hjemmesider til virksomheder, der ønsker et stærkt, stilrent og moderne udtryk online. Vores mål er at gøre det nemt og overskueligt for dig at få en ny hjemmeside, der virker perfekt på alle skærmstørrelser. Vi leverer skræddersyet design og solidt håndværk i øjenhøjde, så du kan skille dig ud fra konkurrenterne og fange dine kunders opmærksomhed. Skal vi hjælpe dig med dit næste digitale projekt?
        </p>
      </div>
    </section>
  );
}
