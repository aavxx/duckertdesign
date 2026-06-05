"use client";

import { useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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

const POPULAR = [
  "Hvad koster en hjemmeside?",
  "Hvor lang tid tager det?",
  "Laver I webshops?",
  "Er siderne mobilvenlige?",
];

const POPULAR_MAP: Record<string, number> = {
  "Hvad koster en hjemmeside?": 0,
  "Hvor lang tid tager det?": 1,
  "Laver I webshops?": 6,
  "Er siderne mobilvenlige?": 8,
};

function Spinner() {
  return (
    <>
      <style>{`
        @keyframes ks-orbit {
          from { transform: rotate(-90deg); }
          to   { transform: rotate(270deg); }
        }
        @keyframes ks-stretch {
          0%   { stroke-dasharray:  4   172; stroke-dashoffset:   0; }
          40%  { stroke-dasharray: 140   36; stroke-dashoffset: -30; }
          100% { stroke-dasharray:  4   172; stroke-dashoffset: -176; }
        }
        .ks-orbit {
          animation: ks-orbit 1.95s linear infinite;
          will-change: transform;
          transform-origin: center center;
          display: block;
        }
        .ks-arc {
          animation: ks-stretch 1.95s cubic-bezier(0.4, 0, 0.15, 1) infinite;
          will-change: stroke-dasharray, stroke-dashoffset;
        }
      `}</style>
      <svg
        className="ks-orbit"
        width="48"
        height="48"
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Indlæser"
      >
        <circle
          className="ks-arc"
          cx="36"
          cy="36"
          r="28"
          stroke="#1647FB"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="4 172"
        />
      </svg>
    </>
  );
}

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
        <span style={{ fontSize: "15px", fontWeight: 600, color: "#080808", lineHeight: 1.4 }}>
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
          transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease",
        }}
      >
        <div ref={contentRef} style={{ paddingBottom: "24px" }}>
          <p style={{ fontSize: "15px", color: "#080808", lineHeight: 1.8, margin: 0, opacity: 0.7 }}>
            {faq.a}
          </p>
        </div>
      </div>
    </div>
  );
}

type SearchState = "idle" | "loading" | "result";

