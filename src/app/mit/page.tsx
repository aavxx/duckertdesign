"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ─── Types ───────────────────────────────────────────────────────────────── */
type ChatMsg = {
  id: string;
  role: "user" | "assistant" | "admin" | "system";
  content: string;
  ts: number;
};
type ChatSession = {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: "ai" | "human" | "claimed" | "closed";
  messages: ChatMsg[];
  visitorInfo?: { page: string; userAgent: string };
};
type Email = { uid: number; subject: string; from: string; date: string | null; seen: boolean };
type EmailBody = Email & { text: string | null; html: string | null; to: string | null };
type FeedbackEntry = { id: string; sessionId: string; rating: number; createdAt: number };
type Tab = "chats" | "mails" | "feedback";

type LoginStage =
  | { stage: "email" }
  | { stage: "checking" }
  | { stage: "sent"; email: string }
  | { stage: "code"; email: string; err?: string }
  | { stage: "verifying"; email: string };

/* ─── Slash commands ──────────────────────────────────────────────────────── */
const SLASH_COMMANDS = [
  { cmd: "/hej",         label: "Hej",             desc: "Overtag og byd velkommen" },
  { cmd: "/farvel",      label: "Farvel",           desc: "Send farvel og luk chat" },
  { cmd: "/luk",         label: "Luk",              desc: "Luk chat uden besked" },
  { cmd: "/inaktiv",     label: "Inaktiv",          desc: "Inaktivitetsadvarsel (2 min timer)" },
  { cmd: "/tilbud",      label: "Tilbud",           desc: "Spørg ind til projekt og tilbud" },
  { cmd: "/møde",        label: "Møde",             desc: "Foreslå møde/opkald" },
  { cmd: "/pris",        label: "Pris",             desc: "Send prisoversigt" },
  { cmd: "/webshop",     label: "Webshop",          desc: "Info om webshop-løsninger" },
  { cmd: "/tid",         label: "Tid",              desc: "Info om leveringstid" },
  { cmd: "/reference",   label: "Reference",        desc: "Send link til portfolio" },
  { cmd: "/mail",        label: "Mail",             desc: "Bed om kontaktmail" },
  { cmd: "/kontakt",     label: "Kontakt",          desc: "Send kontaktoplysninger" },
  { cmd: "/venlist",     label: "Vent venligst",    desc: "Send ventebesked" },
  { cmd: "/overlevering",label: "Overlevering",     desc: "Info om hvad kunden skal levere" },
  { cmd: "/hjælp",       label: "Hjælp",            desc: "Vis tilgængelige kommandoer" },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function fmtTime(ts: number | string | null) {
  if (!ts) return "";
  const d = typeof ts === "number" ? new Date(ts) : new Date(ts);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 60_000) return "Netop nu";
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)} min`;
  if (diffMs < 86_400_000) return d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("da-DK", { day: "numeric", month: "short" });
}

function initials(from: string) {
  const name = from.replace(/<[^>]+>/, "").trim();
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
}

const FEEDBACK_EMOJIS = ["😠", "😞", "😐", "😊", "😄"];
const FEEDBACK_LABELS = ["Meget dårlig", "Dårlig", "Okay", "God", "Fantastisk"];

/* ─── Sparkle icon ────────────────────────────────────────────────────────── */
function Sparkle({ size = 14, color = "#1647FB" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M13 1 L15.2 7.8 L22 10 L15.2 12.2 L13 19 L10.8 12.2 L4 10 L10.8 7.8 Z" fill={color} />
      <path d="M24 5 L25 8.5 L28.5 9.5 L25 10.5 L24 14 L23 10.5 L19.5 9.5 L23 8.5 Z" fill={color} opacity="0.55" />
      <circle cx="26" cy="20" r="1.8" fill={color} opacity="0.35" />
    </svg>
  );
}

/* ─── Spinner ─────────────────────────────────────────────────────────────── */
function Spinner({ size = 24 }: { size?: number }) {
  return (
    <>
      <style>{`@keyframes dkSpin{to{transform:rotate(360deg)}}`}</style>
      <div style={{
        width: size, height: size,
        border: "2.5px solid rgba(22,71,251,0.15)",
        borderTopColor: "#1647FB", borderRadius: "50%",
        animation: "dkSpin 0.75s linear infinite", flexShrink: 0,
      }} />
    </>
  );
}

/* ─── Bouncing dots ───────────────────────────────────────────────────────── */
function BouncingDots() {
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center", padding: "2px 0" }}>
      {[0, 150, 300].map((delay) => (
        <span key={delay} style={{
          width: "6px", height: "6px", borderRadius: "50%",
          background: "rgba(8,8,8,0.3)",
          animation: `dkBounce 1.2s ease-in-out ${delay}ms infinite`,
          display: "inline-block",
        }} />
      ))}
      <style>{`@keyframes dkBounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

/* ─── 4-digit code boxes ──────────────────────────────────────────────────── */
function CodeBoxes({ disabled, hasError, onComplete }: {
  disabled: boolean; hasError: boolean; onComplete: (code: string) => void;
}) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const commit = (next: string[]) => {
    setDigits(next);
    if (next.every((d) => d !== "")) onComplete(next.join(""));
  };

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...digits]; next[i] = digit;
    if (digit && i < 3) refs.current[i + 1]?.focus();
    commit(next);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) { const next = [...digits]; next[i] = ""; setDigits(next); }
      else if (i > 0) refs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 3) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!paste) return;
    e.preventDefault();
    const next: string[] = ["", "", "", ""];
    for (let i = 0; i < paste.length; i++) next[i] = paste[i];
    refs.current[Math.min(paste.length, 3)]?.focus();
    commit(next);
  };

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text" inputMode="numeric" pattern="[0-9]*"
          value={digit} maxLength={2} disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
          style={{
            width: "62px", height: "72px",
            border: `2px solid ${hasError ? "#ef4444" : digit ? "#1647FB" : "rgba(22,71,251,0.2)"}`,
            borderRadius: "12px", textAlign: "center",
            fontSize: "28px", fontWeight: 800, color: "#080808",
            fontFamily: "Montserrat, sans-serif", outline: "none",
            background: hasError ? "rgba(239,68,68,0.04)" : digit ? "rgba(22,71,251,0.04)" : "#fff",
            transition: "border-color 0.15s, background 0.15s",
            caretColor: "transparent", opacity: disabled ? 0.5 : 1,
          }}
          onFocus={(e) => { if (!hasError) e.target.style.borderColor = "#1647FB"; e.target.style.boxShadow = "0 0 0 3px rgba(22,71,251,0.08)"; }}
          onBlur={(e) => { e.target.style.borderColor = hasError ? "#ef4444" : digit ? "#1647FB" : "rgba(22,71,251,0.2)"; e.target.style.boxShadow = "none"; }}
        />
      ))}
    </div>
  );
}

