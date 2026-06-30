"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import ChatWidget from "@/components/ChatWidget";

const TOPICS = [
  { label: "Hvad koster en hjemmeside?", query: "Hvad koster det at få lavet en hjemmeside hos Duckert Design?", cat: "order" },
  { label: "Hvor lang tid tager det?",   query: "Hvor lang tid tager det at lave en hjemmeside?",              cat: "order" },
  { label: "Laver I webshops?",          query: "Laver Duckert Design webshops og e-handelsløsninger?",        cat: "order" },
  { label: "Kan jeg redigere selv?",     query: "Kan jeg selv opdatere og redigere indholdet på min hjemmeside?", cat: "technical" },
  { label: "SEO & synlighed?",           query: "Kan I hjælpe med SEO og Google synlighed?",                   cat: "other" },
  { label: "Support efter lancering?",   query: "Tilbyder Duckert Design vedligeholdelse og support efter lancering?", cat: "technical" },
  { label: "Hvad sker der med mine data?", query: "Hvad sker der med mine personoplysninger hos Duckert Design?", cat: "privacy" },
  { label: "Slet mine oplysninger",      query: "Jeg ønsker at få slettet mine personoplysninger hos Duckert Design.", cat: "privacy" },
  { label: "Indsigt i mine data",        query: "Jeg vil gerne have indsigt i hvilke personoplysninger I har om mig.", cat: "privacy" },
  { label: "Spørgsmål til faktura",      query: "Jeg har et spørgsmål til en faktura fra Duckert Design.",     cat: "billing" },
];

function SkeletonCard() {
  return (
    <>
      <style>{`
        @keyframes ks-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .ks-sh {
          background: linear-gradient(90deg, #f0f4ff 25%, #dde6ff 50%, #f0f4ff 75%);
          background-size: 600px 100%;
          animation: ks-shimmer 1.4s ease-in-out infinite;
          border-radius: 8px;
        }
      `}</style>
      <div style={{
        border: "1px solid rgba(22,71,251,0.1)", borderRadius: "18px",
        padding: "28px 28px 24px",
        background: "#fff", boxShadow: "0 4px 40px rgba(22,71,251,0.05)",
      }}>
        <div className="ks-sh" style={{ height: "22px", width: "90px", marginBottom: "20px" }} />
        <div className="ks-sh" style={{ height: "26px", width: "75%", marginBottom: "16px" }} />
        <div className="ks-sh" style={{ height: "15px", width: "100%", marginBottom: "10px" }} />
        <div className="ks-sh" style={{ height: "15px", width: "92%",  marginBottom: "10px" }} />
        <div className="ks-sh" style={{ height: "15px", width: "97%",  marginBottom: "10px" }} />
        <div className="ks-sh" style={{ height: "15px", width: "68%",  marginBottom: "28px" }} />
        <div style={{ borderTop: "1px solid rgba(22,71,251,0.07)", paddingTop: "20px", display: "flex", gap: "10px" }}>
          <div className="ks-sh" style={{ height: "32px", width: "80px" }} />
          <div className="ks-sh" style={{ height: "32px", width: "80px" }} />
        </div>
      </div>
    </>
  );
}

type SearchState = "idle" | "loading" | "result";

