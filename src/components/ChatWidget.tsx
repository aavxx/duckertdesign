"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/* ─── Constants ───────────────────────────────────────────────────────────── */
const LS_KEY      = "duckert-chat-v1";
const EXPIRY_KEY  = "duckert-chat-expiry";
const SESSION_KEY = "duckert-chat-session-id";
const EXPIRY_MS   = 10 * 60 * 1000;

const INITIAL_QUICK_REPLIES = [
  "Hvad koster en hjemmeside?",
  "Hvor lang tid tager det?",
  "Laver I webshops?",
];

const GREETING = "Hej! 👋 Hvad kan jeg hjælpe dig med?";

const FEEDBACK_EMOJIS = ["😠", "😞", "😐", "😊", "😄"];
const FEEDBACK_LABELS = ["Meget dårlig", "Dårlig", "Okay", "God", "Fantastisk"];

/* ─── Types ───────────────────────────────────────────────────────────────── */
type Message = {
  id: string;
  role: "user" | "assistant" | "admin";
  content: string;
  isPrivacyCard?: boolean;
  isSystem?: boolean;
  quickReplies?: string[];
  streaming?: boolean;
  timestamp?: string;
};

/* ─── Session helpers ─────────────────────────────────────────────────────── */
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
function loadMessages(): Message[] {
  if (typeof window === "undefined") return [];
  if (isExpired()) { clearChat(); return []; }
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as Message[]; } catch { return []; }
}
function saveMessages(msgs: Message[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(msgs)); touchExpiry(); } catch {}
}
function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* ─── Content renderer ────────────────────────────────────────────────────── */
function parseContent(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  text.split("\n").forEach((line, li, arr) => {
    line.split(/(\[[^\]]+\]\([^)]+\))/g).forEach((part, pi) => {
      const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        nodes.push(<a key={`${li}-${pi}`} href={m[2]} target="_blank" rel="noopener noreferrer"
          style={{ color: "#1647FB", textDecoration: "underline" }}>{m[1]}</a>);
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

/* ─── Bouncing dots ───────────────────────────────────────────────────────── */
function BouncingDots() {
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center", padding: "2px 0" }}>
      {[0, 150, 300].map((delay) => (
        <span key={delay} style={{
          width: "7px", height: "7px", borderRadius: "50%",
          background: "rgba(8,8,8,0.3)",
          animation: `cwBounce 1.2s ease-in-out ${delay}ms infinite`,
          display: "inline-block",
        }} />
      ))}
    </div>
  );
}

/* ─── Privacy card ────────────────────────────────────────────────────────── */
function PrivacyCard() {
  return (
    <div style={{
      background: "#f7f7f7", borderRadius: "16px", borderBottomLeftRadius: "4px",
      padding: "14px 16px", maxWidth: "85%",
    }}>
      <p style={{ fontSize: "13px", color: "#080808", lineHeight: 1.6, margin: "0 0 6px", fontFamily: "inherit" }}>
        Vi prioriterer dit privatliv. Læs vores{" "}
        <a href="/privatlivspolitik" style={{ color: "#1647FB", textDecoration: "underline" }}>privatlivspolitik</a>.
      </p>
      <p style={{ fontSize: "12px", color: "#888888", margin: 0, fontFamily: "inherit" }}>
        Prøv f.eks. at spørge: <em>"Hvad koster en hjemmeside?"</em>
      </p>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */
export default function ChatWidget({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [visible, setVisible]           = useState(false);
  const [isOpen, setIsOpen]             = useState(false);
  const [messages, setMessages]         = useState<Message[]>(() => loadMessages());
  const [showQR, setShowQR]             = useState<boolean>(() => {
    const saved = loadMessages();
    if (!saved.length) return false;
    const last = saved[saved.length - 1];
    return last.role === "assistant" && !!(last.quickReplies?.length);
  });
  const [isLoading, setIsLoading]       = useState(false);
  const [input, setInput]               = useState("");
  const [waitingHuman, setWaitingHuman] = useState(false);
  const [chatClaimed, setChatClaimed]   = useState(false);
  const [showWelcome, setShowWelcome]   = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [chatEnded, setChatEnded]       = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [agentTyping, setAgentTyping]   = useState(false);

  const hasInit             = useRef(false);
  const endRef              = useRef<HTMLDivElement>(null);
  const inputRef            = useRef<HTMLInputElement>(null);
  const sessionRef          = useRef<string | null>(null);
  const sseRef              = useRef<EventSource | null>(null);
  const msgAudioRef         = useRef<HTMLAudioElement | null>(null);
  const typingTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef         = useRef(false);
  const agentTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Floating button delay
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") sessionRef.current = localStorage.getItem(SESSION_KEY);
  }, []);

  useEffect(() => { if (messages.length > 0) saveMessages(messages); }, [messages]);

  // External open prop
  useEffect(() => { if (open) setIsOpen(true); }, [open]);

  // Scroll + focus when open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
        if (!chatEnded) inputRef.current?.focus();
      }, 80);
    }
  }, [messages, isLoading, isOpen, chatEnded]);

  // Init on first open
  useEffect(() => {
    if (!isOpen || hasInit.current) return;
    hasInit.current = true;
    touchExpiry();

    if (messages.length > 0) {
      if (sessionRef.current) subscribeAdminReplies(sessionRef.current);
      return;
    }

    setShowWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
      setMessages([
        { id: "privacy", role: "assistant", content: "", isPrivacyCard: true },
        {
          id: "greeting", role: "assistant", content: GREETING,
          quickReplies: INITIAL_QUICK_REPLIES,
        },
      ]);
      setShowQR(true);
    }, 1200);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      sseRef.current?.close();
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (agentTypingTimerRef.current) clearTimeout(agentTypingTimerRef.current);
    };
  }, []);

  // Don't render on admin page
  if (pathname?.startsWith("/mit")) return null;

  /* ── Helpers ── */
  const playMsgSound = () => {
    if (typeof window === "undefined" || !document.hidden) return;
    try {
      if (!msgAudioRef.current) msgAudioRef.current = new Audio("/newmessage.m4a");
      msgAudioRef.current.currentTime = 0;
      msgAudioRef.current.play().catch(() => {});
    } catch {}
  };

  const sendTypingStatus = (typing: boolean) => {
    const sid = sessionRef.current;
    if (!sid) return;
    fetch("/api/chat/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sid, typing }),
    }).catch(() => {});
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (!sessionRef.current || chatEnded) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTypingStatus(true);
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTypingStatus(false);
    }, 2000);
  };

  function subscribeAdminReplies(sid: string) {
    sseRef.current?.close();
    const es = new EventSource(`/api/chat/events?sessionId=${sid}`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as Record<string, unknown>;

        if (data.type === "typing" && data.who === "agent") {
          const isTyping = !!data.typing;
          setAgentTyping(isTyping);
          if (agentTypingTimerRef.current) clearTimeout(agentTypingTimerRef.current);
          if (isTyping) {
            agentTypingTimerRef.current = setTimeout(() => setAgentTyping(false), 5000);
          }
          return;
        }

        if (data.type === "claimed") {
          setChatClaimed(true);
          return;
        }

        if (data.type === "system") {
          setMessages((prev) => [...prev, {
            id: "sys-" + Date.now(),
            role: "assistant" as const,
            content: String(data.content ?? "Chat Afsluttet"),
            isSystem: true,
          }]);
          setChatEnded(true);
          setShowFeedback(true);
          playMsgSound();
          return;
        }

        // Regular admin message
        const msg = data as { id?: string; content?: string };
        if (msg.content) {
          setMessages((prev) => [...prev, {
            id: msg.id ?? String(Date.now()),
            role: "admin" as const,
            content: msg.content!,
          }]);
          setWaitingHuman(false);
          playMsgSound();
        }
      } catch {}
    };
    sseRef.current = es;
  }

  const downloadTranscript = () => {
    const lines = messages
      .filter((m) => !m.isPrivacyCard && m.content)
      .map((m) => {
        const who = m.role === "user" ? "Kunde" : m.role === "admin" ? "Agent" : m.isSystem ? "System" : "Duckert AI";
        return `[${m.timestamp ?? ""}] ${who}: ${m.content}`;
      });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "duckert-chat.txt"; a.click();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
  };

  const endChat = () => {
    setMenuOpen(false);
    const sid = sessionRef.current;
    if (sid) {
      fetch("/api/chat/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid }),
      }).catch(() => {});
    }
    if (isTypingRef.current && sid) {
      isTypingRef.current = false;
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      sendTypingStatus(false);
    }
    setMessages((prev) => [...prev, {
      id: "sys-" + Date.now(),
      role: "assistant" as const,
      content: "Chat Afsluttet",
      isSystem: true,
    }]);
    setChatEnded(true);
    setShowFeedback(true);
  };

  const submitFeedback = (rating: number) => {
    const sid = sessionRef.current;
    if (sid) {
      fetch("/api/chat/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, rating }),
      }).catch(() => {});
    }
    setFeedbackSent(true);
    setTimeout(() => resetChat(), 5000);
  };

  // Unlock audio on first interaction — runs once per page load
  useEffect(() => {
    const unlock = () => {
      try {
        if (!msgAudioRef.current) msgAudioRef.current = new Audio("/newmessage.m4a");
      } catch {}
      document.removeEventListener("click",   unlock, true);
      document.removeEventListener("keydown", unlock, true);
    };
    document.addEventListener("click",   unlock, { capture: true, once: true });
    document.addEventListener("keydown", unlock, { capture: true, once: true });
    return () => {
      document.removeEventListener("click",   unlock, true);
      document.removeEventListener("keydown", unlock, true);
    };
  }, []);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => { setIsOpen(false); onClose?.(); };

  const resetChat = () => {
    sseRef.current?.close();
    clearChat();
    setMessages([]);
    setShowQR(false);
    setWaitingHuman(false);
    setChatClaimed(false);
    setShowWelcome(false);
    setChatEnded(false);
    setShowFeedback(false);
    setFeedbackSent(false);
    setAgentTyping(false);
    setMenuOpen(false);
    hasInit.current = false;
    setIsOpen(false);
    onClose?.();
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || chatEnded) return;

    // Stop typing indicator
    if (isTypingRef.current) {
      isTypingRef.current = false;
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      sendTypingStatus(false);
    }

    // When a human agent has the chat, just forward message — no AI streaming
    if (waitingHuman) {
      const userMsg: Message = { id: Date.now().toString(), role: "user", content: trimmed, timestamp: nowTime() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      const sid = sessionRef.current;
      if (sid) {
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userMessage: trimmed, sessionId: sid, messages: [] }),
        }).catch(() => {});
      }
      return;
    }

    if (trimmed === "Tal med en agent") {
      setShowQR(false);
      const userMsg: Message = { id: Date.now().toString(), role: "user", content: trimmed, timestamp: nowTime() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setWaitingHuman(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [], userMessage: trimmed, sessionId: sessionRef.current ?? undefined, humanHandoff: true }),
        });
        const data = await res.json() as { sessionId?: string };
        const newSid = data.sessionId ?? sessionRef.current;
        if (newSid && newSid !== sessionRef.current) {
          sessionRef.current = newSid;
          try { localStorage.setItem(SESSION_KEY, newSid); } catch {}
        }
        if (newSid) subscribeAdminReplies(newSid);
      } catch {}

      setMessages((prev) => [...prev, {
        id: Date.now().toString(), role: "assistant",
        content: "Tak! Vi forbinder dig med en person nu. Du vil modtage svar her snarest.",
      }]);
      return;
    }

    setShowQR(false);
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: trimmed, timestamp: nowTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const streamId = `stream-${Date.now()}`;
    setMessages((prev) => [...prev, { id: streamId, role: "assistant", content: "", streaming: true }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages
            .filter((m) => !m.isPrivacyCard && !m.isSystem && m.role !== "admin")
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
      const dec = new TextDecoder();
      let full = "", buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        // Fix: Groq uses \r\n line endings
        const lines = buf.split(/\r?\n/); buf = lines.pop() ?? "";
        for (const raw of lines) {
          const ln = raw.trim();
          if (!ln.startsWith("data:") || ln === "data: [DONE]") continue;
          try {
            const chunk = (JSON.parse(ln.slice(5).trim()) as { choices?: [{ delta?: { content?: string } }] }).choices?.[0]?.delta?.content ?? "";
            if (chunk) {
              full += chunk;
              const cur = full;
              setMessages((prev) => prev.map((m) => m.id === streamId ? { ...m, content: cur } : m));
            }
          } catch {}
        }
      }

      const { content, quickReplies } = parseQuickReplies(
        full || "Beklager, jeg kunne ikke svare. Skriv til hej@duckert.design."
      );
      setMessages((prev) => prev.map((m) =>
        m.id === streamId
          ? { ...m, content, quickReplies: quickReplies.length ? quickReplies : undefined, streaming: false }
          : m
      ));
      if (quickReplies.length) setShowQR(true);
      // Play sound if tab hidden after AI responds
      playMsgSound();
    } catch {
      setMessages((prev) => prev.map((m) =>
        m.id === streamId
          ? { ...m, content: "Beklager, noget gik galt. Skriv til hej@duckert.design.", streaming: false }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const msgCount = messages.filter((m) => !m.isPrivacyCard).length;

  return (
    <>
      <style>{`
        @keyframes cwBounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes cwSlideUp { from{opacity:0;transform:translateY(16px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes cwMsgIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cwFabIn { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
        @keyframes cwFeedbackIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .cw-msg { animation: cwMsgIn 0.25s ease-out both; }
        .cw-scroll::-webkit-scrollbar { width: 3px; }
        .cw-scroll::-webkit-scrollbar-track { background: transparent; }
        .cw-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 2px; }
        .cw-qr-btn:hover { background: rgba(8,8,8,0.08) !important; border-color: rgba(8,8,8,0.3) !important; }
        .cw-input:focus { outline: none; box-shadow: none; }
        .cw-send:hover:not(:disabled) { opacity: 0.8; }
        .cw-close:hover { color: #080808 !important; }
        .cw-agent-btn:hover { color: #1647FB !important; text-decoration: underline; }
        .cw-menu-item { display:block; width:100%; padding:10px 14px; border:none; cursor:pointer; background:transparent; text-align:left; font-size:13px; font-family:Montserrat,sans-serif; color:#080808; transition:background 0.12s; }
        .cw-menu-item:hover { background:rgba(8,8,8,0.05); }
        .cw-menu-item:disabled { color:rgba(8,8,8,0.3); cursor:default; }
        .cw-emoji-btn { border:none; background:transparent; cursor:pointer; font-size:28px; padding:6px; border-radius:12px; transition:transform 0.15s, background 0.15s; display:flex; flex-direction:column; align-items:center; gap:4px; }
        .cw-emoji-btn:hover { transform:scale(1.18); background:rgba(8,8,8,0.05); }

        /* Floating button */
        .cw-fab {
          position: fixed;
          bottom: 16px; right: 16px;
          z-index: 999;
          width: 48px; height: 48px;
          border-radius: 50%;
          background: #1647FB;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 24px rgba(22,71,251,0.35);
          animation: cwFabIn 0.4s cubic-bezier(0.16,1,0.3,1) both;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cw-fab:hover { transform: scale(1.08); box-shadow: 0 6px 32px rgba(22,71,251,0.45); }

        /* Chat window */
        .cw-window {
          position: fixed;
          z-index: 999;
          bottom: 0; right: 0;
          width: 100%; height: 100dvh;
          background: #ffffff;
          display: flex; flex-direction: column; overflow: hidden;
          border-radius: 0;
          box-shadow: 0 25px 80px rgba(0,0,0,0.18);
          animation: cwSlideUp 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }

        @media (min-width: 640px) {
          .cw-fab { bottom: 24px; right: 24px; width: 56px; height: 56px; }
          .cw-window { bottom: 24px; right: 24px; width: 384px; height: 500px; border-radius: 18px; }
        }
      `}</style>

      {/* ── Floating button ── */}
      {!isOpen && visible && (
        <button className="cw-fab" onClick={handleOpen} aria-label="Åbn chat">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* ── Chat window ── */}
      {isOpen && (
        <div className="cw-window" role="dialog" aria-modal="true" aria-label="Chat med Duckert Design" style={{ position: "fixed" }}>

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "1px solid #ebebeb",
            background: "#ffffff",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                width: "9px", height: "9px", borderRadius: "50%", flexShrink: 0,
                background: chatEnded ? "#d1d5db" : waitingHuman ? "#facc15" : "#4ade80",
              }} />
              <span style={{
                fontSize: "14px", fontWeight: 600, color: "#080808",
                fontFamily: "Montserrat, sans-serif", letterSpacing: "-0.01em",
              }}>
                {chatEnded ? "Chat afsluttet" : waitingHuman ? "Forbinder med teamet…" : "Duckert AI"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              {/* 3-dot menu */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Menuindstillinger"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#888888", padding: "6px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "8px", transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#080808")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
                {menuOpen && (
                  <>
                    <div
                      style={{ position: "fixed", inset: 0, zIndex: 1000 }}
                      onClick={() => setMenuOpen(false)}
                    />
                    <div style={{
                      position: "absolute", top: "calc(100% + 4px)", right: 0,
                      background: "#fff", borderRadius: "12px",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                      border: "1px solid #ebebeb",
                      zIndex: 1001, minWidth: "180px", overflow: "hidden",
                    }}>
                      <button className="cw-menu-item" onClick={downloadTranscript}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Download transkript
                        </span>
                      </button>
                      <button className="cw-menu-item" onClick={endChat} disabled={chatEnded} style={{ color: chatEnded ? "rgba(8,8,8,0.3)" : "#ef4444" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          Afslut chat
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
              {/* X close */}
              <button
                className="cw-close"
                onClick={handleClose}
                aria-label="Luk chat"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#888888", padding: "6px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "8px", transition: "color 0.15s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="cw-scroll"
            style={{
              flex: 1, overflowY: "auto",
              padding: "16px",
              display: "flex", flexDirection: "column", gap: "12px",
              background: "#ffffff",
            }}
          >
            {/* Welcome loading dots */}
            {showWelcome && (
              <div className="cw-msg" style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ borderRadius: "16px", borderBottomLeftRadius: "4px", padding: "12px 16px", background: "#f2f2f2" }}>
                  <BouncingDots />
                </div>
              </div>
            )}

            {messages.map((msg, idx) => {
              if (msg.isPrivacyCard) {
                return (
                  <div key={msg.id} className="cw-msg" style={{ display: "flex", justifyContent: "flex-start" }}>
                    <PrivacyCard />
                  </div>
                );
              }

              // System message (centered badge)
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="cw-msg" style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
                    <span style={{
                      background: "rgba(8,8,8,0.06)", color: "rgba(8,8,8,0.5)",
                      borderRadius: "999px", padding: "5px 18px",
                      fontSize: "11px", fontWeight: 600, fontFamily: "Montserrat, sans-serif",
                    }}>
                      {msg.content}
                    </span>
                  </div>
                );
              }

              const isLast = idx === messages.length - 1;

              if (msg.role === "user") {
                return (
                  <div key={msg.id} className="cw-msg" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <div style={{
                      borderRadius: "16px", borderBottomRightRadius: "4px",
                      padding: "10px 14px", maxWidth: "85%",
                      background: "#f2f2f2", color: "#080808",
                      fontSize: "14px", fontFamily: "Montserrat, sans-serif", lineHeight: 1.55,
                    }}>
                      {msg.content}
                    </div>
                    {msg.timestamp && (
                      <span style={{
                        fontSize: "10px", color: "rgba(8,8,8,0.35)",
                        marginTop: "3px", marginRight: "2px",
                        fontFamily: "Montserrat, sans-serif",
                      }}>
                        {msg.timestamp} · Set
                      </span>
                    )}
                  </div>
                );
              }

              // Admin or assistant
              return (
                <div key={msg.id} className="cw-msg" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <div style={{
                    borderRadius: "16px", borderBottomLeftRadius: "4px",
                    padding: "10px 14px", maxWidth: "85%",
                    background: "#f2f2f2", color: "#080808",
                    fontSize: "14px", fontFamily: "Montserrat, sans-serif", lineHeight: 1.6,
                    minHeight: msg.streaming && !msg.content ? "42px" : undefined,
                    display: "flex", alignItems: "center",
                  }}>
                    {msg.streaming && !msg.content
                      ? <BouncingDots />
                      : <span>{parseContent(msg.content)}</span>
                    }
                    {msg.streaming && msg.content && (
                      <span style={{
                        display: "inline-block", width: "2px", height: "13px",
                        background: "rgba(8,8,8,0.4)", borderRadius: "1px",
                        marginLeft: "2px", verticalAlign: "middle",
                        animation: "cwBounce 0.85s ease infinite",
                      }} />
                    )}
                  </div>

                  {/* Quick replies */}
                  {isLast && showQR && !msg.streaming && msg.quickReplies?.length ? (
                    <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {msg.quickReplies.map((reply) => (
                        <button
                          key={reply}
                          className="cw-qr-btn"
                          onClick={() => void sendMessage(reply)}
                          style={{
                            background: "#f7f7f7", border: "1.5px solid rgba(8,8,8,0.12)",
                            borderRadius: "999px", padding: "6px 14px",
                            fontSize: "12px", fontFamily: "Montserrat, sans-serif",
                            fontWeight: 500, color: "#444444", cursor: "pointer",
                            transition: "background 0.15s, border-color 0.15s",
                          }}
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {/* AI loading (between user send and stream start) */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="cw-msg" style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ borderRadius: "16px", borderBottomLeftRadius: "4px", padding: "12px 16px", background: "#f2f2f2" }}>
                  <BouncingDots />
                </div>
              </div>
            )}

            {/* Agent typing indicator */}
            {agentTyping && (
              <div className="cw-msg" style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={{
                  borderRadius: "16px", borderBottomLeftRadius: "4px",
                  padding: "12px 16px", background: "#f2f2f2",
                }}>
                  <BouncingDots />
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input / ended area */}
          {chatEnded ? (
            <div style={{
              padding: "16px", borderTop: "1px solid #ebebeb",
              background: "#fff", flexShrink: 0, textAlign: "center",
            }}>
              <p style={{
                fontSize: "12px", color: "rgba(8,8,8,0.4)",
                fontFamily: "Montserrat, sans-serif", margin: 0,
              }}>
                Chatten er afsluttet
              </p>
            </div>
          ) : (
            <div style={{
              padding: "12px 14px 14px",
              borderTop: "1px solid #ebebeb",
              background: "#ffffff",
              flexShrink: 0,
            }}>
              <form
                onSubmit={(e) => { e.preventDefault(); if (input.trim() && !isLoading) void sendMessage(input.trim()); }}
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <input
                  ref={inputRef}
                  className="cw-input"
                  type="text"
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  disabled={isLoading}
                  placeholder={
                    isLoading    ? "Skriver…" :
                    waitingHuman ? "Venter på svar fra teamet…" :
                                   "Skriv en besked..."
                  }
                  style={{
                    flex: 1, border: "1px solid #ebebeb", borderRadius: "999px",
                    padding: "10px 16px", fontSize: "14px",
                    fontFamily: "Montserrat, sans-serif", color: "#080808",
                    background: "#f7f7f7", outline: "none",
                  }}
                />
                <button
                  type="submit"
                  className="cw-send"
                  disabled={!input.trim() || isLoading}
                  aria-label="Send besked"
                  style={{
                    width: "38px", height: "38px", flexShrink: 0, borderRadius: "50%",
                    background: input.trim() && !isLoading ? "#1647FB" : "rgba(8,8,8,0.08)",
                    border: "none", cursor: input.trim() && !isLoading ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s, opacity 0.2s",
                    opacity: isLoading ? 0.4 : 1,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <line x1="22" y1="2" x2="11" y2="13" stroke={input.trim() && !isLoading ? "white" : "#888"} strokeWidth="2" strokeLinecap="round" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" stroke={input.trim() && !isLoading ? "white" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </button>
              </form>

              {/* Agent button + branding */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginTop: "8px",
              }}>
                {!waitingHuman && !chatClaimed && !chatEnded && (
                  <button
                    className="cw-agent-btn"
                    onClick={() => void sendMessage("Tal med en agent")}
                    disabled={isLoading}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: "11px", color: "rgba(8,8,8,0.45)",
                      fontFamily: "Montserrat, sans-serif", transition: "color 0.15s",
                      padding: "0", display: "flex", alignItems: "center", gap: "4px",
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Tal med en agent
                  </button>
                )}
                <p style={{
                  fontSize: "10px", color: "rgba(8,8,8,0.28)",
                  fontFamily: "Montserrat, sans-serif", margin: "0 0 0 auto",
                }}>
                  AI-drevet · Duckert Design
                </p>
              </div>
            </div>
          )}

          {/* ── Feedback popup ── */}
          {showFeedback && (
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "#ffffff",
              borderTop: "1px solid #ebebeb",
              padding: "20px 20px 28px",
              borderRadius: "0 0 18px 18px",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.06)",
              animation: "cwFeedbackIn 0.35s cubic-bezier(0.16,1,0.3,1) both",
              zIndex: 10,
            }}>
              {feedbackSent ? (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>😊</div>
                  <p style={{
                    fontSize: "15px", fontWeight: 700, color: "#080808",
                    fontFamily: "Montserrat, sans-serif", margin: "0 0 4px",
                  }}>
                    Tak for din feedback!
                  </p>
                  <p style={{
                    fontSize: "12px", color: "rgba(8,8,8,0.4)",
                    fontFamily: "Montserrat, sans-serif", margin: 0,
                  }}>
                    Chatten lukkes automatisk om et øjeblik…
                  </p>
                </div>
              ) : (
                <>
                  <p style={{
                    fontSize: "13px", fontWeight: 700, color: "#080808",
                    fontFamily: "Montserrat, sans-serif", textAlign: "center",
                    margin: "0 0 16px",
                  }}>
                    Hvordan var din oplevelse?
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                    {FEEDBACK_EMOJIS.map((emoji, i) => (
                      <button
                        key={i}
                        className="cw-emoji-btn"
                        onClick={() => submitFeedback(i + 1)}
                        title={FEEDBACK_LABELS[i]}
                      >
                        <span style={{ fontSize: "26px", lineHeight: 1 }}>{emoji}</span>
                        <span style={{
                          fontSize: "9px", color: "rgba(8,8,8,0.4)",
                          fontFamily: "Montserrat, sans-serif", fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}>
                          {FEEDBACK_LABELS[i]}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
