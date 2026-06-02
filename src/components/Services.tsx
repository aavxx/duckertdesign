"use client";

const services = [
  {
    number: "01",
    title: "Webdesign",
    description: "Skræddersyede hjemmesider fra bunden — med fokus på brugeroplevelse, konvertering og æstetik.",
    tags: ["Landing pages", "E-commerce", "Portfolios"],
  },
  {
    number: "02",
    title: "UI/UX Design",
    description: "Intuitive grænseflader og brugerflows der gør komplekse produkter enkle og behagelige at navigere.",
    tags: ["Wireframes", "Prototyping", "User testing"],
  },
  {
    number: "03",
    title: "Webudvikling",
    description: "Hurtige, tilgængelige og skalerbare webapplikationer bygget med moderne teknologier.",
    tags: ["Next.js", "React", "Headless CMS"],
  },
];

export default function Services() {
  return (
    <section
      id="ydelser"
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
          Ydelser
        </h2>
        <span style={{ fontSize: "11px", color: "#aaa", letterSpacing: "0.1em" }}>
          03 kategorier
        </span>
      </div>

      {/* Service list */}
      <div>
        {services.map((s, i) => (
          <div
            key={s.number}
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr auto",
              gap: "40px",
              alignItems: "start",
              padding: "48px 0",
              borderBottom: "1px solid #ebebeb",
              transition: "opacity 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.opacity = "0.5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.opacity = "1";
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "#bbb",
                fontWeight: 500,
                letterSpacing: "0.1em",
                paddingTop: "4px",
              }}
            >
              {s.number}
            </span>
            <div>
              <h3
                style={{
                  fontSize: "clamp(28px, 3.5vw, 48px)",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  margin: "0 0 16px",
                  color: "#080808",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  color: "#888",
                  lineHeight: 1.7,
                  maxWidth: "480px",
                  margin: 0,
                }}
              >
                {s.description}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                alignItems: "flex-end",
                paddingTop: "4px",
              }}
            >
              {s.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#bbb",
                    border: "1px solid #ebebeb",
                    padding: "5px 10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
