"use client";

import { useRef, useState } from "react";
import ChatWidget from "@/components/ChatWidget";

const TOPICS = [
  { label: "Hvad koster en hjemmeside?", query: "Hvad koster det at få lavet en hjemmeside hos Duckert Design?" },
  { label: "Hvor lang tid tager det?",   query: "Hvor lang tid tager det at lave en hjemmeside?" },
  { label: "Laver I webshops?",          query: "Laver Duckert Design webshops og e-handelsløsninger?" },
  { label: "Kan jeg redigere selv?",     query: "Kan jeg selv opdatere og redigere indholdet på min hjemmeside?" },
  { label: "SEO & synlighed?",           query: "Kan I hjælpe med SEO og Google synlighed?" },
  { label: "Support efter lancering?",   query: "Tilbyder Duckert Design vedligeholdelse og support efter lancering?" },
];

function SearchSpinner() {
  return (
    <>
      <style>{`
        @keyframes ks-spin { to { transform: rotate(360deg); } }
        @keyframes ks-dash {
          0%   { stroke-dasharray: 1 150; stroke-dashoffset: 0; }
          50%  { stroke-dasharray: 90 150; stroke-dashoffset: -35; }
          100% { stroke-dasharray: 90 150; stroke-dashoffset: -124; }
        }
        .ks-spin-ring { animation: ks-spin 2s linear infinite; transform-origin: center; }
        .ks-spin-path { animation: ks-dash 1.5s ease-in-out infinite; }
      `}</style>
      <svg className="ks-spin-ring" width="36" height="36" viewBox="0 0 50 50" fill="none" aria-label="Søger…">
        <circle cx="25" cy="25" r="20" stroke="rgba(22,71,251,0.12)" strokeWidth="4" />
        <circle className="ks-spin-path" cx="25" cy="25" r="20" stroke="#1647FB" strokeWidth="4"
          strokeLinecap="round" strokeDasharray="1 150" strokeDashoffset="0" />
      </svg>
    </>
  );
}

type SearchState = "idle" | "loading" | "result";