export default function KundeservicePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [searchResult, setSearchResult] = useState<{ q: string; a: string } | null>(null);
  const [showFullAnswer, setShowFullAnswer] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const triggerSearch = (query: string) => {
    if (!query.trim()) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setSearchState("loading");
    setSearchResult(null);
    setShowFullAnswer(false);
    setFeedback(null);

    timerRef.current = setTimeout(() => {
      const q = query.toLowerCase();
      const match = FAQS.find(
        (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
      );
      const result = match ?? {
        q: query.charAt(0).toUpperCase() + query.slice(1),
        a: "Vi har ikke specifik information om dette emne endnu. Kontakt os direkte, så hjælper vi dig med en personlig snak om dit projekt og dine behov.",
      };
      setSearchResult(result);
      setSearchState("result");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(searchQuery);
  };

  const handleChip = (label: string) => {
    const idx = POPULAR_MAP[label];
    const faq = FAQS[idx];
    setSearchQuery(faq.q);
    triggerSearch(faq.q);
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return FAQS.map((f, i) => ({ ...f, originalIndex: i }));
    const q = searchQuery.toLowerCase();
    return FAQS.map((f, i) => ({ ...f, originalIndex: i })).filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const excerpt = searchResult
    ? searchResult.a.length > 160
      ? searchResult.a.slice(0, 160).trimEnd() + "…"
      : searchResult.a
    : "";

  return (
    <>
      <style>{`
        @keyframes ks-fadeup {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ks-modal-in {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ks-result-card { animation: ks-fadeup 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .ks-modal       { animation: ks-modal-in 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .ks-chip:hover  { background: rgba(22,71,251,0.06) !important; }
        .ks-contact-btn:hover { background: rgba(22,71,251,0.06) !important; }
        .ks-feedback-btn:hover { border-color: #1647FB !important; color: #1647FB !important; }
        .ks-soeg-btn:hover { opacity: 0.85 !important; }
        .ks-vis-btn:hover { background: #1647FB !important; color: #fff !important; }
      `}</style>

      <main style={{ paddingTop: "96px", minHeight: "100vh", background: "#ffffff" }}>
        {/* Hero */}
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

          {/* Search bar */}
          <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1.5px solid rgba(22,71,251,0.2)",
                borderRadius: "999px",
                padding: "8px 8px 8px 24px",
                gap: "8px",
                background: "#fff",
                transition: "border-color 0.2s",
              }}
              onFocus={() => {}}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
                <circle cx="11" cy="11" r="7" stroke="#1647FB" strokeWidth="1.8" />
                <path d="M21 21l-4-4" stroke="#1647FB" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Søg i ofte stillede spørgsmål..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "15px",
                  fontFamily: "Montserrat, sans-serif",
                  color: "#080808",
                  padding: "4px 0",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setSearchState("idle"); setSearchResult(null); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", opacity: 0.35, display: "flex", alignItems: "center" }}
                  aria-label="Ryd søgning"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <line x1="4" y1="4" x2="20" y2="20" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
                    <line x1="20" y1="4" x2="4" y2="20" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                className="ks-soeg-btn"
                style={{
                  background: "#1647FB",
                  color: "#fff",
                  border: "none",
                  borderRadius: "999px",
                  padding: "10px 24px",
                  fontSize: "13px",
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexShrink: 0,
                  transition: "opacity 0.2s",
                  opacity: 1,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
                  <path d="M21 21l-4-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Søg
              </button>
            </div>
          </form>

          {/* Popular questions chips */}
          <div style={{ marginBottom: "56px" }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(8,8,8,0.4)",
                margin: "0 0 12px",
              }}
            >
              Eller vælg et ofte stillet spørgsmål
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {POPULAR.map((label) => (
                <button
                  key={label}
                  className="ks-chip"
                  onClick={() => handleChip(label)}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(22,71,251,0.2)",
                    borderRadius: "999px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontFamily: "Montserrat, sans-serif",
                    color: "#080808",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Spinner */}
          {searchState === "loading" && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "40px 0 56px",
              }}
            >
              <Spinner />
            </div>
          )}

          {/* Answer card */}
          {searchState === "result" && searchResult && (
            <div
              ref={resultRef}
              className="ks-result-card"
              style={{
                border: "1px solid rgba(22,71,251,0.15)",
                borderRadius: "16px",
                padding: "28px",
                marginBottom: "56px",
                background: "#fff",
                boxShadow: "0 4px 32px rgba(22,71,251,0.08)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(22,71,251,0.08)",
                  color: "#1647FB",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  marginBottom: "16px",
                }}
              >
                AI-genereret svar
              </span>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#080808",
                  margin: "0 0 12px",
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                }}
              >
                {searchResult.q}
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "rgba(8,8,8,0.6)",
                  lineHeight: 1.7,
                  margin: "0 0 20px",
                }}
              >
                {excerpt}
              </p>
              <button
                className="ks-vis-btn"
                onClick={() => setShowFullAnswer(true)}
                style={{
                  background: "transparent",
                  border: "1.5px solid #1647FB",
                  borderRadius: "999px",
                  padding: "9px 20px",
                  fontSize: "13px",
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 600,
                  color: "#1647FB",
                  cursor: "pointer",
                  transition: "background 0.2s, color 0.2s",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Vis hele svaret
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: "760px", margin: "0 auto", padding: "0 40px 80px" }}>
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
            <span style={{ fontSize: "11px", fontWeight: 500, color: "rgba(22,71,251,0.4)", letterSpacing: "0.05em" }}>
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
      </main>

      {/* Full answer overlay */}
      {showFullAnswer && searchResult && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowFullAnswer(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,8,8,0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            overflowY: "auto",
            padding: "48px 20px",
          }}
        >
          <div
            className="ks-modal"
            style={{
              background: "#fff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "680px",
              padding: "48px",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowFullAnswer(false)}
              aria-label="Luk"
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(8,8,8,0.06)",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(8,8,8,0.12)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(8,8,8,0.06)")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line x1="4" y1="4" x2="20" y2="20" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="4" x2="4" y2="20" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <span
              style={{
                display: "inline-block",
                background: "rgba(22,71,251,0.08)",
                color: "#1647FB",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                padding: "4px 12px",
                borderRadius: "999px",
                marginBottom: "20px",
              }}
            >
              AI-genereret svar
            </span>

            <h2
              style={{
                fontSize: "clamp(22px, 3vw, 32px)",
                fontWeight: 700,
                color: "#080808",
                margin: "0 0 20px",
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
              }}
            >
              {searchResult.q}
            </h2>

            <p
              style={{
                fontSize: "15px",
                color: "rgba(8,8,8,0.7)",
                lineHeight: 1.8,
                margin: "0 0 36px",
              }}
            >
              {searchResult.a}
            </p>

            {/* Divider */}
            <div style={{ borderTop: "1px solid rgba(22,71,251,0.1)", margin: "0 0 28px" }} />

            {/* Feedback */}
            <div style={{ marginBottom: "28px" }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#080808",
                  margin: "0 0 14px",
                  letterSpacing: "0.02em",
                }}
              >
                Giv os feedback!
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  className="ks-feedback-btn"
                  onClick={() => setFeedback("up")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: feedback === "up" ? "rgba(22,71,251,0.06)" : "transparent",
                    border: `1px solid ${feedback === "up" ? "#1647FB" : "rgba(8,8,8,0.15)"}`,
                    borderRadius: "999px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 500,
                    color: feedback === "up" ? "#1647FB" : "#080808",
                    cursor: "pointer",
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
                    <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                  </svg>
                  Jeg fandt det, jeg ledte efter
                </button>
                <button
                  className="ks-feedback-btn"
                  onClick={() => setFeedback("down")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: feedback === "down" ? "rgba(22,71,251,0.06)" : "transparent",
                    border: `1px solid ${feedback === "down" ? "#1647FB" : "rgba(8,8,8,0.15)"}`,
                    borderRadius: "999px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 500,
                    color: feedback === "down" ? "#1647FB" : "#080808",
                    cursor: "pointer",
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
                    <path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" />
                  </svg>
                  Jeg fandt ikke det, jeg ledte efter
                </button>
              </div>
            </div>

            {/* Contact CTA */}
            <button
              onClick={() => setShowContactModal(true)}
              style={{
                background: "#1647FB",
                color: "#fff",
                border: "none",
                borderRadius: "999px",
                padding: "14px 28px",
                fontSize: "13px",
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                letterSpacing: "0.04em",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Brug for at kontakte kundeservice?
            </button>
          </div>
        </div>
      )}

      {/* Contact options popup */}
      {showContactModal && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowContactModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,8,8,0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="ks-modal"
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "40px 36px",
              width: "100%",
              maxWidth: "380px",
              position: "relative",
              boxShadow: "0 16px 60px rgba(8,8,8,0.18)",
            }}
          >
            <button
              onClick={() => setShowContactModal(false)}
              aria-label="Luk"
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(8,8,8,0.06)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(8,8,8,0.12)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(8,8,8,0.06)")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <line x1="4" y1="4" x2="20" y2="20" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="4" x2="4" y2="20" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(22,71,251,0.5)",
                margin: "0 0 12px",
              }}
            >
              Kontakt
            </p>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#080808",
                margin: "0 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              Hvordan vil du kontakte os?
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(8,8,8,0.5)",
                lineHeight: 1.6,
                margin: "0 0 28px",
              }}
            >
              Vælg den måde der passer dig bedst.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                className="ks-contact-btn"
                onClick={() => router.push("/kontakt")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  background: "transparent",
                  border: "1.5px solid rgba(22,71,251,0.2)",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.2s",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "rgba(22,71,251,0.08)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1647FB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#080808", fontFamily: "Montserrat, sans-serif", marginBottom: "2px" }}>
                    Kontakt formular
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(8,8,8,0.45)", fontFamily: "Montserrat, sans-serif" }}>
                    Vi svarer inden for 24 timer
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "auto", opacity: 0.3 }}>
                  <path d="M9 18l6-6-6-6" stroke="#080808" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                className="ks-contact-btn"
                onClick={() => { setShowContactModal(false); setShowFullAnswer(false); setChatOpen(true); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  background: "transparent",
                  border: "1.5px solid rgba(22,71,251,0.2)",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.2s",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "rgba(22,71,251,0.08)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="#1647FB" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#080808", fontFamily: "Montserrat, sans-serif", marginBottom: "2px" }}>
                    Chat med os
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(8,8,8,0.45)", fontFamily: "Montserrat, sans-serif" }}>
                    Øjeblikkelig AI-assistance
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "auto", opacity: 0.3 }}>
                  <path d="M9 18l6-6-6-6" stroke="#080808" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatWidget externalOpen={chatOpen} />
    </>
  );
}