export default function KundeservicePage() {
  const [query, setQuery]             = useState("");
  const [state, setState]             = useState<SearchState>("idle");
  const [result, setResult]           = useState<{ q: string; a: string } | null>(null);
  const [expanded, setExpanded]       = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [chatOpen, setChatOpen]       = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const runSearch = async (q: string) => {
    if (!q.trim()) return;
    setState("loading");
    setResult(null);
    setExpanded(false);
    try {
      const [, data] = await Promise.all([
        new Promise<void>((r) => setTimeout(r, 900)),
        fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        }).then((r) => r.json()),
      ]);
      setResult({ q: data.title ?? q, a: data.answer ?? "Beklager, prøv igen." });
    } catch {
      setResult({ q, a: "Noget gik galt. Skriv til hej@duckert.design." });
    }
    setState("result");
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
  };

  const PREVIEW_LEN = 200;
  const preview = result
    ? result.a.length > PREVIEW_LEN
      ? result.a.slice(0, PREVIEW_LEN).trimEnd() + "…"
      : result.a
    : "";

  return (
    <>
      <style>{`
        @keyframes ks-up   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ks-grow { from { opacity:0; transform:translateY(8px);  } to { opacity:1; transform:translateY(0); } }
        .ks-card       { animation: ks-up 0.42s cubic-bezier(0.16,1,0.3,1) both; }
        .ks-contact-in { animation: ks-grow 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .ks-chip:hover   { background:rgba(22,71,251,0.1)!important; border-color:rgba(22,71,251,0.3)!important; color:#1647FB!important; }
        .ks-cta:hover    { background:rgba(22,71,251,0.05)!important; }
        .ks-mail:hover   { background:#1647FB!important; }
        .ks-mail:hover * { color:#fff!important; }
        .ks-mail:hover .ks-mail-icon { background:rgba(255,255,255,0.2)!important; }
        .ks-mail:hover svg path, .ks-mail:hover svg polyline { stroke:#fff!important; }
        .ks-search-bar:focus-within { border-color:rgba(22,71,251,0.4)!important; box-shadow:0 0 0 3px rgba(22,71,251,0.1)!important; }
        .ks-dark-input::placeholder { color: rgba(8,8,8,0.32); }
        .ks-expand:hover { background:rgba(22,71,251,0.07)!important; border-color:#1647FB!important; }
        .ks-back:hover   { color:#1647FB!important; }
      `}</style>

      <main style={{ paddingTop: "80px", minHeight: "100vh", background: "#fff" }}>

        {/* ── Hero ── */}
        <section style={{
          background: "#ffffff",
          padding: "52px 24px 68px",
          position: "relative",
          overflow: "hidden",
        }}>

          <div style={{ maxWidth: "680px", margin: "0 auto", position: "relative" }}>

            {/* Headline */}
            <h1 style={{
              fontSize: "clamp(44px, 8vw, 92px)",
              fontWeight: 900,
              letterSpacing: "-0.045em",
              lineHeight: 0.92,
              color: "#080808",
              margin: "0 0 40px",
              fontFamily: "Montserrat, sans-serif",
            }}>
              Hvad kan vi<br />
              <em style={{ fontStyle: "italic", fontWeight: 300 }}>hjælpe</em> med?
            </h1>

            {/* Search bar */}
            <form onSubmit={(e) => { e.preventDefault(); void runSearch(query); }}>
              <div className="ks-search-bar" style={{
                display: "flex", alignItems: "center",
                border: "1.5px solid rgba(8,8,8,0.1)",
                borderRadius: "14px", padding: "8px 8px 8px 20px",
                gap: "8px", background: "rgba(22,71,251,0.03)",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
                  <circle cx="11" cy="11" r="7" stroke="#080808" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  className="ks-dark-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Stil dit spørgsmål her…"
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    fontSize: "15px", fontFamily: "Montserrat, sans-serif",
                    color: "#080808", padding: "6px 0",
                  }}
                />
                {query && (
                  <button type="button" aria-label="Ryd"
                    onClick={() => { setQuery(""); setState("idle"); setResult(null); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", opacity: 0.4, display: "flex", alignItems: "center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <line x1="4" y1="4" x2="20" y2="20" stroke="#080808" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="20" y1="4" x2="4" y2="20" stroke="#080808" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
                <button type="submit" aria-label="Søg"
                  style={{
                    background: "#1647FB", color: "#fff", border: "none",
                    borderRadius: "10px", padding: "12px 24px",
                    fontSize: "13px", fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "7px",
                    flexShrink: 0, transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Søg
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
                    <path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Topic chips */}
            <div style={{ marginTop: "22px" }}>
              <p style={{
                fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "rgba(8,8,8,0.4)",
                margin: "0 0 12px", fontFamily: "Montserrat, sans-serif",
              }}>
                Ofte stillet
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {TOPICS.map((t) => (
                  <button key={t.label} className="ks-chip"
                    onClick={() => { setQuery(t.query); void runSearch(t.query); }}
                    style={{
                      background: "rgba(22,71,251,0.05)", border: "1px solid rgba(22,71,251,0.15)",
                      borderRadius: "999px", padding: "7px 15px",
                      fontSize: "12px", fontFamily: "Montserrat, sans-serif",
                      fontWeight: 500, color: "rgba(8,8,8,0.55)", cursor: "pointer",
                      transition: "background 0.18s, border-color 0.18s, color 0.18s",
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Results section ── */}
        {(state === "loading" || state === "result") && (
          <section style={{ padding: "48px 24px 80px", maxWidth: "680px", margin: "0 auto" }}>

            {state === "loading" && <SkeletonCard />}

            {state === "result" && result && (
              <div ref={resultRef} className="ks-card" style={{
                border: "1px solid rgba(22,71,251,0.14)",
                borderRadius: "18px", padding: "28px 28px 0",
                background: "#fff",
                boxShadow: "0 4px 40px rgba(22,71,251,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                overflow: "hidden",
              }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  background: "rgba(22,71,251,0.08)", color: "#1647FB",
                  fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
                  padding: "4px 12px", borderRadius: "999px", marginBottom: "16px",
                }}>
                  <svg width="11" height="11" viewBox="-12 -12 24 24" fill="#1647FB">
                    <path d="M0,-10 L2.4,-2.4 L10,0 L2.4,2.4 L0,10 L-2.4,2.4 L-10,0 L-2.4,-2.4Z" />
                  </svg>
                  AI-svar
                </span>

                <h2 style={{
                  fontSize: "18px", fontWeight: 700, color: "#080808",
                  margin: "0 0 12px", lineHeight: 1.35, letterSpacing: "-0.01em",
                  fontFamily: "Montserrat, sans-serif",
                }}>
                  {result.q}
                </h2>

                <p style={{
                  fontSize: "14px", lineHeight: 1.78, color: "rgba(8,8,8,0.65)",
                  margin: "0 0 20px", fontFamily: "Montserrat, sans-serif",
                }}>
                  {expanded ? result.a : preview}
                </p>

                {!expanded && result.a.length > PREVIEW_LEN && (
                  <button className="ks-expand"
                    onClick={() => setExpanded(true)}
                    style={{
                      background: "transparent", border: "1.5px solid rgba(22,71,251,0.22)",
                      borderRadius: "999px", padding: "8px 18px",
                      fontSize: "12px", fontFamily: "Montserrat, sans-serif",
                      fontWeight: 600, color: "#1647FB", cursor: "pointer",
                      transition: "background 0.18s, border-color 0.18s",
                      marginBottom: "24px",
                      display: "inline-flex", alignItems: "center", gap: "6px",
                    }}>
                    Læs hele svaret
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12l7 7 7-7" stroke="#1647FB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}

                {expanded && (
                  <div className="ks-contact-in" style={{ borderTop: "1px solid rgba(22,71,251,0.08)", padding: "20px 0 24px" }}>
                    <button
                      onClick={() => setContactOpen(true)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        background: "rgba(22,71,251,0.06)", border: "1.5px solid rgba(22,71,251,0.15)",
                        borderRadius: "12px", padding: "12px 20px",
                        fontSize: "13px", fontWeight: 700, color: "#1647FB",
                        fontFamily: "Montserrat, sans-serif", cursor: "pointer",
                        transition: "background 0.2s, border-color 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(22,71,251,0.1)"; e.currentTarget.style.borderColor = "#1647FB"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(22,71,251,0.06)"; e.currentTarget.style.borderColor = "rgba(22,71,251,0.15)"; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      Brug for at kontakte kundeservice?
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

      </main>

      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* ── Contact modal ── */}
      {contactOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9000, backdropFilter: "blur(3px)" }}
            onClick={() => setContactOpen(false)}
          />
          <div style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            background: "#fff", borderRadius: "24px",
            padding: "36px 32px", width: "min(440px, calc(100vw - 40px))",
            zIndex: 9001, boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
            fontFamily: "Montserrat, sans-serif",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#080808", margin: "0 0 6px", letterSpacing: "-0.03em" }}>
                  Kontakt os
                </h2>
                <p style={{ fontSize: "13px", color: "rgba(8,8,8,0.45)", margin: 0 }}>
                  Vælg hvordan du vil have fat i os
                </p>
              </div>
              <button onClick={() => setContactOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(8,8,8,0.4)", padding: "4px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link href="/mail" className="ks-mail"
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  background: "#fff", border: "1.5px solid rgba(22,71,251,0.18)",
                  borderRadius: "16px", padding: "16px 20px",
                  textDecoration: "none", transition: "background 0.2s",
                }}>
                <div className="ks-mail-icon" style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: "rgba(22,71,251,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  transition: "background 0.2s",
                }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#1647FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="22,6 12,13 2,6" stroke="#1647FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#080808", marginBottom: "3px" }}>Kontaktformular</div>
                  <div style={{ fontSize: "12px", color: "rgba(8,8,8,0.45)" }}>Svar inden for 24 timer</div>
                </div>
              </Link>
              <button
                onClick={() => { setContactOpen(false); setChatOpen(true); }}
                className="ks-cta"
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  background: "#fff", border: "1.5px solid rgba(22,71,251,0.18)",
                  borderRadius: "16px", padding: "16px 20px",
                  cursor: "pointer", textAlign: "left",
                  transition: "background 0.2s", width: "100%",
                }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: "rgba(22,71,251,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="#1647FB" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#080808", marginBottom: "3px" }}>Chat med os</div>
                  <div style={{ fontSize: "12px", color: "rgba(8,8,8,0.45)" }}>Øjeblikkelig AI-assistance</div>
                </div>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