export default function KundeservicePage() {
  const [query, setQuery]         = useState("");
  const [state, setState]         = useState<SearchState>("idle");
  const [result, setResult]       = useState<{ q: string; a: string } | null>(null);
  const [expanded, setExpanded]   = useState(false);
  const [feedback, setFeedback]   = useState<"up" | "down" | null>(null);
  const [chatOpen, setChatOpen]   = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const runSearch = async (q: string) => {
    if (!q.trim()) return;
    setState("loading");
    setResult(null);
    setExpanded(false);
    setFeedback(null);
    try {
      const [, data] = await Promise.all([
        new Promise<void>((r) => setTimeout(r, 1100)),
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

  const PREVIEW_LEN = 180;
  const preview = result
    ? result.a.length > PREVIEW_LEN
      ? result.a.slice(0, PREVIEW_LEN).trimEnd() + "…"
      : result.a
    : "";

  return (
    <>
      <style>{`
        @keyframes ks-up   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ks-fade { from { opacity:0; } to { opacity:1; } }
        .ks-card  { animation: ks-up 0.42s cubic-bezier(0.16,1,0.3,1) both; }
        .ks-chip:hover  { background:rgba(22,71,251,0.07)!important; border-color:rgba(22,71,251,0.45)!important; }
        .ks-cta:hover   { background:rgba(22,71,251,0.05)!important; }
        .ks-email:hover { background:#1647FB!important; color:#fff!important; }
        .ks-email:hover svg path, .ks-email:hover svg polyline { stroke:#fff!important; }
        .ks-search-bar:focus-within { border-color:#1647FB!important; box-shadow:0 0 0 3px rgba(22,71,251,0.12)!important; }
        .ks-fb:hover { border-color:#1647FB!important; color:#1647FB!important; background:rgba(22,71,251,0.05)!important; }
      `}</style>

      <main style={{ paddingTop: "80px", minHeight: "100vh", background: "#fff" }}>

        {/* ── Hero ── */}
        <section style={{ padding: "72px 24px 0", maxWidth: "680px", margin: "0 auto" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(22,71,251,0.08)", color: "#1647FB",
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", padding: "5px 14px", borderRadius: "999px",
            marginBottom: "28px",
          }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="#1647FB"><circle cx="4" cy="4" r="4" /></svg>
            Kundeservice
          </span>

          <h1 style={{
            fontSize: "clamp(38px, 6.5vw, 76px)", fontWeight: 800,
            letterSpacing: "-0.045em", lineHeight: 0.95,
            color: "#080808", margin: "0 0 44px",
            fontFamily: "Montserrat, sans-serif",
          }}>
            Hvad kan vi<br />hjælpe med?
          </h1>

          {/* Search bar */}
          <form onSubmit={(e) => { e.preventDefault(); void runSearch(query); }}>
            <div className="ks-search-bar" style={{
              display: "flex", alignItems: "center",
              border: "1.5px solid rgba(22,71,251,0.18)",
              borderRadius: "14px", padding: "10px 10px 10px 18px",
              gap: "8px", background: "#fff",
              boxShadow: "0 2px 20px rgba(22,71,251,0.06)",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
                <circle cx="11" cy="11" r="7" stroke="#1647FB" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="#1647FB" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Stil dit spørgsmål her…"
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  fontSize: "15px", fontFamily: "Montserrat, sans-serif",
                  color: "#080808", padding: "4px 0",
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); setState("idle"); setResult(null); }}
                  aria-label="Ryd"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: "4px", opacity: 0.35, display: "flex", alignItems: "center",
                  }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <line x1="4" y1="4" x2="20" y2="20" stroke="#080808" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="20" y1="4" x2="4" y2="20" stroke="#080808" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                aria-label="Søg"
                style={{
                  background: "#1647FB", color: "#fff", border: "none",
                  borderRadius: "10px", padding: "10px 22px",
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
          <div style={{ marginTop: "16px", marginBottom: "56px" }}>
            <p style={{
              fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "rgba(8,8,8,0.35)",
              margin: "0 0 10px", fontFamily: "Montserrat, sans-serif",
            }}>
              Ofte stillet
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {TOPICS.map((t) => (
                <button
                  key={t.label}
                  className="ks-chip"
                  onClick={() => { setQuery(t.query); void runSearch(t.query); }}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(22,71,251,0.2)",
                    borderRadius: "999px", padding: "7px 15px",
                    fontSize: "12px", fontFamily: "Montserrat, sans-serif",
                    fontWeight: 500, color: "#080808", cursor: "pointer",
                    transition: "background 0.18s, border-color 0.18s",
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Spinner */}
          {state === "loading" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "32px 0 64px", animation: "ks-fade 0.3s ease both" }}>
              <SearchSpinner />
              <p style={{ fontSize: "13px", color: "rgba(8,8,8,0.4)", fontFamily: "Montserrat, sans-serif", margin: 0 }}>
                Finder svar…
              </p>
            </div>
          )}

          {/* Result card */}
          {state === "result" && result && (
            <div ref={resultRef} className="ks-card" style={{
              border: "1px solid rgba(22,71,251,0.14)",
              borderRadius: "18px", padding: "28px 28px 24px",
              marginBottom: "64px", background: "#fff",
              boxShadow: "0 4px 40px rgba(22,71,251,0.08), 0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  background: "rgba(22,71,251,0.08)", color: "#1647FB",
                  fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
                  padding: "4px 12px", borderRadius: "999px",
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#1647FB" />
                  </svg>
                  AI-svar
                </span>
              </div>

              <h2 style={{
                fontSize: "18px", fontWeight: 700, color: "#080808",
                margin: "0 0 12px", lineHeight: 1.35, letterSpacing: "-0.01em",
                fontFamily: "Montserrat, sans-serif",
              }}>
                {result.q}
              </h2>

              <p style={{
                fontSize: "14px", lineHeight: 1.75, color: "rgba(8,8,8,0.65)",
                margin: "0 0 20px", fontFamily: "Montserrat, sans-serif",
              }}>
                {expanded ? result.a : preview}
              </p>

              {!expanded && result.a.length > PREVIEW_LEN && (
                <button
                  onClick={() => setExpanded(true)}
                  style={{
                    background: "transparent", border: "1.5px solid rgba(22,71,251,0.25)",
                    borderRadius: "999px", padding: "8px 18px",
                    fontSize: "12px", fontFamily: "Montserrat, sans-serif",
                    fontWeight: 600, color: "#1647FB", cursor: "pointer",
                    transition: "background 0.18s, border-color 0.18s",
                    marginBottom: "20px",
                    display: "inline-flex", alignItems: "center", gap: "6px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(22,71,251,0.06)"; e.currentTarget.style.borderColor = "#1647FB"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(22,71,251,0.25)"; }}
                >
                  Læs hele svaret
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12l7 7 7-7" stroke="#1647FB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}

              {/* Feedback */}
              <div style={{ borderTop: "1px solid rgba(22,71,251,0.08)", paddingTop: "18px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: "rgba(8,8,8,0.4)", fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}>
                  Var dette nyttigt?
                </span>
                {[
                  { val: "up" as const, label: "Ja", icon: "M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" },
                  { val: "down" as const, label: "Nej", icon: "M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" },
                ].map(({ val, label, icon }) => (
                  <button
                    key={val}
                    className="ks-fb"
                    onClick={() => setFeedback(val)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      background: feedback === val ? "rgba(22,71,251,0.06)" : "transparent",
                      border: `1px solid ${feedback === val ? "#1647FB" : "rgba(8,8,8,0.14)"}`,
                      borderRadius: "999px", padding: "6px 14px",
                      fontSize: "12px", fontFamily: "Montserrat, sans-serif",
                      fontWeight: 500, color: feedback === val ? "#1647FB" : "rgba(8,8,8,0.55)",
                      cursor: "pointer",
                      transition: "border-color 0.18s, color 0.18s, background 0.18s",
                    }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={icon} />
                    </svg>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Fik du ikke svar? ── */}
        <section style={{
          borderTop: "1px solid rgba(22,71,251,0.08)",
          background: "#fafbff", padding: "72px 24px 80px",
        }}>
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <span style={{
              display: "block",
              fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "rgba(22,71,251,0.5)",
              margin: "0 0 14px", fontFamily: "Montserrat, sans-serif",
            }}>
              Brug for mere hjælp?
            </span>
            <h2 style={{
              fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 800,
              letterSpacing: "-0.04em", lineHeight: 0.95,
              color: "#080808", margin: "0 0 18px",
              fontFamily: "Montserrat, sans-serif",
            }}>
              Fik du ikke svar?
            </h2>
            <p style={{
              fontSize: "15px", color: "rgba(8,8,8,0.5)", lineHeight: 1.7,
              margin: "0 0 40px", maxWidth: "440px",
              fontFamily: "Montserrat, sans-serif",
            }}>
              Vores team er klar til at hjælpe dig. Vælg den metode der passer dig bedst.
            </p>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              {/* Email button */}
              <a
                href="/kontakt"
                className="ks-email"
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  background: "#fff",
                  border: "1.5px solid rgba(22,71,251,0.18)",
                  borderRadius: "16px", padding: "18px 24px",
                  textDecoration: "none", cursor: "pointer",
                  transition: "background 0.2s, color 0.2s",
                  minWidth: "220px", flex: "1 1 220px",
                }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: "rgba(22,71,251,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  transition: "background 0.2s",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#1647FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="22,6 12,13 2,6" stroke="#1647FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#080808", fontFamily: "Montserrat, sans-serif", marginBottom: "3px" }}>
                    Send en mail
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(8,8,8,0.45)", fontFamily: "Montserrat, sans-serif" }}>
                    Vi svarer inden 24 timer
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3, flexShrink: 0 }}>
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="#080808" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              {/* Chat button */}
              <button
                onClick={() => setChatOpen(true)}
                className="ks-cta"
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  background: "#fff",
                  border: "1.5px solid rgba(22,71,251,0.18)",
                  borderRadius: "16px", padding: "18px 24px",
                  cursor: "pointer", fontFamily: "Montserrat, sans-serif",
                  transition: "background 0.2s",
                  minWidth: "220px", flex: "1 1 220px",
                  textAlign: "left",
                }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: "#1647FB",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="white" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#080808", marginBottom: "3px" }}>
                    Chat med os
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(8,8,8,0.45)" }}>
                    Øjeblikkelig AI-assistance
                  </div>
                </div>
                <div style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "#22c55e", flexShrink: 0,
                }} />
              </button>
            </div>
          </div>
        </section>

      </main>

      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
