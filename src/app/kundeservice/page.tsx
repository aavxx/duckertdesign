"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";

const CHAT_LS_KEY = "duckert-chat-v1";
const CHAT_EXPIRY_KEY = "duckert-chat-expiry";
const EXPIRY_MS = 10 * 60 * 1000;

function chatIsActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const msgs = localStorage.getItem(CHAT_LS_KEY);
    const expiry = parseInt(localStorage.getItem(CHAT_EXPIRY_KEY) ?? "0", 10);
    return !!msgs && Date.now() < expiry;
  } catch {
    return false;
  }
}

function refreshChatExpiry() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHAT_EXPIRY_KEY, String(Date.now() + EXPIRY_MS));
  } catch {}
}

const TOPICS = [
  {
    title: "Priser & Tilbud",
    desc: "Hvad koster en hjemmeside?",
    query: "Hvad koster det at få lavet en hjemmeside hos Duckert Design?",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1647FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    title: "Tidsramme",
    desc: "Hvor lang tid tager et projekt?",
    query: "Hvor lang tid tager det at lave en hjemmeside?",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1647FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Webshop & E-handel",
    desc: "Bygger I webshops?",
    query: "Laver Duckert Design webshops og e-handelsløsninger?",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1647FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    title: "SEO & Google",
    desc: "Kan I hjælpe med synlighed?",
    query: "Kan I hjælpe med SEO og Google synlighed?",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1647FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: "Vedligeholdelse",
    desc: "Hvad sker der efter lancering?",
    query: "Tilbyder Duckert Design vedligeholdelse og support efter lancering?",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1647FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    title: "CMS & Indhold",
    desc: "Kan jeg selv redigere indhold?",
    query: "Kan jeg selv opdatere og redigere indholdet på min hjemmeside?",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1647FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
];

function Spinner() {
  return (
    <>
      <style>{`
        @keyframes ks-orbit {
          from { transform: rotate(-90deg); }
          to   { transform: rotate(270deg); }
        }
        @keyframes ks-stretch {
          0%   { stroke-dasharray:  4 172; stroke-dashoffset:   0; }
          40%  { stroke-dasharray: 140 36; stroke-dashoffset: -30; }
          100% { stroke-dasharray:  4 172; stroke-dashoffset: -176; }
        }
        .ks-orbit { animation: ks-orbit 1.95s linear infinite; transform-origin: center; display: block; }
        .ks-arc   { animation: ks-stretch 1.95s cubic-bezier(0.4,0,0.15,1) infinite; }
      `}</style>
      <svg className="ks-orbit" width="48" height="48" viewBox="0 0 72 72" fill="none" role="img" aria-label="Indlæser">
        <circle className="ks-arc" cx="36" cy="36" r="28" stroke="#1647FB" strokeWidth="6" strokeLinecap="round" strokeDasharray="4 172" />
      </svg>
    </>
  );
}

type SearchState = "idle" | "loading" | "result";

export default function KundeservicePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [searchResult, setSearchResult] = useState<{ q: string; a: string } | null>(null);
  const [showFullAnswer, setShowFullAnswer] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [showChatBubble, setShowChatBubble] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // On mount: check if chat session is still active, refresh expiry
  useEffect(() => {
    if (chatIsActive()) {
      refreshChatExpiry();
      setShowChatBubble(true);
    }
  }, []);

  // When chat closes, re-check bubble visibility
  useEffect(() => {
    if (!chatOpen) setShowChatBubble(chatIsActive());
  }, [chatOpen]);

  const triggerSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearchState("loading");
    setSearchResult(null);
    setShowFullAnswer(false);
    setFeedback(null);

    const minDelay = new Promise<void>((r) => setTimeout(r, 1600));
    try {
      const [, data] = await Promise.all([
        minDelay,
        fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        }).then((r) => r.json()),
      ]);
      setSearchResult({ q: data.title ?? query, a: data.answer ?? "Beklager, prøv igen." });
    } catch {
      setSearchResult({ q: query, a: "Noget gik galt. Prøv igen eller kontakt os på hej@duckert.design." });
    }
    setSearchState("result");
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void triggerSearch(searchQuery);
  };

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
        @keyframes ks-bubble-in {
          from { opacity: 0; transform: scale(0.7) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .ks-result-card { animation: ks-fadeup 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .ks-modal       { animation: ks-modal-in 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .ks-chip:hover  { background: rgba(22,71,251,0.06) !important; }
        .ks-contact-btn:hover { background: rgba(22,71,251,0.06) !important; }
        .ks-feedback-btn:hover { border-color: #1647FB !important; color: #1647FB !important; }
        .ks-soeg-btn:hover { opacity: 0.85 !important; }
        .ks-vis-btn:hover { background: #1647FB !important; color: #fff !important; }
.ks-chat-bubble:hover { transform: scale(1.08) !important; box-shadow: 0 6px 32px rgba(22,71,251,0.5) !important; }
      `}</style>

      <main style={{ paddingTop: "96px", minHeight: "100vh", background: "#ffffff" }}>

        {/* ── Hero & Search ── */}
        <section style={{ padding: "80px 40px 0", maxWidth: "760px", margin: "0 auto" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(22,71,251,0.5)", display: "block", margin: "0 0 20px" }}>
            Kundeservice
          </span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, color: "#080808", margin: "0 0 40px" }}>
            Hvordan kan vi hjælpe?
          </h1>

          {/* Search bar */}
          <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", border: "1.5px solid rgba(22,71,251,0.2)", borderRadius: "999px", padding: "8px 8px 8px 20px", gap: "8px", background: "#fff" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
                <circle cx="11" cy="11" r="7" stroke="#1647FB" strokeWidth="1.8" />
                <path d="M21 21l-4-4" stroke="#1647FB" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Søg i ofte stillede spørgsmål..."
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "15px", fontFamily: "Montserrat, sans-serif", color: "#080808", padding: "4px 0" }}
              />
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(""); setSearchState("idle"); setSearchResult(null); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", opacity: 0.35, display: "flex", alignItems: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <line x1="4" y1="4" x2="20" y2="20" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
                    <line x1="20" y1="4" x2="4" y2="20" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              )}
              <button type="submit" className="ks-soeg-btn"
                style={{ background: "#1647FB", color: "#fff", border: "none", borderRadius: "999px", padding: "10px 24px", fontSize: "13px", fontFamily: "Montserrat, sans-serif", fontWeight: 600, letterSpacing: "0.05em", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, transition: "opacity 0.2s" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
                  <path d="M21 21l-4-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Søg
              </button>
            </div>
          </form>

          {/* Popular chips */}
          <div style={{ marginBottom: "52px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(8,8,8,0.4)", margin: "0 0 10px" }}>
              Eller vælg et ofte stillet spørgsmål
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {TOPICS.slice(0, 4).map((t) => (
                <button key={t.title} className="ks-chip"
                  onClick={() => { setSearchQuery(t.query); void triggerSearch(t.query); }}
                  style={{ background: "transparent", border: "1px solid rgba(22,71,251,0.2)", borderRadius: "999px", padding: "8px 16px", fontSize: "13px", fontFamily: "Montserrat, sans-serif", color: "#080808", cursor: "pointer", transition: "background 0.2s" }}>
                  {t.desc}
                </button>
              ))}
            </div>
          </div>

          {/* Spinner */}
          {searchState === "loading" && (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0 56px" }}>
              <Spinner />
            </div>
          )}

          {/* AI Answer card */}
          {searchState === "result" && searchResult && (
            <div ref={resultRef} className="ks-result-card"
              style={{ border: "1px solid rgba(22,71,251,0.15)", borderRadius: "16px", padding: "28px", marginBottom: "56px", background: "#fff", boxShadow: "0 4px 32px rgba(22,71,251,0.08)" }}>
              <span style={{ display: "inline-block", background: "rgba(22,71,251,0.08)", color: "#1647FB", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", padding: "4px 12px", borderRadius: "999px", marginBottom: "16px" }}>
                AI-genereret svar
              </span>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#080808", margin: "0 0 12px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                {searchResult.q}
              </h2>
              <p style={{ fontSize: "14px", color: "rgba(8,8,8,0.6)", lineHeight: 1.7, margin: "0 0 20px" }}>
                {excerpt}
              </p>
              <button className="ks-vis-btn" onClick={() => setShowFullAnswer(true)}
                style={{ background: "transparent", border: "1.5px solid #1647FB", borderRadius: "999px", padding: "9px 20px", fontSize: "13px", fontFamily: "Montserrat, sans-serif", fontWeight: 600, color: "#1647FB", cursor: "pointer", transition: "background 0.2s, color 0.2s", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                Vis hele svaret
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </section>

        {/* ── Fik du ikke svar? ── */}
        <section style={{ borderTop: "1px solid rgba(22,71,251,0.1)", background: "#fafafa", padding: "64px 40px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(22,71,251,0.5)", margin: "0 0 12px" }}>
              Hjælp
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.95, color: "#080808", margin: "0 0 16px" }}>
              Fik du ikke svar?
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(8,8,8,0.5)", lineHeight: 1.7, margin: "0 0 36px", maxWidth: "460px" }}>
              Vi er klar til at hjælpe dig personligt. Vælg den kontaktmetode der passer dig bedst.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button className="ks-contact-btn"
                onClick={() => router.push("/kontakt")}
                style={{ display: "flex", alignItems: "center", gap: "12px", background: "transparent", border: "1.5px solid rgba(22,71,251,0.2)", borderRadius: "14px", padding: "16px 24px", cursor: "pointer", fontFamily: "Montserrat, sans-serif", transition: "background 0.2s" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1647FB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#080808", marginBottom: "2px" }}>Kontakt formular</div>
                  <div style={{ fontSize: "12px", color: "rgba(8,8,8,0.45)" }}>Vi svarer inden for 24 timer</div>
                </div>
              </button>
              <button className="ks-contact-btn"
                onClick={() => { setChatOpen(true); setShowChatBubble(true); }}
                style={{ display: "flex", alignItems: "center", gap: "12px", background: "transparent", border: "1.5px solid rgba(22,71,251,0.2)", borderRadius: "14px", padding: "16px 24px", cursor: "pointer", fontFamily: "Montserrat, sans-serif", transition: "background 0.2s" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="#1647FB" />
                </svg>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#080808", marginBottom: "2px" }}>Chat med os</div>
                  <div style={{ fontSize: "12px", color: "rgba(8,8,8,0.45)" }}>Øjeblikkelig AI-assistance</div>
                </div>
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* ── Full answer overlay ── */}
      {showFullAnswer && searchResult && (
        <div onClick={(e) => e.target === e.currentTarget && setShowFullAnswer(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(8,8,8,0.45)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "48px 20px" }}>
          <div className="ks-modal" style={{ background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "680px", padding: "48px", position: "relative" }}>
            <button onClick={() => setShowFullAnswer(false)} aria-label="Luk"
              style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(8,8,8,0.06)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(8,8,8,0.12)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(8,8,8,0.06)")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line x1="4" y1="4" x2="20" y2="20" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="4" x2="4" y2="20" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <span style={{ display: "inline-block", background: "rgba(22,71,251,0.08)", color: "#1647FB", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", padding: "4px 12px", borderRadius: "999px", marginBottom: "20px" }}>
              AI-genereret svar
            </span>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, color: "#080808", margin: "0 0 20px", lineHeight: 1.25, letterSpacing: "-0.02em" }}>
              {searchResult.q}
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(8,8,8,0.7)", lineHeight: 1.8, margin: "0 0 36px" }}>
              {searchResult.a}
            </p>
            <div style={{ borderTop: "1px solid rgba(22,71,251,0.1)", margin: "0 0 28px" }} />
            <div style={{ marginBottom: "28px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#080808", margin: "0 0 14px" }}>Giv os feedback!</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {[
                  { val: "up" as const, icon: <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />, label: "Jeg fandt det, jeg ledte efter" },
                  { val: "down" as const, icon: <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />, label: "Jeg fandt ikke det, jeg ledte efter" },
                ].map(({ val, icon, label }) => (
                  <button key={val} className="ks-feedback-btn" onClick={() => setFeedback(val)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", background: feedback === val ? "rgba(22,71,251,0.06)" : "transparent", border: `1px solid ${feedback === val ? "#1647FB" : "rgba(8,8,8,0.15)"}`, borderRadius: "999px", padding: "10px 20px", fontSize: "13px", fontFamily: "Montserrat, sans-serif", fontWeight: 500, color: feedback === val ? "#1647FB" : "#080808", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setShowContactModal(true)}
              style={{ background: "#1647FB", color: "#fff", border: "none", borderRadius: "999px", padding: "14px 28px", fontSize: "13px", fontFamily: "Montserrat, sans-serif", fontWeight: 600, letterSpacing: "0.04em", cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
              Brug for at kontakte kundeservice?
            </button>
          </div>
        </div>
      )}

      {/* ── Contact options popup ── */}
      {showContactModal && (
        <div onClick={(e) => e.target === e.currentTarget && setShowContactModal(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(8,8,8,0.45)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="ks-modal" style={{ background: "#fff", borderRadius: "20px", padding: "40px 36px", width: "100%", maxWidth: "380px", position: "relative", boxShadow: "0 16px 60px rgba(8,8,8,0.18)" }}>
            <button onClick={() => setShowContactModal(false)} aria-label="Luk"
              style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(8,8,8,0.06)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(8,8,8,0.12)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(8,8,8,0.06)")}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <line x1="4" y1="4" x2="20" y2="20" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="4" x2="4" y2="20" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(22,71,251,0.5)", margin: "0 0 12px" }}>Kontakt</p>
            <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#080808", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Hvordan vil du kontakte os?</h3>
            <p style={{ fontSize: "13px", color: "rgba(8,8,8,0.5)", lineHeight: 1.6, margin: "0 0 28px" }}>Vælg den måde der passer dig bedst.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Kontakt formular", sub: "Vi svarer inden for 24 timer", action: () => router.push("/kontakt"),
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1647FB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
                { label: "Chat med os", sub: "Øjeblikkelig AI-assistance", action: () => { setShowContactModal(false); setShowFullAnswer(false); setChatOpen(true); setShowChatBubble(true); },
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="#1647FB"/></svg> },
              ].map(({ label, sub, action, icon }) => (
                <button key={label} className="ks-contact-btn" onClick={action}
                  style={{ display: "flex", alignItems: "center", gap: "14px", background: "transparent", border: "1.5px solid rgba(22,71,251,0.2)", borderRadius: "14px", padding: "16px 20px", cursor: "pointer", textAlign: "left", transition: "background 0.2s", width: "100%" }}>
                  <div style={{ width: "36px", height: "36px", background: "rgba(22,71,251,0.08)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#080808", fontFamily: "Montserrat, sans-serif", marginBottom: "2px" }}>{label}</div>
                    <div style={{ fontSize: "12px", color: "rgba(8,8,8,0.45)", fontFamily: "Montserrat, sans-serif" }}>{sub}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "auto", opacity: 0.3 }}>
                    <path d="M9 18l6-6-6-6" stroke="#080808" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Floating chat bubble (visible while session active) ── */}
      {showChatBubble && !chatOpen && (
        <button
          className="ks-chat-bubble"
          onClick={() => setChatOpen(true)}
          aria-label="Åbn chat"
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            width: "56px",
            height: "56px",
            background: "#1647FB",
            border: "none",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 50,
            boxShadow: "0 4px 24px rgba(22,71,251,0.4)",
            transition: "transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s",
            animation: "ks-bubble-in 0.35s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="white" />
          </svg>
        </button>
      )}

      <ChatWidget
        externalOpen={chatOpen}
        onClose={() => {
          setChatOpen(false);
          setShowChatBubble(chatIsActive());
        }}
      />
    </>
  );
}