/* ─── Login screen ────────────────────────────────────────────────────────── */
function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [step, setStep]           = useState<LoginStage>({ stage: "email" });
  const [emailVal, setEmailVal]   = useState("");
  const [globalErr, setGlobalErr] = useState<string | null>(null);

  const requestCode = async () => {
    const email = emailVal.trim();
    if (!email) return;
    setGlobalErr(null);
    setStep({ stage: "checking" });
    try {
      const [res] = await Promise.all([
        fetch("/api/admin/auth/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }),
        new Promise<void>((r) => setTimeout(r, 2000)),
      ]);
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setGlobalErr(data.error ?? "Noget gik galt. Prøv igen.");
        setStep({ stage: "email" });
        return;
      }
      setStep({ stage: "sent", email });
      setTimeout(() => setStep({ stage: "code", email }), 5000);
    } catch {
      setGlobalErr("Forbindelsesfejl. Prøv igen.");
      setStep({ stage: "email" });
    }
  };

  const verifyCode = async (code: string, email: string) => {
    setStep({ stage: "verifying", email });
    try {
      const res = await fetch("/api/admin/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setStep({ stage: "code", email, err: data.error ?? "Forkert kode. Prøv igen." });
        return;
      }
      const { token } = await res.json() as { token: string };
      onLogin(token);
    } catch {
      setStep({ stage: "code", email, err: "Forbindelsesfejl. Prøv igen." });
    }
  };

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "24px" }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "48px 40px",
        boxShadow: "0 8px 48px rgba(22,71,251,0.1)", width: "100%", maxWidth: "380px", textAlign: "center",
      }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#1647FB", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <Sparkle size={28} color="white" />
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#080808", margin: "0 0 6px", letterSpacing: "-0.03em", fontFamily: "Montserrat, sans-serif" }}>
          Duckert Admin
        </h1>
        {children}
      </div>
    </div>
  );

  if (step.stage === "email") return (
    <Card>
      <p style={{ fontSize: "13px", color: "rgba(8,8,8,0.45)", margin: "0 0 32px", fontFamily: "Montserrat, sans-serif" }}>
        Indtast din e-mailadresse for at fortsætte
      </p>
      <input
        type="email" value={emailVal} autoFocus
        onChange={(e) => { setEmailVal(e.target.value); setGlobalErr(null); }}
        onKeyDown={(e) => e.key === "Enter" && void requestCode()}
        placeholder="din@email.dk"
        style={{
          width: "100%", padding: "12px 16px",
          border: `1.5px solid ${globalErr ? "#ef4444" : "rgba(22,71,251,0.2)"}`,
          borderRadius: "10px", fontSize: "14px", fontFamily: "Montserrat, sans-serif",
          color: "#080808", outline: "none", background: "#fff",
          boxSizing: "border-box", marginBottom: "12px", transition: "border-color 0.2s",
        }}
        onFocus={(e) => { e.target.style.borderColor = globalErr ? "#ef4444" : "#1647FB"; }}
        onBlur={(e) => { e.target.style.borderColor = globalErr ? "#ef4444" : "rgba(22,71,251,0.2)"; }}
      />
      {globalErr && <p style={{ fontSize: "12px", color: "#ef4444", margin: "0 0 12px", fontFamily: "Montserrat, sans-serif", textAlign: "left" }}>{globalErr}</p>}
      <button onClick={() => void requestCode()} style={{ width: "100%", padding: "12px", background: "#1647FB", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontFamily: "Montserrat, sans-serif", fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s" }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
        Send kode
      </button>
    </Card>
  );

  if (step.stage === "checking") return (
    <Card>
      <p style={{ fontSize: "13px", color: "rgba(8,8,8,0.45)", margin: "0 0 32px", fontFamily: "Montserrat, sans-serif" }}>Tjekker din adresse…</p>
      <div style={{ display: "flex", justifyContent: "center" }}><Spinner /></div>
    </Card>
  );

  if (step.stage === "sent") return (
    <Card>
      <p style={{ fontSize: "13px", color: "rgba(8,8,8,0.45)", margin: "0 0 8px", fontFamily: "Montserrat, sans-serif" }}>
        Sendt til <strong style={{ color: "#080808" }}>{step.email}</strong>
      </p>
      <p style={{ fontSize: "13px", color: "rgba(8,8,8,0.45)", margin: "0 0 28px", fontFamily: "Montserrat, sans-serif" }}>Tjek din indbakke</p>
      <div style={{ display: "flex", justifyContent: "center" }}><Spinner /></div>
    </Card>
  );

  const codeEmail   = step.email;
  const codeErr     = step.stage === "code" ? (step.err ?? null) : null;
  const isVerifying = step.stage === "verifying";

  return (
    <Card>
      <p style={{ fontSize: "13px", color: "rgba(8,8,8,0.45)", margin: "0 0 28px", fontFamily: "Montserrat, sans-serif" }}>
        Vi har sendt en 4-cifret kode til <strong style={{ color: "#080808" }}>{codeEmail}</strong>
      </p>
      <CodeBoxes disabled={isVerifying} hasError={!!codeErr} onComplete={(code) => void verifyCode(code, codeEmail)} />
      {isVerifying && <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}><Spinner /></div>}
      {codeErr && <p style={{ fontSize: "12px", color: "#ef4444", margin: "14px 0 0", fontFamily: "Montserrat, sans-serif" }}>{codeErr}</p>}
      <button onClick={() => { setStep({ stage: "email" }); setGlobalErr(null); }}
        style={{ background: "none", border: "none", fontSize: "12px", color: "rgba(8,8,8,0.38)", fontFamily: "Montserrat, sans-serif", cursor: "pointer", marginTop: "20px", textDecoration: "underline", textUnderlineOffset: "3px" }}>
        Prøv en anden adresse
      </button>
    </Card>
  );
}

