"use client";

const stats = [
  { value: "50+", label: "Projekter leveret" },
  { value: "5+", label: "Års erfaring" },
  { value: "100%", label: "Tilfredse klienter" },
];

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
          alignItems: "end",
        }}
      >
        {/* Left: big statement */}
        <div>
          <p
            style={{
              fontSize: "clamp(28px, 3.5vw, 52px)",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              color: "#080808",
              margin: "0 0 40px",
            }}
          >
            Vi tror på at godt design løser problemer — ikke bare ser godt ud.
          </p>
          <p
            style={{
              fontSize: "15px",
              color: "#888",
              lineHeight: 1.8,
              maxWidth: "440px",
              margin: 0,
            }}
          >
            Duckert Design er et boutique-bureau der specialiserer sig i digitale oplevelser med sjæl og formål. Vi arbejder tæt med vores klienter — fra startups til etablerede virksomheder.
          </p>
        </div>

        {/* Right: stats */}
        <div>
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                padding: "32px 0",
                borderTop: "1px solid #ebebeb",
                borderBottom: i === stats.length - 1 ? "1px solid #ebebeb" : "none",
              }}
            >
              <span
                style={{
                  fontSize: "clamp(40px, 5vw, 72px)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: "#080808",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#aaa",
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
