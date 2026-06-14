"use client";

import { useEffect, useRef, useState } from "react";

const LS_KEY      = "duckert-chat-v1";
const EXPIRY_KEY  = "duckert-chat-expiry";
const SESSION_KEY = "duckert-chat-session-id";
const EXPIRY_MS   = 10 * 60 * 1000;

function isExpired(): boolean {
  if (typeof window === "undefined") return false;
  const expiry = parseInt(localStorage.getItem(EXPIRY_KEY) ?? "0", 10);
  return expiry > 0 && Date.now() > expiry;
}

function touchExpiry(): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(EXPIRY_KEY, String(Date.now() + EXPIRY_MS)); } catch {}
}

function clearChat(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

type Message = {
  id: string;
  role: "user" | "assistant" | "admin";
  content: string;
  isPrivacyCard?: boolean;
  quickReplies?: string[];
  streaming?: boolean;
};

const INITIAL_QUICK_REPLIES = [
  "Hvad koster en hjemmeside?",
  "Hvor lang tid tager det?",
  "Laver I webshops?",
  "Tal med en person",
];

const GREETING =
  "Hej! Jeg er Duckerts AI-assistent og klar til at hjælpe dig med spørgsmål om webdesign og webudvikling.";

function loadMessages(): Message[] {
  if (typeof window === "undefined") return [];
  if (isExpired()) { clearChat(); return []; }
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Message[]) : [];
  } catch { return []; }
}

function saveMessages(msgs: Message[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(msgs)); touchExpiry(); } catch {}
}

function parseContent(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  text.split("\n").forEach((line, li, arr) => {
    line.split(/(\[[^\]]+\]\([^)]+\))/g).forEach((part, pi) => {
      const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        nodes.push(
          <a key={`${li}-${pi}`} href={m[2]} target="_blank" rel="noopener noreferrer"
            style={{ color: "#1647FB", textDecoration: "underline" }}>{m[1]}</a>
        );
      } else if (part) {
        nodes.push(<span key={`${li}-${pi}`}>{part}</span>);
      }
    });
    if (li < arr.length - 1) nodes.push(<br key={`br-${li}`} />);
  });
  return nodes;
}

function parseQuickReplies(text: string): { content: string; quickReplies: string[] } {
  const m = text.match(/\[HURTIG_SVAR:\s*([^\]]+)\]/);
  if (!m) return { content: text, quickReplies: [] };
  return {
    content: text.replace(/\[HURTIG_SVAR:[^\]]+\]/, "").trim(),
    quickReplies: m[1].split("|").map((s) => s.trim()).filter(Boolean),
  };
}

/* ── Blinking cursor shown while streaming ── */
function StreamCursor() {
  return (
    <>
      <style>{`
        @keyframes cw-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .cw-cursor { display:inline-block; width:2px; height:14px; background:#888; borderRadius:1px; marginLeft:2px; verticalAlign:middle; animation:cw-blink 0.9s ease infinite; }
      `}</style>
      <span className="cw-cursor" aria-hidden="true" />
    </>
  );
}

/* ── Privacy notice card ── */
function PrivacyCard() {
  return (
    <div style={{ animation: "cwIn 0.3s ease both" }}>
      <div style={{
        background: "rgba(22,71,251,0.04)", border: "1px solid rgba(22,71,251,0.12)",
        borderRadius: "14px", padding: "20px",
      }}>
        <p style={{
          fontSize: "10px", fontWeight: 800, color: "#1647FB",
          letterSpacing: "0.12em", textTransform: "uppercase",
          fontFamily: "Montserrat, sans-serif", margin: "0 0 12px",
        }}>
          Før du begynder
        </p>
        <p style={{ fontSize: "13px", color: "#333", lineHeight: 1.65, margin: "0 0 10px", fontFamily: "Montserrat, sans-serif" }}>
          Vi prioriterer sikkerheden af dit privatliv. Læs vores{" "}
          <a href="/privatlivspolitik" style={{ color: "#1647FB", textDecoration: "underline" }}>privatlivspolitik</a>.
        </p>
        <p style={{ fontSize: "13px", color: "rgba(8,8,8,0.5)", lineHeight: 1.65, margin: 0, fontFamily: "Montserrat, sans-serif" }}>
          Prøv f.eks. at spørge: <em>"Hvad koster en hjemmeside?"</em>
        </p>
      </div>
    </div>
  );
}

