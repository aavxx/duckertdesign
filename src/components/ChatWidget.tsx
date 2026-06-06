"use client";

import { useEffect, useRef, useState } from "react";

const LS_KEY = "duckert-chat-v1";
const EXPIRY_KEY = "duckert-chat-expiry";
const EXPIRY_MS = 10 * 60 * 1000;

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
  try { localStorage.removeItem(LS_KEY); localStorage.removeItem(EXPIRY_KEY); } catch {}
}

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isPrivacyCard?: boolean;
  quickReplies?: string[];
};

const INITIAL_QUICK_REPLIES = [
  "Hvad koster en hjemmeside?",
  "Hvor lang tid tager det?",
  "Laver I webshops?",
  "Hvad er processen?",
];

const GREETING =
  "Hej! Jeg er Duckert Design AI Assistent og er her for at hjælpe dig med spørgsmål om webdesign og webudvikling. 😊";

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

/* ─── Avatar ─────────────────────────────────────────────── */
function Avatar({ size = 44 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "#1647FB", display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
    }}>
      <span style={{ fontSize: size * 0.32, fontWeight: 800, color: "#fff", fontFamily: "Montserrat, sans-serif", letterSpacing: "-0.02em" }}>D</span>
    </div>
  );
}

/* ─── Privacy card ────────────────────────────────────────── */
function PrivacyCard() {
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", animation: "cwMsgIn 0.3s ease both" }}>
      <Avatar size={44} />
      <div style={{
        flex: 1, background: "#fff", borderRadius: "0 16px 16px 16px",
        padding: "20px 20px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      }}>
        <p style={{
          fontSize: "14px", fontWeight: 800, color: "#1B1F6E",
          textAlign: "center", margin: "0 0 16px", letterSpacing: "0.05em",
          fontFamily: "Montserrat, sans-serif",
        }}>
          FØR DU BEGYNDER
        </p>
        <p style={{ fontSize: "14px", color: "#222", lineHeight: 1.65, margin: "0 0 12px", fontFamily: "Montserrat, sans-serif" }}>
          Vi er forpligtet til at prioritere sikkerheden af dit privatliv og dine personlige oplysninger.
          Læs gerne mere om databehandling i vores{" "}
          <a href="/privatlivspolitik" style={{ color: "#1647FB", textDecoration: "underline" }}>privatlivspolitik</a>.
        </p>
        <p style={{ fontSize: "14px", color: "#222", lineHeight: 1.65, margin: "0 0 12px", fontFamily: "Montserrat, sans-serif" }}>
          Dette er en AI-chatsupport, der fungerer bedre med enkle, ligetil spørgsmål. For eksempel kan du sige:
        </p>
        {[
          "Hvad koster en hjemmeside?",
          "Hvor lang tid tager det at lave en hjemmeside?",
          "Hvad skal jeg have klar inden vi går i gang?",
        ].map((s) => (
          <p key={s} style={{
            fontSize: "14px", color: "#222", lineHeight: 1.65, margin: 0,
            fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontStyle: "italic",
          }}>
            • {s}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────── */
export default function ChatWidget({
  externalOpen,
  onClose,
}: {
  externalOpen?: boolean;
  onClose?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => loadMessages());
  const [showQuickReplies, setShowQuickReplies] = useState<boolean>(() => {
    const saved = loadMessages();
    if (!saved.length) return false;
    const last = saved[saved.length - 1];
    return last.role === "assistant" && !!(last.quickReplies?.length);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const hasInitialized = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (messages.length > 0) saveMessages(messages); }, [messages]);
  useEffect(() => { if (externalOpen) setIsOpen(true); }, [externalOpen]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen || hasInitialized.current) return;
    hasInitialized.current = true;
    touchExpiry();

    if (messages.length > 0) {
      setTimeout(() => inputRef.current?.focus(), 120);
      return;
    }

    setTimeout(() => {
      touchExpiry();
      setMessages([{ id: "privacy", role: "assistant", content: "", isPrivacyCard: true }]);
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: "greeting", role: "assistant",
          content: GREETING,
          quickReplies: INITIAL_QUICK_REPLIES,
        }]);
        setShowQuickReplies(true);
        setTimeout(() => inputRef.current?.focus(), 60);
      }, 900);
    }, 500);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => { setIsOpen(false); onClose?.(); };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setShowQuickReplies(false);
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.filter((m) => !m.isPrivacyCard).map((m) => ({ role: m.role, content: m.content })),
          userMessage: trimmed,
        }),
      });
      if (!res.ok || !res.body) throw new Error("bad");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = "", buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() ?? "";
        for (const ln of lines) {
          if (!ln.startsWith("data: ") || ln === "data: [DONE]") continue;
          try { full += JSON.parse(ln.slice(6)).choices?.[0]?.delta?.content ?? ""; } catch {}
        }
      }

      const { content, quickReplies } = parseQuickReplies(
        full || "Beklager, jeg kunne ikke svare. Skriv til hej@duckert.design."
      );
      const aMsg: Message = {
        id: Date.now().toString(), role: "assistant", content,
        quickReplies: quickReplies.length ? quickReplies : undefined,
      };
      setMessages((prev) => [...prev, aMsg]);
      if (quickReplies.length) setShowQuickReplies(true);
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(), role: "assistant",
        content: "Beklager, noget gik galt. Skriv til hej@duckert.design.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes cwSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cwDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%  { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes cwMsgIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cw-scroll::-webkit-scrollbar { width: 4px; }
        .cw-scroll::-webkit-scrollbar-track { background: transparent; }
        .cw-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 2px; }
        .cw-qr:hover { background: rgba(22,71,251,0.07) !important; border-color: #1647FB !important; }
        .cw-hdr-btn { background: none; border: none; cursor: pointer; color: #fff; display: flex; align-items: center; justify-content: center; padding: 6px; border-radius: 6px; transition: background 0.15s; }
        .cw-hdr-btn:hover { background: rgba(255,255,255,0.15); }
        .cw-send-btn:hover:not(:disabled) { opacity: 0.8 !important; }
      `}</style>

      {isOpen && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px",
          width: "min(390px, calc(100vw - 24px))",
          maxHeight: "min(640px, calc(100vh - 40px))",
          display: "flex", flexDirection: "column",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 12px 56px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.1)",
          zIndex: 300, overflow: "hidden",
          animation: "cwSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}>

          {/* ── Header ── */}
          <div style={{
            background: "#1647FB", height: "56px",
            display: "flex", alignItems: "center",
            padding: "0 8px 0 12px", gap: "0", flexShrink: 0,
          }}>
            {/* Three dots */}
            <button className="cw-hdr-btn" aria-label="Menu" style={{ marginRight: "4px" }}>
              <svg width="4" height="18" viewBox="0 0 4 18" fill="white">
                <circle cx="2" cy="2" r="2" /><circle cx="2" cy="9" r="2" /><circle cx="2" cy="16" r="2" />
              </svg>
            </button>

            {/* Logo + title */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "rgba(255,255,255,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#fff", fontFamily: "Montserrat, sans-serif" }}>D</span>
              </div>
              <span style={{
                fontSize: "15px", fontWeight: 700, color: "#fff",
                fontFamily: "Montserrat, sans-serif",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                Duckert Design AI Assistent
              </span>
            </div>

            {/* Right icons: expand, minimize, close */}
            <div style={{ display: "flex", alignItems: "center", gap: "2px", marginLeft: "4px" }}>
              {/* Expand */}
              <button className="cw-hdr-btn" aria-label="Udvid">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </button>
              {/* Minimize */}
              <button className="cw-hdr-btn" aria-label="Minimer" onClick={handleClose}>
                <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
                  <line x1="0" y1="2" x2="16" y2="2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
              {/* Close */}
              <button className="cw-hdr-btn" aria-label="Luk" onClick={handleClose}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <line x1="4" y1="4" x2="20" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="20" y1="4" x2="4" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div className="cw-scroll" style={{
            flex: 1, overflowY: "auto", padding: "16px",
            display: "flex", flexDirection: "column", gap: "12px",
            background: "#F4F4F4",
          }}>
            {messages.map((msg, idx) => {
              if (msg.isPrivacyCard) return <PrivacyCard key={msg.id} />;

              const isLast = idx === messages.length - 1;

              if (msg.role === "user") {
                return (
                  <div key={msg.id} style={{ alignSelf: "flex-end", maxWidth: "80%", animation: "cwMsgIn 0.25s ease both" }}>
                    <div style={{
                      background: "#1647FB", color: "#fff",
                      padding: "11px 16px", borderRadius: "18px 18px 4px 18px",
                      fontSize: "14px", fontFamily: "Montserrat, sans-serif", lineHeight: 1.55,
                    }}>
                      {parseContent(msg.content)}
                    </div>
                  </div>
                );
              }

              // Assistant message
              return (
                <div key={msg.id} style={{ alignSelf: "flex-start", maxWidth: "88%", animation: "cwMsgIn 0.25s ease both" }}>
                  <div style={{
                    background: "#EBEBEB", color: "#111",
                    padding: "12px 16px", borderRadius: "18px 18px 18px 4px",
                    fontSize: "14px", fontFamily: "Montserrat, sans-serif", lineHeight: 1.6,
                  }}>
                    {parseContent(msg.content)}
                  </div>

                  {/* Quick reply chips */}
                  {isLast && showQuickReplies && msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {msg.quickReplies.map((reply) => (
                        <button key={reply} className="cw-qr" onClick={() => sendMessage(reply)}
                          style={{
                            background: "#fff", border: "1.5px solid rgba(22,71,251,0.28)",
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
              );
            })}

            {/* Typing dots */}
            {isLoading && (
              <div style={{ alignSelf: "flex-start", animation: "cwMsgIn 0.25s ease both" }}>
                <div style={{
                  background: "#EBEBEB", padding: "14px 18px",
                  borderRadius: "18px 18px 18px 4px",
                  display: "flex", gap: "5px", alignItems: "center",
                }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{
                      width: "7px", height: "7px", borderRadius: "50%",
                      background: "#888", display: "block",
                      animation: "cwDotBounce 1.2s ease-in-out infinite",
                      animationDelay: `${i * 0.18}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input ── */}
          <div style={{
            background: "#fff",
            borderTop: "1px solid rgba(0,0,0,0.07)",
            padding: "10px 12px",
            flexShrink: 0,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "#F0F0F0", borderRadius: "999px",
              padding: "10px 14px 10px 18px",
            }}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(inputValue)}
                disabled={isLoading}
                placeholder={isLoading ? "Venter på svar…" : "Skriv en besked…"}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  fontSize: "14px", fontFamily: "Montserrat, sans-serif",
                  color: "#111", opacity: isLoading ? 0.5 : 1,
                }}
              />

              {/* Paperclip when empty, send arrow when typing */}
              {inputValue.trim() ? (
                <button
                  className="cw-send-btn"
                  onClick={() => sendMessage(inputValue)}
                  disabled={isLoading}
                  aria-label="Send"
                  style={{
                    background: "#1647FB", border: "none", borderRadius: "50%",
                    width: "32px", height: "32px", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "opacity 0.15s",
                    opacity: isLoading ? 0.4 : 1,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <line x1="22" y1="2" x2="11" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </button>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
              )}
            </div>
          </div>

        </div>
      )}
    </>
  );
}
