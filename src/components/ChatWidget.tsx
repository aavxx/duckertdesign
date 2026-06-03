"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const WELCOME_TEXT =
  "Hej! Jeg er Duckerts virtuelle assistent og er her for at hjælpe dig. 👋\n\nVed at fortsætte accepterer du vores [privatlivspolitik](https://duckert.design/privatlivspolitik).";

function parseContent(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const lines = text.split("\n");
  lines.forEach((line, li) => {
    const parts = line.split(/(\[[^\]]+\]\([^)]+\))/g);
    parts.forEach((part, pi) => {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        nodes.push(
          <a
            key={`${li}-${pi}`}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1647FB", textDecoration: "underline" }}
          >
            {match[1]}
          </a>
        );
      } else if (part) {
        nodes.push(<span key={`${li}-${pi}`}>{part}</span>);
      }
    });
    if (li < lines.length - 1) nodes.push(<br key={`br-${li}`} />);
  });
  return nodes;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [animatingText, setAnimatingText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(false);

  const hasOpened = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, animatingText, isTyping]);

  // Intro sequence on first open
  useEffect(() => {
    if (!isOpen || hasOpened.current) return;
    hasOpened.current = true;
    setIsAnimating(true);

    const t1 = setTimeout(() => {
      setWelcomeVisible(true);
      const t2 = setTimeout(() => {
        let i = 0;
        const interval = setInterval(() => {
          i++;
          setAnimatingText(WELCOME_TEXT.slice(0, i));
          if (i >= WELCOME_TEXT.length) {
            clearInterval(interval);
            setMessages([{ id: "welcome", role: "assistant", content: WELCOME_TEXT }]);
            setAnimatingText("");
            setIsAnimating(false);
            inputRef.current?.focus();
          }
        }, 25);
      }, 350);
      return () => clearTimeout(t2);
    }, 2000);

    return () => clearTimeout(t1);
  }, [isOpen]);

  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text || isTyping || isAnimating) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Fire API request immediately; wait for both 3s and response
    let responseText = "";
    const apiPromise = (async () => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            userMessage: text,
          }),
        });
        if (!res.ok || !res.body) {
          responseText = "Beklager, noget gik galt. Prøv igen eller skriv til hej@duckert.design.";
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
            try {
              const json = JSON.parse(line.slice(6));
              responseText += json.choices?.[0]?.delta?.content ?? "";
            } catch {
              // ignore parse errors
            }
          }
        }
      } catch {
        responseText = "Forbindelsesfejl. Prøv igen.";
      }
    })();

    const delay = new Promise<void>((r) => setTimeout(r, 3000));
    await Promise.all([apiPromise, delay]);

    setIsTyping(false);
    setIsAnimating(true);

    const final = responseText || "Beklager, jeg kunne ikke svare. Skriv til hej@duckert.design.";
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setAnimatingText(final.slice(0, i));
      if (i >= final.length) {
        clearInterval(interval);
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "assistant", content: final },
        ]);
        setAnimatingText("");
        setIsAnimating(false);
      }
    }, 22);
  };

  const canInput = !isAnimating && !isTyping;

  return (
    <>
      {/* Chat panel */}
      <div
        style={{
          position: "fixed",
          bottom: "104px",
          right: "32px",
          width: "360px",
          maxHeight: "540px",
          background: "#ffffff",
          border: "1px solid rgba(22,71,251,0.15)",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          boxShadow: "0 8px 40px rgba(22,71,251,0.15)",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "scale(1) translateY(0)" : "scale(0.95) translateY(8px)",
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s cubic-bezier(0.16,1,0.3,1)",
          transformOrigin: "bottom right",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(22,71,251,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "#1647FB",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="white" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#080808", lineHeight: 1.2 }}>
                Duckert Assistent
              </div>
              <div style={{ fontSize: "11px", color: "#1647FB", fontWeight: 500 }}>Online</div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Luk chat"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.5,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="4" y1="4" x2="20" y2="20" stroke="#080808" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="20" y1="4" x2="4" y2="20" stroke="#080808" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* Welcome bubble (slides up on intro) */}
          {messages.length === 0 && welcomeVisible && (
            <div
              style={{
                opacity: welcomeVisible ? 1 : 0,
                transform: welcomeVisible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)",
                alignSelf: "flex-start",
                maxWidth: "85%",
              }}
            >
              <div
                style={{
                  background: "#1647FB",
                  color: "#ffffff",
                  padding: "10px 14px",
                  borderRadius: "12px 12px 12px 2px",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                {animatingText
                  ? parseContent(animatingText)
                  : parseContent(WELCOME_TEXT)}
              </div>
            </div>
          )}

          {/* Rendered messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
              }}
            >
              <div
                style={{
                  background: msg.role === "user" ? "#1647FB" : "#1647FB",
                  color: "#ffffff",
                  padding: "10px 14px",
                  borderRadius:
                    msg.role === "user"
                      ? "12px 12px 2px 12px"
                      : "12px 12px 12px 2px",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  fontFamily: "Montserrat, sans-serif",
                  ...(msg.role === "assistant" && {
                    background: "transparent",
                    color: "#080808",
                    border: "1px solid rgba(22,71,251,0.15)",
                  }),
                }}
              >
                {parseContent(msg.content)}
              </div>
            </div>
          ))}

          {/* Animating assistant response */}
          {!isTyping && isAnimating && messages.length > 0 && animatingText && (
            <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
              <div
                style={{
                  background: "transparent",
                  color: "#080808",
                  border: "1px solid rgba(22,71,251,0.15)",
                  padding: "10px 14px",
                  borderRadius: "12px 12px 12px 2px",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                {parseContent(animatingText)}
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ alignSelf: "flex-start" }}>
              <div
                style={{
                  background: "transparent",
                  border: "1px solid rgba(22,71,251,0.15)",
                  padding: "12px 16px",
                  borderRadius: "12px 12px 12px 2px",
                  display: "flex",
                  gap: "5px",
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      display: "block",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#1647FB",
                      animation: "chatDotBounce 1.2s ease-in-out infinite",
                      animationDelay: `${i * 0.2}s`,
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
            borderTop: "1px solid rgba(22,71,251,0.1)",
            padding: "12px 16px",
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={!canInput}
            placeholder="Skriv en besked..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "14px",
              fontFamily: "Montserrat, sans-serif",
              color: "#080808",
              opacity: canInput ? 1 : 0.4,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!canInput || !inputValue.trim()}
            aria-label="Send besked"
            style={{
              background: "#1647FB",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: canInput && inputValue.trim() ? "pointer" : "not-allowed",
              opacity: canInput && inputValue.trim() ? 1 : 0.3,
              transition: "opacity 0.2s",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <line x1="22" y1="2" x2="11" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Luk chat" : "Åbn chat"}
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
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
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 6px 32px rgba(22,71,251,0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 24px rgba(22,71,251,0.4)";
        }}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="4" x2="20" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="4" x2="4" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="white" />
          </svg>
        )}
      </button>
    </>
  );
}
