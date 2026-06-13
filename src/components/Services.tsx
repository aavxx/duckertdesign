"use client";

const services = [
  {
    number: "01",
    title: "Webdesign",
    description:
      "Skræddersyede hjemmesider fra bunden — med fokus på brugeroplevelse, konvertering og æstetik.",
    tags: ["Landing pages", "E-commerce", "Portfolios"],
  },
  {
    number: "02",
    title: "UI/UX Design",
    description:
      "Intuitive grænseflader og brugerflows der gør komplekse produkter enkle og behagelige at navigere.",
    tags: ["Wireframes", "Prototyping", "User testing"],
  },
  {
    number: "03",
    title: "Webudvikling",
    description:
      "Hurtige, tilgængelige og skalerbare webapplikationer bygget med moderne teknologier.",
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
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: "0",
          paddingBottom: "24px",
          borderBottom: "1px solid #ebebeb",
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
          Ydelser
        </span>
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.14em",
            color: "#bbb",
            fontWeight: 600,
          }}
        >
          03
        </span>
      </div>

      {/* Service rows */}
      {services.map((s) => (
        <ServiceRow key={s.number} service={s} />
      ))}
    </section>
  );
}

function ServiceRow({
  service,
}: {
  service: (typeof services)[0];
}) {
  const handleEnter = (el: HTMLDivElement) => {
    el.style.background = "#1647FB";
    el.querySelectorAll<HTMLElement>("[data-num]").forEach((n) => (n.style.color = "rgba(255,255,255,0.3)"));
    el.querySelectorAll<HTMLElement>("[data-title]").forEach((n) => (n.style.color = "#ffffff"));
    el.querySelectorAll<HTMLElement>("[data-desc]").forEach((n) => (n.style.color = "rgba(255,255,255,0.65)"));
    el.querySelectorAll<HTMLElement>("[data-tag]").forEach((n) => {
      n.style.borderColor = "rgba(255,255,255,0.2)";
      n.style.color = "rgba(255,255,255,0.5)";
    });
    el.querySelectorAll<HTMLElement>("[data-arrow]").forEach((n) => {
      n.style.color = "#ffffff";
      n.style.opacity = "1";
      n.style.transform = "translate(4px, -4px)";
    });
  };

  const handleLeave = (el: HTMLDivElement) => {
    el.style.background = "transparent";
    el.querySelectorAll<HTMLElement>("[data-num]").forEach((n) => (n.style.color = "#ddd"));
    el.querySelectorAll<HTMLElement>("[data-title]").forEach((n) => (n.style.color = "#080808"));
    el.querySelectorAll<HTMLElement>("[data-desc]").forEach((n) => (n.style.color = "#999"));
    el.querySelectorAll<HTMLElement>("[data-tag]").forEach((n) => {
      n.style.borderColor = "#ebebeb";
      n.style.color = "#bbb";
    });
    el.querySelectorAll<HTMLElement>("[data-arrow]").forEach((n) => {
      n.style.color = "#ccc";
      n.style.opacity = "0.6";
      n.style.transform = "translate(0, 0)";
    });
  };

  return (
    <div
      onMouseEnter={(e) => handleEnter(e.currentTarget as HTMLDivElement)}
      onMouseLeave={(e) => handleLeave(e.currentTarget as HTMLDivElement)}
      style={{
        display: "grid",
        gridTemplateColumns: "72px 1fr auto",
        gap: "40px",
        alignItems: "start",
        padding: "48px 0",
        borderBottom: "1px solid #ebebeb",
        cursor: "default",
        transition: "background 0.25s",
        margin: "0 -40px",
        paddingLeft: "40px",
        paddingRight: "40px",
      }}
    >
      {/* Number */}
      <span
        data-num
        style={{
          fontSize: "11px",
          color: "#ddd",
          fontWeight: 600,
          letterSpacing: "0.1em",
          paddingTop: "6px",
          transition: "color 0.25s",
        }}
      >
        {service.number}
      </span>

      {/* Content */}
      <div>
        <h3
          data-title
          style={{
            fontSize: "clamp(30px, 3.8vw, 52px)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            margin: "0 0 20px",
            color: "#080808",
            transition: "color 0.25s",
          }}
        >
          {service.title}
        </h3>
        <p
          data-desc
          style={{
            fontSize: "15px",
            color: "#999",
            lineHeight: 1.75,
            maxWidth: "520px",
            margin: "0 0 20px",
            transition: "color 0.25s",
          }}
        >
          {service.description}
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {service.tags.map((tag) => (
            <span
              key={tag}
              data-tag
              style={{
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#bbb",
                border: "1px solid #ebebeb",
                padding: "5px 12px",
                whiteSpace: "nowrap",
                transition: "color 0.25s, border-color 0.25s",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div
        data-arrow
        style={{
          fontSize: "28px",
          color: "#ccc",
          opacity: 0.6,
          paddingTop: "6px",
          transition: "color 0.25s, opacity 0.25s, transform 0.25s",
          userSelect: "none",
          lineHeight: 1,
        }}
      >
        ↗
      </div>
    </div>
  );
}
