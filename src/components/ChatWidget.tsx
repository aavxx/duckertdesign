"use client";

import { useEffect, useRef, useState } from "react";

const LS_KEY = "duckert-chat-v1";

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
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Message[]) : [];
  } catch {
    return [];
  }
}

function saveMessages(msgs: Message[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(msgs));
  } catch {}
}

function parseContent(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  text.split("\n").forEach((line, li, arr) => {
    line.split(/(\[[^\]]+\]\([^)]+\))/g).forEach((part, pi) => {
      const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        nodes.push(
          <a
            key={`${li}-${pi}`}
            href={m[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1647FB", textDecoration: "underline" }}
          >
            {m[1]}
          </a>
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

function PrivacyCard() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "20px 20px 18px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        animation: "chatMsgIn 0.3s ease both",
      }}
    >
      <p
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#1647FB",
          textAlign: "center",
          margin: "0 0 14px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "Montserrat, sans-serif",
        }}
      >
        Før du begynder
      </p>
      <p
        style={{
          fontSize: "13px",
          color: "#333",
          lineHeight: 1.65,
          margin: "0 0 10px",
          fontFamily: "Montserrat, sans-serif",
        }}
      >
        Vi er forpligtet til at beskytte dit privatliv og dine personlige
        oplysninger. Læs gerne mere om databehandling i vores{" "}
        <a
          href="/privatlivspolitik"
          style={{ color: "#1647FB", textDecoration: "underline" }}
        >
          privatlivspolitik
        </a>
        .
      </p>
      <p
        style={{
          fontSize: "13px",
          color: "#333",
          lineHeight: 1.65,
          margin: "0 0 10px",
          fontFamily: "Montserrat, sans-serif",
        }}
      >
        Dette er en AI-chatsupport, der fungerer bedst med enkle, ligetil
        spørgsmål. For eksempel kan du sige:
      </p>
      {[
        "Hvad koster en hjemmeside?",
        "Hvor lang tid tager det?",
        "Hvad skal jeg have klar inden vi går i gang?",
      ].map((s) => (
        <p
          key={s}
          style={{
            fontSize: "13px",
            color: "#333",
            lineHeight: 1.7,
            margin: 0,
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 600,
            fontStyle: "italic",
          }}
        >
          • {s}
        </p>
      ))}
    </div>
  );
}

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

  useEffect(() => {
    if (messages.length > 0) saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (externalOpen) setIsOpen(true);
  }, [externalOpen]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen || hasInitialized.current) return;
    hasInitialized.current = true;

    if (messages.length > 0) {
      setTimeout(() => inputRef.current?.focus(), 120);
      return;
    }

    setTimeout(() => {
      setMessages([{ id: "privacy", role: "assistant", content: "", isPrivacyCard: true }]);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "greeting",
            role: "assistant",
            content: GREETING,
            quickReplies: INITIAL_QUICK_REPLIES,
          },
        ]);
        setShowQuickReplies(true);
        setTimeout(() => inputRef.current?.focus(), 60);
      }, 900);
    }, 500);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

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
          messages: messages
            .filter((m) => !m.isPrivacyCard)
            .map((m) => ({ role: m.role, content: m.content })),
          userMessage: trimmed,
        }),
      });

      if (!res.ok || !res.body) throw new Error("bad");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = "";
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const ln of lines) {
          if (!ln.startsWith("data: ") || ln === "data: [DONE]") continue;
          try {
            full += JSON.parse(ln.slice(6)).choices?.[0]?.delta?.content ?? "";
          } catch {}
        }
      }

      const { content, quickReplies } = parseQuickReplies(
        full || "Beklager, jeg kunne ikke svare. Skriv til hej@duckert.design."
      );
      const assistantMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content,
        quickReplies: quickReplies.length ? quickReplies : undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (quickReplies.length) setShowQuickReplies(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Beklager, noget gik galt. Prøv igen eller skriv til hej@duckert.design.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
          40%  { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes chatMsgIn {
          from { opacity: 0; transform: translateY(7px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cw-scroll::-webkit-scrollbar { width: 4px; }
        .cw-scroll::-webkit-scrollbar-track { background: transparent; }
        .cw-scroll::-webkit-scrollbar-thumb { background: rgba(22,71,251,0.15); border-radius: 2px; }
        .cw-qr:hover { background: rgba(22,71,251,0.07) !important; border-color: #1647FB !important; }
        .cw-send:hover:not(:disabled) { opacity: 0.82 !important; }
        .cw-close:hover { background: rgba(255,255,255,0.28) !important; }
      `}</style>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "min(380px, calc(100vw - 32px))",
            maxHeight: "min(620px, calc(100vh - 48px))",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 8px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
            zIndex: 300,
            overflow: "hidden",
            animation: "chatSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#1647FB",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                background: "rgba(255,255,255,0.18)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#fff",
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                D
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: "Montserrat, sans-serif",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Duckert Design AI Assistent
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: "Montserrat, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    background: "#4ade80",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                />
                Online
              </div>
            </div>
            <button
              className="cw-close"
              onClick={handleClose}
              aria-label="Luk chat"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                cursor: "pointer",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <line
                  x1="4"
                  y1="4"
                  x2="20"
                  y2="20"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <line
                  x1="20"
                  y1="4"
                  x2="4"
                  y2="20"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            className="cw-scroll"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "#F3F4F8",
            }}
          >
            {messages.map((msg, idx) => {
              if (msg.isPrivacyCard) {
                return <PrivacyCard key={msg.id} />;
              }

              const isLast = idx === messages.length - 1;

              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "88%",
                    animation: "chatMsgIn 0.25s ease both",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius:
                        msg.role === "user"
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                      fontSize: "14px",
                      fontFamily: "Montserrat, sans-serif",
                      lineHeight: 1.65,
                      ...(msg.role === "user"
                        ? { background: "#1647FB", color: "#fff" }
                        : {
                            background: "#fff",
                            color: "#111",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                          }),
                    }}
                  >
                    {parseContent(msg.content)}
                  </div>

                  {isLast &&
                    showQuickReplies &&
                    msg.role === "assistant" &&
                    msg.quickReplies &&
                    msg.quickReplies.length > 0 && (
                      <div
                        style={{
                          marginTop: "8px",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        {msg.quickReplies.map((reply) => (
                          <button
                            key={reply}
                            className="cw-qr"
                            onClick={() => sendMessage(reply)}
                            style={{
                              background: "#fff",
                              border: "1.5px solid rgba(22,71,251,0.28)",
                              borderRadius: "999px",
                              padding: "6px 14px",
                              fontSize: "12px",
                              fontFamily: "Montserrat, sans-serif",
                              fontWeight: 500,
                              color: "#1647FB",
                              cursor: "pointer",
                              transition: "background 0.15s, border-color 0.15s",
                            }}
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              );
            })}

            {isLoading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  animation: "chatMsgIn 0.25s ease both",
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    padding: "13px 16px",
                    borderRadius: "16px 16px 16px 4px",
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#1647FB",
                        display: "block",
                        animation: "chatDotBounce 1.2s ease-in-out infinite",
                        animationDelay: `${i * 0.18}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              borderTop: "1px solid rgba(0,0,0,0.07)",
              padding: "10px 14px",
              display: "flex",
              gap: "8px",
              alignItems: "center",
              background: "#fff",
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && sendMessage(inputValue)
              }
              disabled={isLoading}
              placeholder="Skriv en besked..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "14px",
                fontFamily: "Montserrat, sans-serif",
                color: "#080808",
                padding: "4px 0",
                opacity: isLoading ? 0.45 : 1,
              }}
            />
            <button
              className="cw-send"
              onClick={() => sendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send besked"
              style={{
                background: "#1647FB",
                border: "none",
                borderRadius: "50%",
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor:
                  isLoading || !inputValue.trim() ? "not-allowed" : "pointer",
                opacity: isLoading || !inputValue.trim() ? 0.28 : 1,
                transition: "opacity 0.2s",
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line
                  x1="22"
                  y1="2"
                  x2="11"
                  y2="13"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <polygon
                  points="22 2 15 22 11 13 2 9 22 2"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