/* ── D avatar ── */
function DAvatarSmall() {
  return (
    <div style={{
      width: "28px", height: "28px", borderRadius: "50%",
      background: "#1647FB", display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
    }}>
      <span style={{ fontSize: "11px", fontWeight: 800, color: "#fff", fontFamily: "Montserrat, sans-serif" }}>D</span>
    </div>
  );
}

/* ── Main component ── */
export default function ChatWidget({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const [isOpen, setIsOpen]         = useState(false);
  const [messages, setMessages]     = useState<Message[]>(() => loadMessages());
  const [showQR, setShowQR]         = useState<boolean>(() => {
    const saved = loadMessages();
    if (!saved.length) return false;
    const last = saved[saved.length - 1];
    return last.role === "assistant" && !!(last.quickReplies?.length);
  });
  const [isLoading, setIsLoading]   = useState(false);
  const [input, setInput]           = useState("");
  const [waitingHuman, setWaitingHuman] = useState(false);
  const [newMsgCount, setNewMsgCount]   = useState(0);

  const hasInit    = useRef(false);
  const endRef     = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<string | null>(null);
  const sseRef     = useRef<EventSource | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionRef.current = localStorage.getItem(SESSION_KEY);
    }
  }, []);

  useEffect(() => { if (messages.length > 0) saveMessages(messages); }, [messages]);

  useEffect(() => { if (open) setIsOpen(true); }, [open]);

  useEffect(() => {
    if (isOpen) {
      setNewMsgCount(0);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen || hasInit.current) return;
    hasInit.current = true;
    touchExpiry();

    if (messages.length > 0) {
      if (sessionRef.current) subscribeAdminReplies(sessionRef.current);
      return;
    }

    setTimeout(() => {
      touchExpiry();
      setMessages([{ id: "privacy", role: "assistant", content: "", isPrivacyCard: true }]);
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: "greeting", role: "assistant", content: GREETING,
          quickReplies: INITIAL_QUICK_REPLIES,
        }]);
        setShowQR(true);
      }, 700);
    }, 400);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { sseRef.current?.close(); };
  }, []);

  function subscribeAdminReplies(sid: string) {
    sseRef.current?.close();
    const es = new EventSource(`/api/chat/events?sessionId=${sid}`);
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        const adminMsg: Message = { id: msg.id ?? Date.now().toString(), role: "admin", content: msg.content };
        setMessages((prev) => [...prev, adminMsg]);
        setWaitingHuman(false);
        if (!isOpen) setNewMsgCount((n) => n + 1);
      } catch {}
    };
    sseRef.current = es;
  }

  const handleClose = () => { setIsOpen(false); onClose?.(); };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    if (trimmed === "Tal med en person") {
      setShowQR(false);
      const userMsg: Message = { id: Date.now().toString(), role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setWaitingHuman(true);

      const sid = sessionRef.current ?? undefined;
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [], userMessage: trimmed, sessionId: sid, humanHandoff: true }),
        });
        const data = await res.json();
        const newSid = data.sessionId ?? res.headers.get("X-Session-Id") ?? sid;
        if (newSid && newSid !== sessionRef.current) {
          sessionRef.current = newSid;
          try { localStorage.setItem(SESSION_KEY, newSid); } catch {}
          subscribeAdminReplies(newSid);
        } else if (newSid) {
          subscribeAdminReplies(newSid);
        }
      } catch {}

      setMessages((prev) => [...prev, {
        id: Date.now().toString(), role: "assistant",
        content: "Tak! Vi forbinder dig med en person nu. Du vil modtage svar her snarest.",
      }]);
      return;
    }

    setShowQR(false);
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Add streaming placeholder
    const streamId = `stream-${Date.now()}`;
    setMessages((prev) => [...prev, { id: streamId, role: "assistant", content: "", streaming: true }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages
            .filter((m) => !m.isPrivacyCard && m.role !== "admin")
            .map((m) => ({ role: m.role === "admin" ? "assistant" : m.role, content: m.content })),
          userMessage: trimmed,
          sessionId: sessionRef.current ?? undefined,
        }),
      });

      if (!res.ok || !res.body) throw new Error("bad");

      const newSid = res.headers.get("X-Session-Id");
      if (newSid && newSid !== sessionRef.current) {
        sessionRef.current = newSid;
        try { localStorage.setItem(SESSION_KEY, newSid); } catch {}
        subscribeAdminReplies(newSid);
      }

      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let full = "", buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() ?? "";
        for (const ln of lines) {
          if (!ln.startsWith("data: ") || ln === "data: [DONE]") continue;
          try {
            const chunk = JSON.parse(ln.slice(6)).choices?.[0]?.delta?.content ?? "";
            if (chunk) {
              full += chunk;
              const current = full;
              setMessages((prev) =>
                prev.map((m) => m.id === streamId ? { ...m, content: current } : m)
              );
            }
          } catch {}
        }
      }

      const { content, quickReplies } = parseQuickReplies(
        full || "Beklager, jeg kunne ikke svare. Skriv til hej@duckert.design."
      );
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamId
            ? { ...m, content, quickReplies: quickReplies.length ? quickReplies : undefined, streaming: false }
            : m
        )
      );
      if (quickReplies.length) setShowQR(true);
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamId
            ? { ...m, content: "Beklager, noget gik galt. Skriv til hej@duckert.design.", streaming: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const msgCount  = messages.filter((m) => !m.isPrivacyCard).length;
  const isActive  = isOpen;

  return (
    <>
      <style>{`
        @keyframes cwIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes cwPanelIn {
          from { opacity:0; transform:translateX(32px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes cwFade { from{opacity:0} to{opacity:1} }
        @keyframes cwBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        .cw-scroll::-webkit-scrollbar { width:4px; }
        .cw-scroll::-webkit-scrollbar-track { background:transparent; }
        .cw-scroll::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.1); border-radius:2px; }
        .cw-qr:hover { background:rgba(22,71,251,0.08)!important; border-color:#1647FB!important; }
        .cw-hbtn:hover { background:rgba(255,255,255,0.18)!important; }
        .cw-send:hover:not(:disabled) { opacity:0.82!important; }
        .cw-input-wrap:focus-within { background:#ebebeb!important; }
        .cw-cursor { display:inline-block; width:2px; height:13px; background:rgba(8,8,8,0.5); border-radius:1px; margin-left:2px; vertical-align:middle; animation:cwBlink 0.85s ease infinite; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleClose}
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 400,
          background: "rgba(8,8,8,0.35)",
          backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)",
          opacity: isActive ? 1 : 0,
          pointerEvents: isActive ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chat med Duckert Design"
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "min(440px, 100vw)",
          background: "#fff",
          zIndex: 401,
          display: "flex", flexDirection: "column",
          boxShadow: "-4px 0 48px rgba(0,0,0,0.18)",
          transform: isActive ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.38s cubic-bezier(0.16,1,0.3,1)",
          willChange: "transform",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          background: "#1647FB",
          padding: "0 16px",
          height: "64px",
          display: "flex", alignItems: "center", gap: "12px",
          flexShrink: 0,
        }}>
          {/* Avatar */}
          <div style={{
            width: "38px", height: "38px", borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#fff", fontFamily: "Montserrat, sans-serif" }}>D</span>
          </div>

          {/* Title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: "14px", fontWeight: 700, color: "#fff",
              fontFamily: "Montserrat, sans-serif",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {waitingHuman ? "Forbinder med teamet…" : "Duckert Design AI"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: waitingHuman ? "#facc15" : "#4ade80", flexShrink: 0,
              }} />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontFamily: "Montserrat, sans-serif" }}>
                {waitingHuman ? "Venter på svar" : "Online"}
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {msgCount > 0 && (
              <button
                className="cw-hbtn"
                onClick={() => { clearChat(); setMessages([]); setShowQR(false); setWaitingHuman(false); hasInit.current = false; setIsOpen(false); onClose?.(); }}
                aria-label="Ny samtale"
                title="Ny samtale"
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: "8px",
                  borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s",
                }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
            <button
              className="cw-hbtn"
              onClick={handleClose}
              aria-label="Luk chat"
              style={{
                background: "none", border: "none", cursor: "pointer", padding: "8px",
                borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s",
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <line x1="4" y1="4" x2="20" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="4" x2="4" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div
          className="cw-scroll"
          style={{
            flex: 1, overflowY: "auto",
            padding: "20px 16px",
            display: "flex", flexDirection: "column", gap: "16px",
            background: "#f9f9fb",
          }}
        >
          {messages.map((msg, idx) => {
            if (msg.isPrivacyCard) return <PrivacyCard key={msg.id} />;

            const isLast = idx === messages.length - 1;

            if (msg.role === "user") {
              return (
                <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end", animation: "cwIn 0.25s ease both" }}>
                  <div style={{
                    maxWidth: "82%",
                    background: "#1647FB", color: "#fff",
                    padding: "11px 16px",
                    borderRadius: "18px 18px 4px 18px",
                    fontSize: "14px", fontFamily: "Montserrat, sans-serif", lineHeight: 1.6,
                    boxShadow: "0 2px 12px rgba(22,71,251,0.25)",
                  }}>
                    {parseContent(msg.content)}
                  </div>
                </div>
              );
            }

            if (msg.role === "admin") {
              return (
                <div key={msg.id} style={{ display: "flex", alignItems: "flex-end", gap: "8px", animation: "cwIn 0.25s ease both" }}>
                  <DAvatarSmall />
                  <div style={{ maxWidth: "82%" }}>
                    <div style={{
                      fontSize: "10px", fontWeight: 700, color: "#1647FB",
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      fontFamily: "Montserrat, sans-serif", marginBottom: "5px", paddingLeft: "2px",
                    }}>
                      Duckert Design
                    </div>
                    <div style={{
                      background: "#fff", color: "#111",
                      border: "1.5px solid rgba(22,71,251,0.2)",
                      padding: "12px 16px",
                      borderRadius: "4px 18px 18px 18px",
                      fontSize: "14px", fontFamily: "Montserrat, sans-serif", lineHeight: 1.65,
                      boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                    }}>
                      {parseContent(msg.content)}
                    </div>
                  </div>
                </div>
              );
            }

            // Assistant
            return (
              <div key={msg.id} style={{ display: "flex", alignItems: "flex-end", gap: "8px", animation: "cwIn 0.25s ease both" }}>
                <DAvatarSmall />
                <div style={{ maxWidth: "82%" }}>
                  <div style={{
                    background: "#fff", color: "#111",
                    padding: "12px 16px",
                    borderRadius: "4px 18px 18px 18px",
                    fontSize: "14px", fontFamily: "Montserrat, sans-serif", lineHeight: 1.65,
                    boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                    minHeight: "44px",
                  }}>
                    {msg.content ? parseContent(msg.content) : null}
                    {msg.streaming && <span className="cw-cursor" aria-hidden="true" />}
                  </div>

                  {/* Quick replies */}
                  {isLast && showQR && !msg.streaming && msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {msg.quickReplies.map((reply) => (
                        <button
                          key={reply}
                          className="cw-qr"
                          onClick={() => sendMessage(reply)}
                          style={{
                            background: "#fff",
                            border: "1.5px solid rgba(22,71,251,0.22)",
                            borderRadius: "999px", padding: "6px 14px",
                            fontSize: "12px", fontFamily: "Montserrat, sans-serif",
                            fontWeight: 500, color: "#1647FB", cursor: "pointer",
                            transition: "background 0.15s, border-color 0.15s",
                          }}>
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={endRef} />
        </div>

        {/* ── Input ── */}
        <div style={{
          background: "#fff",
          borderTop: "1px solid rgba(0,0,0,0.07)",
          padding: "12px 14px",
          flexShrink: 0,
        }}>
          <div
            className="cw-input-wrap"
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "#f2f2f2", borderRadius: "14px",
              padding: "10px 10px 10px 16px",
              transition: "background 0.2s",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                  e.preventDefault();
                  void sendMessage(input);
                }
              }}
              disabled={isLoading}
              placeholder={
                isLoading        ? "Skriver…" :
                waitingHuman     ? "Venter på svar fra teamet…" :
                                   "Skriv en besked…"
              }
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                fontSize: "14px", fontFamily: "Montserrat, sans-serif",
                color: "#111", opacity: isLoading ? 0.5 : 1,
                minHeight: "22px",
              }}
            />

            <button
              className="cw-send"
              onClick={() => void sendMessage(input)}
              disabled={isLoading || !input.trim()}
              aria-label="Send besked"
              style={{
                background: input.trim() && !isLoading ? "#1647FB" : "rgba(8,8,8,0.1)",
                border: "none", borderRadius: "10px",
                width: "36px", height: "36px", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: input.trim() && !isLoading ? "pointer" : "default",
                transition: "background 0.2s, opacity 0.2s",
                opacity: isLoading ? 0.4 : 1,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line x1="22" y1="2" x2="11" y2="13" stroke={input.trim() && !isLoading ? "white" : "#888"} strokeWidth="2" strokeLinecap="round" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" stroke={input.trim() && !isLoading ? "white" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          </div>

          <p style={{
            textAlign: "center", fontSize: "10px", color: "rgba(8,8,8,0.3)",
            fontFamily: "Montserrat, sans-serif", margin: "8px 0 0", letterSpacing: "0.02em",
          }}>
            AI-drevet · hej@duckert.design
          </p>
        </div>
      </div>
    </>
  );
}