/* ─── Status badge ────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    ai:      { label: "AI",               bg: "rgba(34,197,94,0.1)",   color: "#16a34a" },
    human:   { label: "Menneskelig",      bg: "rgba(22,71,251,0.08)",  color: "#1647FB" },
    claimed: { label: "Under behandling", bg: "rgba(249,115,22,0.1)",  color: "#ea580c" },
    closed:  { label: "Lukket",           bg: "rgba(8,8,8,0.06)",      color: "rgba(8,8,8,0.45)" },
  };
  const s = map[status] ?? map.ai;
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: "999px", padding: "4px 12px",
      fontSize: "11px", fontWeight: 700, fontFamily: "Montserrat, sans-serif",
    }}>
      {s.label}
    </span>
  );
}

/* ─── Main admin app ──────────────────────────────────────────────────────── */
function AdminApp({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [tab, setTab]                         = useState<Tab>("chats");
  const [chats, setChats]                     = useState<ChatSession[]>([]);
  const [emails, setEmails]                   = useState<Email[]>([]);
  const [feedback, setFeedback]               = useState<FeedbackEntry[]>([]);
  const [selectedChat, setSelectedChat]       = useState<ChatSession | null>(null);
  const [selectedEmail, setSelectedEmail]     = useState<EmailBody | null>(null);
  const [loadingEmail, setLoadingEmail]       = useState(false);
  const [replyText, setReplyText]             = useState("");
  const [sending, setSending]                 = useState(false);
  const [notification, setNotification]       = useState<string | null>(null);
  const [unreadChats, setUnreadChats]         = useState<Set<string>>(new Set());
  const [unreadMails, setUnreadMails]         = useState(0);
  const [customerTyping, setCustomerTyping]   = useState<Record<string, boolean>>({});
  const [slashOpen, setSlashOpen]             = useState(false);
  const [slashMatches, setSlashMatches]       = useState(SLASH_COMMANDS);
  const [slashIdx, setSlashIdx]               = useState(0);

  const messagesEndRef      = useRef<HTMLDivElement>(null);
  const sseAbortRef         = useRef<AbortController | null>(null);
  const msgAudioRef         = useRef<HTMLAudioElement | null>(null);
  const chatAudioRef        = useRef<HTMLAudioElement | null>(null);
  const agentTypingRef      = useRef(false);
  const agentTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inactiveTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedChatRef     = useRef<ChatSession | null>(null);

  const headers = { "x-admin-key": token, "Content-Type": "application/json" };

  // Pre-init audio on mount (after login = user has already clicked = autoplay allowed)
  useEffect(() => {
    try {
      msgAudioRef.current  = new Audio("/newmessage.m4a");
      chatAudioRef.current = new Audio("/newchat.m4a");
    } catch {}
  }, []);

  // Keep ref in sync with state for use inside callbacks
  useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUnauthorized = () => {
    try { sessionStorage.removeItem("duckert-admin-token"); } catch {}
    onLogout();
  };

  const playMsgSound = () => {
    if (typeof window === "undefined" || !document.hidden) return;
    try {
      if (!msgAudioRef.current) msgAudioRef.current = new Audio("/newmessage.m4a");
      msgAudioRef.current.currentTime = 0;
      msgAudioRef.current.play().catch(() => {});
    } catch {}
  };

  const playChatSound = () => {
    if (typeof window === "undefined" || !document.hidden) return;
    try {
      if (!chatAudioRef.current) chatAudioRef.current = new Audio("/newchat.m4a");
      chatAudioRef.current.currentTime = 0;
      chatAudioRef.current.play().catch(() => {});
    } catch {}
  };

  const loadChats = useCallback(async () => {
    const res = await fetch("/api/admin/chats", { headers: { "x-admin-key": token } });
    if (res.status === 401) { handleUnauthorized(); return; }
    if (res.ok) {
      const data: ChatSession[] = await res.json();
      setChats(data);
      // Update selectedChat if it's in the list
      const cur = selectedChatRef.current;
      if (cur) {
        const updated = data.find((c) => c.id === cur.id);
        if (updated) setSelectedChat(updated);
      }
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEmails = useCallback(async () => {
    const res = await fetch("/api/admin/emails", { headers: { "x-admin-key": token } });
    if (res.status === 401) { handleUnauthorized(); return; }
    if (res.ok) {
      const list: Email[] = await res.json();
      setEmails(list);
      setUnreadMails(list.filter((e) => !e.seen).length);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadFeedback = useCallback(async () => {
    const res = await fetch("/api/admin/feedback", { headers: { "x-admin-key": token } });
    if (res.status === 401) { handleUnauthorized(); return; }
    if (res.ok) setFeedback(await res.json());
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { void loadChats(); void loadEmails(); void loadFeedback(); }, [loadChats, loadEmails, loadFeedback]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selectedChat?.messages?.length]);

  // SSE for real-time events
  useEffect(() => {
    const ctrl = new AbortController();
    sseAbortRef.current = ctrl;

    (async () => {
      try {
        const res = await fetch("/api/admin/events", { headers: { "x-admin-key": token }, signal: ctrl.signal });
        if (res.status === 401) { handleUnauthorized(); return; }
        if (!res.ok || !res.body) return;
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n"); buf = lines.pop() ?? "";
          for (const ln of lines) {
            if (!ln.startsWith("data: ")) continue;
            try {
              const evt = JSON.parse(ln.slice(6)) as {
                type: string;
                sessionId?: string;
                messageId?: string;
                content?: string;
                role?: string;
                ts?: number;
                typing?: boolean;
              };

              if (evt.type === "new_chat_session") {
                void loadChats();
                if (evt.sessionId) setUnreadChats((prev) => new Set([...prev, evt.sessionId!]));
                playChatSound();
              } else if (evt.type === "new_chat_message") {
                // Patch selectedChat directly if it matches, else reload
                if (evt.sessionId && selectedChatRef.current?.id === evt.sessionId) {
                  const newMsg: ChatMsg = {
                    id: evt.messageId ?? String(Date.now()),
                    role: (evt.role ?? "user") as ChatMsg["role"],
                    content: evt.content ?? "",
                    ts: evt.ts ?? Date.now(),
                  };
                  setSelectedChat((prev) => prev ? { ...prev, messages: [...prev.messages, newMsg], updatedAt: evt.ts ?? Date.now() } : null);
                }
                void loadChats();
                if (evt.sessionId) setUnreadChats((prev) => new Set([...prev, evt.sessionId!]));
                playMsgSound();
              } else if (evt.type === "customer_typing") {
                if (evt.sessionId) {
                  setCustomerTyping((prev) => ({ ...prev, [evt.sessionId!]: !!evt.typing }));
                }
              } else if (evt.type === "chat_claimed" || evt.type === "chat_closed") {
                if (evt.sessionId && selectedChatRef.current?.id === evt.sessionId) {
                  setSelectedChat((prev) => prev ? {
                    ...prev,
                    status: evt.type === "chat_claimed" ? "claimed" : "closed",
                  } : null);
                }
                void loadChats();
              } else if (evt.type === "new_email") {
                void loadEmails();
                setUnreadMails((n) => n + 1);
                playMsgSound();
              }
            } catch {}
          }
        }
      } catch {}
    })();

    return () => ctrl.abort();
  }, [token, loadChats, loadEmails]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Agent typing → publish to customer ── */
  const sendAgentTyping = (typing: boolean) => {
    if (!selectedChatRef.current) return;
    if (agentTypingRef.current === typing) return;
    agentTypingRef.current = typing;
    fetch("/api/admin/typing", {
      method: "POST",
      headers,
      body: JSON.stringify({ sessionId: selectedChatRef.current.id, typing }),
    }).catch(() => {});
  };

  const stopAgentTyping = () => {
    if (agentTypingTimerRef.current) clearTimeout(agentTypingTimerRef.current);
    sendAgentTyping(false);
  };

  // Stop agent typing when switching chats
  useEffect(() => {
    stopAgentTyping();
    agentTypingRef.current = false;
    setReplyText("");
    setSlashOpen(false);
  }, [selectedChat?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Slash command handler ── */
  const handleReplyChange = (val: string) => {
    setReplyText(val);
    if (val.startsWith("/")) {
      const matches = SLASH_COMMANDS.filter((c) => c.cmd.startsWith(val.toLowerCase()));
      setSlashMatches(matches.length ? matches : SLASH_COMMANDS);
      setSlashOpen(true);
      setSlashIdx(0);
      sendAgentTyping(false);
    } else {
      setSlashOpen(false);
      sendAgentTyping(true);
      if (agentTypingTimerRef.current) clearTimeout(agentTypingTimerRef.current);
      agentTypingTimerRef.current = setTimeout(() => sendAgentTyping(false), 2000);
    }
  };

  const executeSlashCommand = async (cmd: string) => {
    setReplyText("");
    setSlashOpen(false);
    sendAgentTyping(false);
    const sid = selectedChat?.id;
    if (!sid) return;

    switch (cmd) {
      case "/hej": {
        await fetch("/api/admin/chats/claim", { method: "POST", headers, body: JSON.stringify({ sessionId: sid }) }).catch(() => {});
        const msg = "Hej! Tak fordi du kontaktede Duckert Design. Jeg har overtaget din henvendelse og hjælper dig nu. ✨";
        await fetch("/api/admin/chats/reply", { method: "POST", headers, body: JSON.stringify({ sessionId: sid, content: msg }) }).catch(() => {});
        void loadChats();
        break;
      }
      case "/farvel": {
        const msg = "Tak fordi du kontaktede Duckert Design! Har du flere spørgsmål, er du altid velkommen til at skrive igen. God dag! 👋";
        await fetch("/api/admin/chats/close", { method: "POST", headers, body: JSON.stringify({ sessionId: sid, sendMessage: msg }) }).catch(() => {});
        if (inactiveTimerRef.current) { clearTimeout(inactiveTimerRef.current); inactiveTimerRef.current = null; }
        void loadChats();
        break;
      }
      case "/luk": {
        await fetch("/api/admin/chats/close", { method: "POST", headers, body: JSON.stringify({ sessionId: sid }) }).catch(() => {});
        if (inactiveTimerRef.current) { clearTimeout(inactiveTimerRef.current); inactiveTimerRef.current = null; }
        void loadChats();
        break;
      }
      case "/inaktiv": {
        const msg = "Hej! Vi har ikke hørt fra dig i et stykke tid. Skriv venligst inden for 2 minutter, ellers lukker vi chatten automatisk.";
        await fetch("/api/admin/chats/reply", { method: "POST", headers, body: JSON.stringify({ sessionId: sid, content: msg }) }).catch(() => {});
        if (inactiveTimerRef.current) clearTimeout(inactiveTimerRef.current);
        inactiveTimerRef.current = setTimeout(async () => {
          const farewell = "Vi lukkede chatten grundet inaktivitet. Du er altid velkommen til at skrive igen! 👋";
          await fetch("/api/admin/chats/close", { method: "POST", headers: { "x-admin-key": token, "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: sid, sendMessage: farewell }) }).catch(() => {});
          void loadChats();
        }, 2 * 60 * 1000);
        void loadChats();
        showNotif("Inaktivitetstimer startet (2 min)");
        break;
      }
      case "/tilbud": {
        const msg = "Super! For at vi kan sende dig et skræddersyet tilbud, vil jeg gerne høre lidt mere. Hvad har du brug for — landing page, webshop eller noget helt tredje? Og hvad er din omtrentlige tidsramme? 😊";
        await fetch("/api/admin/chats/reply", { method: "POST", headers, body: JSON.stringify({ sessionId: sid, content: msg }) }).catch(() => {});
        void loadChats();
        break;
      }
      case "/møde": {
        const msg = "Vi holder meget gerne et kort indledende opkald for at høre mere om dit projekt! 📅 Skriv til hej@duckert.design med et par tidspunkter der passer dig, så finder vi en tid.";
        await fetch("/api/admin/chats/reply", { method: "POST", headers, body: JSON.stringify({ sessionId: sid, content: msg }) }).catch(() => {});
        void loadChats();
        break;
      }
      case "/pris": {
        const msg = "Her er en hurtig prisoversigt 👇\n\n• Landing page: fra 5.000 kr.\n• Business-site (flere sider): fra 10.000 kr.\n• Webshop: fra 15.000 kr.\n\nPriserne afhænger altid af dit konkrete projekt. Vi giver altid et gratis, uforpligtende tilbud — ønsker du det?";
        await fetch("/api/admin/chats/reply", { method: "POST", headers, body: JSON.stringify({ sessionId: sid, content: msg }) }).catch(() => {});
        void loadChats();
        break;
      }
      case "/webshop": {
        const msg = "Ja, vi laver skræddersyede webshops! 🛒 Vi bygger typisk med Next.js kombineret med Shopify Headless eller Stripe til betalingshåndtering. Hvad slags produkter sælger du, og har du et omtrentligt antal?";
        await fetch("/api/admin/chats/reply", { method: "POST", headers, body: JSON.stringify({ sessionId: sid, content: msg }) }).catch(() => {});
        void loadChats();
        break;
      }
      case "/tid": {
        const msg = "Leveringstiden afhænger af projektets omfang ⏱️\n\n• Landing page: 1–2 uger\n• Business-site: 3–5 uger\n• Webshop: 4–8 uger\n\nHar du en bestemt deadline vi skal ramme?";
        await fetch("/api/admin/chats/reply", { method: "POST", headers, body: JSON.stringify({ sessionId: sid, content: msg }) }).catch(() => {});
        void loadChats();
        break;
      }
      case "/reference": {
        const msg = "Du kan se eksempler på vores tidligere arbejde på duckert.design 🎨 Er der et bestemt udtryk eller en branche du søger inspiration fra?";
        await fetch("/api/admin/chats/reply", { method: "POST", headers, body: JSON.stringify({ sessionId: sid, content: msg }) }).catch(() => {});
        void loadChats();
        break;
      }
      case "/mail": {
        const msg = "For at vi kan følge op med mere information, hvad er din e-mailadresse? Vi sender dig gerne en oversigt direkte i indbakken 📧";
        await fetch("/api/admin/chats/reply", { method: "POST", headers, body: JSON.stringify({ sessionId: sid, content: msg }) }).catch(() => {});
        void loadChats();
        break;
      }
      case "/kontakt": {
        const msg = "Du er altid velkommen til at kontakte os direkte 📬\n\n✉️ hej@duckert.design\n🌐 duckert.design\n\nVi svarer inden for 1–2 hverdage.";
        await fetch("/api/admin/chats/reply", { method: "POST", headers, body: JSON.stringify({ sessionId: sid, content: msg }) }).catch(() => {});
        void loadChats();
        break;
      }
      case "/venlist": {
        const msg = "Tak for din tålmodighed! Jeg kigger på det nu og vender tilbage til dig hurtigst muligt 🙏";
        await fetch("/api/admin/chats/reply", { method: "POST", headers, body: JSON.stringify({ sessionId: sid, content: msg }) }).catch(() => {});
        void loadChats();
        break;
      }
      case "/overlevering": {
        const msg = "For at komme godt i gang har vi brug for følgende fra dig 📋\n\n• Logo (helst i SVG eller PNG)\n• Tekst/indhold til siderne\n• Billeder du ønsker brugt\n• Ønsket farver/udtryk\n\nHar du dette klar, eller hjælper vi med noget af det?";
        await fetch("/api/admin/chats/reply", { method: "POST", headers, body: JSON.stringify({ sessionId: sid, content: msg }) }).catch(() => {});
        void loadChats();
        break;
      }
      case "/hjælp":
        showNotif("/hej /farvel /luk /inaktiv /tilbud /møde /pris /webshop /tid /reference /mail /kontakt /venlist /overlevering");
        break;
    }
  };

  const handleReplyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashOpen) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSlashIdx((i) => Math.min(i + 1, slashMatches.length - 1)); return; }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSlashIdx((i) => Math.max(i - 1, 0)); return; }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        void executeSlashCommand(slashMatches[slashIdx]?.cmd ?? "");
        return;
      }
      if (e.key === "Escape") { setSlashOpen(false); return; }
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void sendChatReply();
  };

  /* ── Chat actions ── */
  const selectChat = (session: ChatSession) => {
    setSelectedChat(session);
    setSelectedEmail(null);
    setUnreadChats((prev) => { const next = new Set(prev); next.delete(session.id); return next; });
    if (inactiveTimerRef.current) { clearTimeout(inactiveTimerRef.current); inactiveTimerRef.current = null; }
  };

  const selectEmail = async (email: Email) => {
    setSelectedChat(null);
    setSelectedEmail(null);
    setLoadingEmail(true);
    try {
      const res = await fetch(`/api/admin/emails/${email.uid}`, { headers: { "x-admin-key": token } });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (res.ok) setSelectedEmail(await res.json());
    } finally { setLoadingEmail(false); }
  };

  const sendChatReply = async () => {
    if (!selectedChat || !replyText.trim() || sending) return;
    stopAgentTyping();
    setSending(true);
    try {
      const res = await fetch("/api/admin/chats/reply", {
        method: "POST", headers,
        body: JSON.stringify({ sessionId: selectedChat.id, content: replyText.trim() }),
      });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (res.ok) { setReplyText(""); showNotif("Svar sendt!"); void loadChats(); }
      else showNotif("Fejl ved afsendelse");
    } finally { setSending(false); }
  };

  const sendEmailReply = async () => {
    if (!selectedEmail || !replyText.trim() || sending) return;
    setSending(true);
    const fromAddr = selectedEmail.from.match(/<([^>]+)>/)?.[1] ?? selectedEmail.from;
    try {
      const res = await fetch("/api/admin/emails/reply", {
        method: "POST", headers,
        body: JSON.stringify({
          to: fromAddr,
          subject: selectedEmail.subject.startsWith("Re:") ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
          body: replyText.trim(),
        }),
      });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (res.ok) { setReplyText(""); showNotif("Mail sendt!"); }
      else showNotif("Fejl ved afsendelse");
    } finally { setSending(false); }
  };

  const claimChat = async () => {
    if (!selectedChat) return;
    const res = await fetch("/api/admin/chats/claim", { method: "POST", headers, body: JSON.stringify({ sessionId: selectedChat.id }) });
    if (res.status === 401) { handleUnauthorized(); return; }
    if (res.ok) { showNotif("Chat overtaget!"); void loadChats(); }
  };

  const closeChat = async () => {
    if (!selectedChat) return;
    const res = await fetch("/api/admin/chats/close", { method: "POST", headers, body: JSON.stringify({ sessionId: selectedChat.id }) });
    if (res.status === 401) { handleUnauthorized(); return; }
    if (res.ok) {
      if (inactiveTimerRef.current) { clearTimeout(inactiveTimerRef.current); inactiveTimerRef.current = null; }
      showNotif("Chat lukket.");
      void loadChats();
    }
  };

  const SIDEBAR_W = 280;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Montserrat, sans-serif" }}>
      <style>{`@keyframes dkToast{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>

      {/* ── Header ── */}
      <div style={{
        height: "56px", background: "#1647FB", display: "flex", alignItems: "center",
        padding: "0 20px", gap: "12px", flexShrink: 0,
        boxShadow: "0 2px 16px rgba(22,71,251,0.3)",
      }}>
        <Sparkle size={20} color="white" />
        <span style={{ fontSize: "15px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", flex: 1 }}>
          Duckert Admin
        </span>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", letterSpacing: "0.08em" }}>
          mit.duckert.design
        </span>
        <button onClick={onLogout}
          style={{
            background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px",
            padding: "6px 14px", fontSize: "12px", color: "#fff", cursor: "pointer",
            fontFamily: "Montserrat, sans-serif", fontWeight: 600, transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}>
          Log ud
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <div style={{
          width: `${SIDEBAR_W}px`, flexShrink: 0, background: "#fff",
          borderRight: "1px solid rgba(22,71,251,0.1)", display: "flex", flexDirection: "column",
        }}>
          <div style={{ display: "flex", borderBottom: "1px solid rgba(22,71,251,0.1)", padding: "8px 8px 0" }}>
            {([["chats", "Live Chat"], ["mails", "Mails"], ["feedback", "Feedback"]] as [Tab, string][]).map(([t, label]) => (
              <button key={t} onClick={() => { setTab(t); if (t === "feedback") void loadFeedback(); }}
                style={{
                  flex: 1, padding: "10px 4px", border: "none", cursor: "pointer",
                  background: "transparent", fontFamily: "Montserrat, sans-serif",
                  fontSize: "11px", fontWeight: 700,
                  color: tab === t ? "#1647FB" : "rgba(8,8,8,0.45)",
                  borderBottom: `2px solid ${tab === t ? "#1647FB" : "transparent"}`,
                  transition: "color 0.15s, border-color 0.15s", position: "relative",
                }}>
                {label}
                {t === "chats" && unreadChats.size > 0 && (
                  <span style={{ position: "absolute", top: "6px", right: "4px", background: "#1647FB", color: "#fff", borderRadius: "999px", fontSize: "9px", fontWeight: 800, padding: "1px 5px", lineHeight: "14px" }}>{unreadChats.size}</span>
                )}
                {t === "mails" && unreadMails > 0 && (
                  <span style={{ position: "absolute", top: "6px", right: "4px", background: "#ef4444", color: "#fff", borderRadius: "999px", fontSize: "9px", fontWeight: 800, padding: "1px 5px", lineHeight: "14px" }}>{unreadMails}</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {tab === "chats" && (
              chats.length === 0
                ? <p style={{ padding: "24px 16px", fontSize: "13px", color: "rgba(8,8,8,0.4)", textAlign: "center" }}>Ingen chats endnu</p>
                : chats.map((s) => {
                    const last = s.messages.filter((m) => m.role !== "system").at(-1);
                    const isSelected = selectedChat?.id === s.id;
                    const hasUnread = unreadChats.has(s.id);
                    const dotColor = s.status === "claimed" ? "#ea580c" : s.status === "closed" ? "#d1d5db" : s.status === "human" ? "#1647FB" : "#4ade80";
                    return (
                      <div key={s.id} onClick={() => selectChat(s)}
                        style={{
                          padding: "12px 16px", cursor: "pointer",
                          background: isSelected ? "rgba(22,71,251,0.06)" : "transparent",
                          borderLeft: `3px solid ${isSelected ? "#1647FB" : "transparent"}`,
                          borderBottom: "1px solid rgba(22,71,251,0.06)", transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "rgba(22,71,251,0.03)"; }}
                        onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                          <span style={{ fontSize: "12px", fontWeight: hasUnread ? 800 : 600, color: "#080808", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {s.status === "claimed" ? "Under behandling" : s.status === "closed" ? "Lukket" : s.status === "human" ? "Live chat" : "AI chat"}
                          </span>
                          <span style={{ fontSize: "10px", color: "rgba(8,8,8,0.4)", flexShrink: 0 }}>{fmtTime(s.updatedAt)}</span>
                          {hasUnread && <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#1647FB", flexShrink: 0 }} />}
                        </div>
                        <p style={{ fontSize: "11px", color: "rgba(8,8,8,0.5)", margin: "0 0 0 16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {last?.content?.slice(0, 50) ?? "Ingen beskeder"}
                        </p>
                      </div>
                    );
                  })
            )}

            {tab === "mails" && (
              emails.length === 0
                ? <p style={{ padding: "24px 16px", fontSize: "13px", color: "rgba(8,8,8,0.4)", textAlign: "center" }}>Ingen mails</p>
                : emails.map((e) => {
                    const isSelected = selectedEmail?.uid === e.uid;
                    return (
                      <div key={e.uid} onClick={() => void selectEmail(e)}
                        style={{
                          padding: "14px 16px", cursor: "pointer",
                          background: isSelected ? "rgba(22,71,251,0.06)" : "transparent",
                          borderLeft: `3px solid ${isSelected ? "#1647FB" : "transparent"}`,
                          borderBottom: "1px solid rgba(22,71,251,0.06)", transition: "background 0.15s",
                        }}
                        onMouseEnter={(ev) => { if (!isSelected) (ev.currentTarget as HTMLDivElement).style.background = "rgba(22,71,251,0.03)"; }}
                        onMouseLeave={(ev) => { if (!isSelected) (ev.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <div style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            background: e.seen ? "#e5e7eb" : "#1647FB",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            fontSize: "10px", fontWeight: 800, color: e.seen ? "#6b7280" : "#fff",
                          }}>
                            {initials(e.from)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "11px", fontWeight: e.seen ? 500 : 800, color: "#080808", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "150px" }}>
                                {e.from.replace(/<[^>]+>/, "").trim() || e.from}
                              </span>
                              <span style={{ fontSize: "10px", color: "rgba(8,8,8,0.4)", flexShrink: 0 }}>{fmtTime(e.date)}</span>
                            </div>
                            <p style={{ fontSize: "11px", color: "rgba(8,8,8,0.55)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.subject}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
            )}

            {tab === "feedback" && (
              feedback.length === 0
                ? <p style={{ padding: "24px 16px", fontSize: "13px", color: "rgba(8,8,8,0.4)", textAlign: "center" }}>Ingen feedback endnu</p>
                : feedback.map((f) => (
                    <div key={f.id} style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid rgba(22,71,251,0.06)",
                      display: "flex", alignItems: "center", gap: "12px",
                    }}>
                      <span style={{ fontSize: "22px", lineHeight: 1 }}>{FEEDBACK_EMOJIS[(f.rating - 1)] ?? "😐"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#080808" }}>
                          {FEEDBACK_LABELS[(f.rating - 1)] ?? "Okay"}
                        </div>
                        <div style={{ fontSize: "10px", color: "rgba(8,8,8,0.4)" }}>
                          {f.sessionId.slice(0, 8)}… · {fmtTime(f.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
            )}
          </div>

          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(22,71,251,0.08)" }}>
            <button onClick={() => { void loadChats(); void loadEmails(); void loadFeedback(); }}
              style={{
                width: "100%", padding: "8px", background: "rgba(22,71,251,0.06)",
                border: "none", borderRadius: "8px", fontSize: "12px",
                fontFamily: "Montserrat, sans-serif", fontWeight: 600, color: "#1647FB",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(22,71,251,0.12)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(22,71,251,0.06)")}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="#1647FB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Opdater
            </button>
          </div>
        </div>

        {/* ── Main panel ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {!selectedChat && !selectedEmail && !loadingEmail && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", color: "rgba(8,8,8,0.35)" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "rgba(22,71,251,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkle size={28} color="rgba(22,71,251,0.4)" />
              </div>
              <p style={{ fontSize: "14px", fontWeight: 600, fontFamily: "Montserrat, sans-serif", margin: 0 }}>
                Vælg en chat eller mail for at se detaljer
              </p>
            </div>
          )}

          {loadingEmail && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Spinner />
            </div>
          )}

          {selectedChat && (
            <>
              {/* Chat header */}
              <div style={{
                padding: "14px 20px", background: "#fff",
                borderBottom: "1px solid rgba(22,71,251,0.08)",
                display: "flex", alignItems: "center", gap: "10px", flexShrink: 0,
              }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#080808", fontFamily: "Montserrat, sans-serif" }}>
                    {selectedChat.messages.length} beskeder · oprettet {fmtTime(selectedChat.createdAt)}
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(8,8,8,0.4)", fontFamily: "Montserrat, sans-serif" }}>
                    {selectedChat.id.slice(0, 12)}…
                  </div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                  <StatusBadge status={selectedChat.status} />
                  {selectedChat.status !== "claimed" && selectedChat.status !== "closed" && (
                    <button onClick={() => void claimChat()}
                      style={{
                        background: "rgba(249,115,22,0.1)", border: "none", borderRadius: "8px",
                        padding: "5px 12px", fontSize: "11px", fontFamily: "Montserrat, sans-serif",
                        fontWeight: 700, color: "#ea580c", cursor: "pointer", transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(249,115,22,0.18)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(249,115,22,0.1)")}>
                      Overtag
                    </button>
                  )}
                  {selectedChat.status !== "closed" && (
                    <button onClick={() => void closeChat()}
                      style={{
                        background: "rgba(239,68,68,0.08)", border: "none", borderRadius: "8px",
                        padding: "5px 12px", fontSize: "11px", fontFamily: "Montserrat, sans-serif",
                        fontWeight: 700, color: "#ef4444", cursor: "pointer", transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}>
                      Luk chat
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "10px", background: "#f9f9fb" }}>
                {selectedChat.messages.filter((m) => m.content).map((msg) => {
                  // System message — centered badge
                  if (msg.role === "system") {
                    return (
                      <div key={msg.id} style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
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
                  const isUser  = msg.role === "user";
                  const align   = isUser ? "flex-end" : "flex-start";
                  const label   = isUser ? "Bruger" : msg.role === "admin" ? "Du (admin)" : "AI";
                  return (
                    <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: align, gap: "3px" }}>
                      <div style={{ fontSize: "10px", color: "rgba(8,8,8,0.4)", fontFamily: "Montserrat, sans-serif", fontWeight: 600 }}>
                        {label} · {fmtTime(msg.ts)}
                      </div>
                      <div style={{
                        maxWidth: "75%", background: "#f2f2f2", color: "#080808",
                        padding: "10px 14px", borderRadius: "12px",
                        fontSize: "13px", lineHeight: 1.6, fontFamily: "Montserrat, sans-serif",
                        whiteSpace: "pre-wrap", wordBreak: "break-word",
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}

                {/* Customer typing */}
                {customerTyping[selectedChat.id] && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "3px" }}>
                    <div style={{ fontSize: "10px", color: "rgba(8,8,8,0.4)", fontFamily: "Montserrat, sans-serif", fontWeight: 600 }}>
                      Bruger skriver…
                    </div>
                    <div style={{ background: "#f2f2f2", padding: "10px 14px", borderRadius: "12px" }}>
                      <BouncingDots />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Reply area */}
              <div style={{ padding: "14px 20px", background: "#fff", borderTop: "1px solid rgba(22,71,251,0.08)", flexShrink: 0, position: "relative" }}>
                {/* Slash command picker */}
                {slashOpen && slashMatches.length > 0 && (
                  <div style={{
                    position: "absolute", bottom: "100%", left: "20px", right: "20px",
                    background: "#fff", borderRadius: "12px",
                    boxShadow: "0 -4px 24px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(22,71,251,0.12)",
                    overflow: "hidden", marginBottom: "4px", zIndex: 10,
                  }}>
                    {slashMatches.map((sc, i) => (
                      <button
                        key={sc.cmd}
                        onClick={() => void executeSlashCommand(sc.cmd)}
                        style={{
                          display: "flex", alignItems: "center", gap: "12px",
                          width: "100%", padding: "10px 14px", border: "none", cursor: "pointer",
                          background: i === slashIdx ? "rgba(22,71,251,0.06)" : "transparent",
                          textAlign: "left", transition: "background 0.1s",
                        }}
                        onMouseEnter={() => setSlashIdx(i)}
                      >
                        <code style={{ fontSize: "12px", fontWeight: 700, color: "#1647FB", fontFamily: "monospace", minWidth: "70px" }}>
                          {sc.cmd}
                        </code>
                        <span style={{ fontSize: "12px", color: "rgba(8,8,8,0.55)", fontFamily: "Montserrat, sans-serif" }}>
                          {sc.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedChat.status === "closed" ? (
                  <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(8,8,8,0.4)", fontFamily: "Montserrat, sans-serif", margin: 0 }}>
                    Chatten er lukket
                  </p>
                ) : (
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                    <textarea
                      value={replyText}
                      onChange={(e) => handleReplyChange(e.target.value)}
                      onKeyDown={handleReplyKeyDown}
                      onBlur={() => sendAgentTyping(false)}
                      placeholder="Svar til brugeren… (⌘↵ sender, / for kommandoer)"
                      rows={3}
                      style={{
                        flex: 1, padding: "12px 14px", border: "1.5px solid rgba(22,71,251,0.18)",
                        borderRadius: "12px", fontSize: "13px", fontFamily: "Montserrat, sans-serif",
                        color: "#080808", resize: "none", outline: "none", transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1647FB")}
                    />
                    <button onClick={() => void sendChatReply()} disabled={!replyText.trim() || sending}
                      style={{
                        background: replyText.trim() && !sending ? "#1647FB" : "rgba(22,71,251,0.2)",
                        border: "none", borderRadius: "12px", padding: "12px 20px",
                        fontSize: "13px", fontFamily: "Montserrat, sans-serif", fontWeight: 700,
                        color: replyText.trim() && !sending ? "#fff" : "rgba(22,71,251,0.5)",
                        cursor: replyText.trim() && !sending ? "pointer" : "default",
                        transition: "background 0.2s, color 0.2s", flexShrink: 0, height: "fit-content",
                      }}>
                      {sending ? "Sender…" : "Send"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {selectedEmail && !loadingEmail && (
            <>
              <div style={{ padding: "16px 24px", background: "#fff", borderBottom: "1px solid rgba(22,71,251,0.08)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1647FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                    {initials(selectedEmail.from)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#080808", margin: "0 0 4px", fontFamily: "Montserrat, sans-serif", letterSpacing: "-0.01em" }}>
                      {selectedEmail.subject}
                    </h2>
                    <p style={{ fontSize: "12px", color: "rgba(8,8,8,0.55)", margin: 0, fontFamily: "Montserrat, sans-serif" }}>
                      Fra: <strong>{selectedEmail.from}</strong> · {fmtTime(selectedEmail.date)}
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#f9f9fb" }}>
                <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)", fontSize: "14px", lineHeight: 1.75, color: "#222", fontFamily: "Montserrat, sans-serif", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {selectedEmail.text ?? "(Ingen tekstindhold)"}
                </div>
              </div>
              <div style={{ padding: "16px 24px", background: "#fff", borderTop: "1px solid rgba(22,71,251,0.08)", flexShrink: 0 }}>
                <p style={{ fontSize: "11px", color: "rgba(8,8,8,0.45)", margin: "0 0 8px", fontFamily: "Montserrat, sans-serif" }}>
                  Svar til: <strong>{selectedEmail.from}</strong>
                </p>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void sendEmailReply(); }}
                    placeholder="Skriv dit svar… (⌘↵ sender)"
                    rows={4}
                    style={{ flex: 1, padding: "12px 14px", border: "1.5px solid rgba(22,71,251,0.18)", borderRadius: "12px", fontSize: "13px", fontFamily: "Montserrat, sans-serif", color: "#080808", resize: "none", outline: "none", transition: "border-color 0.2s" }}
                    onFocus={(e) => (e.target.style.borderColor = "#1647FB")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(22,71,251,0.18)")}
                  />
                  <button onClick={() => void sendEmailReply()} disabled={!replyText.trim() || sending}
                    style={{ background: replyText.trim() && !sending ? "#1647FB" : "rgba(22,71,251,0.2)", border: "none", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontFamily: "Montserrat, sans-serif", fontWeight: 700, color: replyText.trim() && !sending ? "#fff" : "rgba(22,71,251,0.5)", cursor: replyText.trim() && !sending ? "pointer" : "default", transition: "background 0.2s, color 0.2s", flexShrink: 0, height: "fit-content" }}>
                    {sending ? "Sender…" : "Send mail"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {notification && (
        <div style={{
          position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
          background: "#080808", color: "#fff", padding: "10px 20px", borderRadius: "999px",
          fontSize: "13px", fontFamily: "Montserrat, sans-serif", fontWeight: 600,
          zIndex: 9999, animation: "dkToast 0.25s ease both",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        }}>
          {notification}
        </div>
      )}
    </div>
  );
}

/* ─── Root ────────────────────────────────────────────────────────────────── */
export default function MitPage() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("duckert-admin-token");
  });

  const handleLogin = (t: string) => {
    try { sessionStorage.setItem("duckert-admin-token", t); } catch {}
    setToken(t);
  };

  const handleLogout = () => {
    try { sessionStorage.removeItem("duckert-admin-token"); } catch {}
    setToken(null);
  };

  if (!token) return <LoginScreen onLogin={handleLogin} />;
  return <AdminApp token={token} onLogout={handleLogout} />;
}
