"use client";

import { useRef, useState, useMemo } from "react";
import Contact from "@/components/Contact";
import ChatWidget from "@/components/ChatWidget";

const FAQS = [
  {
    q: "Hvad koster det at få lavet en hjemmeside?",
    a: "Priserne afhænger af projektets omfang og kompleksitet. En simpel landing page starter typisk fra 5.000 kr., mens større projekter med skræddersyet funktionalitet kan koste mere. Vi giver altid et gratis tilbud tilpasset netop dine behov — kontakt os for en uforpligtende snak.",
  },
  {
    q: "Hvor lang tid tager det at lave en hjemmeside?",
    a: "En typisk hjemmeside tager 2–6 uger fra kick-off til lancering, afhængigt af kompleksiteten og hvor hurtigt vi modtager materiale (tekst, billeder, logo) fra dig. Vi holder dig opdateret undervejs og arbejder efter en klar tidsplan.",
  },
  {
    q: "Hvad skal jeg have klar, inden vi går i gang?",
    a: "Det er en god idé at have klart: dit logo (gerne i vektorformat), billeder du ønsker brugt, tekst til siderne og en fornemmelse af hvilke farver og udtryk du ønsker. Vi hjælper dig gerne med det hele — også copywriting og billedvalg — hvis du har brug for det.",
  },
  {
    q: "Ejer jeg hjemmesiden, når den er færdig?",
    a: "Ja, du ejer fuldt ud hjemmesiden og alt indhold vi producerer til dig. Koden, designet og alle filer udleveres ved projektafslutning. Vi anbefaler dog en løbende vedligeholdelsesaftale for at holde alt kørende og opdateret.",
  },
  {
    q: "Kan I vedligeholde hjemmesiden for mig?",
    a: "Ja, vi tilbyder løbende vedligeholdelse, herunder opdateringer, sikkerhedsopdateringer, teknisk support og mindre ændringer. Vedligeholdelsesaftaler tilpasses dine behov og faktureres månedligt.",
  },
  {
    q: "Bruger I et CMS, så jeg selv kan opdatere indholdet?",
    a: "Vi bygger med Headless CMS-løsninger (f.eks. Sanity eller Contentful), der giver dig en brugervenlig editor til at opdatere tekster, billeder og sider — helt uden teknisk viden. Vi sørger for oplæring, så du er selvkørende fra dag ét.",
  },
  {
    q: "Laver I også e-handel og webshops?",
    a: "Ja, vi designer og udvikler e-handelsløsninger skræddersyet til dit brand. Vi arbejder typisk med Next.js kombineret med Shopify Headless eller Stripe til betalingshåndtering, afhængigt af projektets krav.",
  },
  {
    q: "Hvor mange revisioner er inkluderet?",
    a: "I vores standardforløb er der inkluderet to revisionsrunder på designet, inden vi går i udvikling. Er der behov for yderligere ændringer, aftaler vi dette løbende. Vi ønsker, at du er 100% tilfreds med resultatet.",
  },
  {
    q: "Er jeres hjemmesider mobilvenlige og hurtige?",
    a: "Ja, alle vores hjemmesider er fuldt responsive og optimeret til alle skærmstørrelser. Vi fokuserer desuden på Core Web Vitals og performance fra start, så din side loader hurtigt og rangerer godt i søgemaskiner.",
  },
  {
    q: "Kan I hjælpe med SEO og Google synlighed?",
    a: "Vi bygger alle hjemmesider med solid teknisk SEO som fundament: korrekte metatags, struktureret data, hurtige loadtider og semantisk HTML. Vi tilbyder også SEO-pakker med søgeordsanalyse, indholdsoptimering og løbende opfølgning.",
  },
];

function AccordionItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: { q: string; a: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ borderBottom: "1px solid rgba(22,71,251,0.12)" }}>
      <button
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: "none",
          border: "none",
          padding: "24px 0",
          cursor: "pointer",
          fontFamily: "Montserrat, sans-serif",
          textAlign: "left",
          gap: "16px",
        }}
      >
        <span
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#080808",
            lineHeight: 1.4,
          }}
        >
          {faq.q}
        </span>
        <span
          style={{
            flexShrink: 0,
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isOpen ? "#1647FB" : "transparent",
            border: "1px solid rgba(22,71,251,0.3)",
            borderRadius: "50%",
            transition: "background 0.2s",
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <path
              d="M1 3l4 4 4-4"
              stroke={isOpen ? "#ffffff" : "#1647FB"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <div
        style={{
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight ?? 400}px` : "0",
          overflow: "hidden",
          opacity: isOpen ? 1 : 0,
          transition:
            "max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease",
        }}
      >
        <div ref={contentRef} style={{ paddingBottom: "24px" }}>
          <p
            style={{
              fontSize: "15px",
              color: "#080808",
              lineHeight: 1.8,
              margin: 0,
              opacity: 0.7,
            }}
          >
            {faq.a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function KundeservicePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return FAQS.map((f, i) => ({ ...f, originalIndex: i }));
    const q = searchQuery.toLowerCase();
    return FAQS
      .map((f, i) => ({ ...f, originalIndex: i }))
      .filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <>
      <main style={{ paddingTop: "96px", minHeight: "100vh", background: "#ffffff" }}>
        {/* Hero / Search */}
        <section style={{ padding: "80px 40px 0", maxWidth: "760px", margin: "0 auto" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(22,71,251,0.5)",
              margin: "0 0 16px",
            }}
          >
            Kundeservice
          </p>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              color: "#080808",
              margin: "0 0 40px",
            }}
          >
            Hvordan kan vi hjælpe dig?
          </h1>

          {/* Search */}
          <div
            style={{
              position: "relative",
              borderBottom: "1.5px solid #1647FB",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              paddingBottom: "12px",
              marginBottom: "80px",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              style={{ flexShrink: 0, opacity: 0.4 }}
            >
              <circle cx="11" cy="11" r="7" stroke="#1647FB" strokeWidth="1.5" />
              <path d="M21 21l-4-4" stroke="#1647FB" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenIndex(null);
              }}
              placeholder="Søg i ofte stillede spørgsmål..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "16px",
                fontFamily: "Montserrat, sans-serif",
                color: "#080808",
                padding: "0",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px",
                  opacity: 0.4,
                  display: "flex",
                  alignItems: "center",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}
                aria-label="Ryd søgning"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <line x1="4" y1="4" x2="20" y2="20" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
                  <line x1="20" y1="4" x2="4" y2="20" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: "760px", margin: "0 auto", padding: "0 40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
              paddingBottom: "16px",
              borderBottom: "1px solid rgba(22,71,251,0.12)",
            }}
          >
            <h2
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(22,71,251,0.5)",
                margin: 0,
              }}
            >
              Ofte stillede spørgsmål
            </h2>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "rgba(22,71,251,0.4)",
                letterSpacing: "0.05em",
              }}
            >
              {filtered.length} spørgsmål
            </span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center" }}>
              <p style={{ fontSize: "15px", color: "rgba(8,8,8,0.4)", margin: 0 }}>
                Ingen resultater for &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          ) : (
            filtered.map((faq, idx) => (
              <AccordionItem
                key={faq.originalIndex}
                faq={faq}
                isOpen={openIndex === idx}
                onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
              />
            ))
          )}
        </section>

        {/* Mangler du svar? */}
        <section
          style={{
            background: "#1647FB",
            marginTop: "80px",
            padding: "80px 40px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
              margin: "0 0 16px",
            }}
          >
            Hjælp
          </p>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              color: "#ffffff",
              margin: "0 0 16px",
            }}
          >
            Mangler du svar?
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.8,
              margin: "0 0 40px",
              maxWidth: "480px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Vi er klar til at hjælpe dig. Udfyld kontaktformularen og vi vender tilbage inden for 24 timer.
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: "#ffffff",
              color: "#1647FB",
              border: "none",
              padding: "16px 40px",
              fontSize: "11px",
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Har du brug for hjælp?
          </button>
        </section>
      </main>

      {/* Contact modal */}
      {showModal && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,8,8,0.5)",
            zIndex: 100,
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            overflowY: "auto",
            padding: "40px 20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "760px",
              position: "relative",
              animation: "modalSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <style>{`
              @keyframes modalSlideUp {
                from { opacity: 0; transform: translateY(40px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <button
              onClick={() => setShowModal(false)}
              aria-label="Luk"
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                zIndex: 1,
                opacity: 0.4,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <line x1="4" y1="4" x2="20" y2="20" stroke="#080808" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="20" y1="4" x2="4" y2="20" stroke="#080808" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <Contact />
          </div>
        </div>
      )}

      <ChatWidget />
    </>
  );
}
