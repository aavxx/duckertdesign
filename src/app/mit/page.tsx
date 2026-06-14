"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ─── Types ───────────────────────────────────────────────── */
type ChatMsg = { id: string; role: "user" | "assistant" | "admin"; content: string; ts: number };
type ChatSession = { id: string; createdAt: number; updatedAt: number; status: string; messages: ChatMsg[] };
type Email = { uid: number; subject: string; from: string; date: string | null; seen: boolean };
type EmailBody = Email & { text: string | null; html: string | null; to: string | null };
type Tab = "chats" | "mails";

/* ─── Helpers ─────────────────────────────────────────────── */
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

/* ─── Sparkle icon ────────────────────────────────────────── */
function Sparkle({ size = 14, color = "#1647FB" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M13 1 L15.2 7.8 L22 10 L15.2 12.2 L13 19 L10.8 12.2 L4 10 L10.8 7.8 Z" fill={color} />
      <path d="M24 5 L25 8.5 L28.5 9.5 L25 10.5 L24 14 L23 10.5 L19.5 9.5 L23 8.5 Z" fill={color} opacity="0.55" />
      <circle cx="26" cy="20" r="1.8" fill={color} opacity="0.35" />
    </svg>
  );
}

/* ─── Login screen ────────────────────────────────────────── */
function LoginScreen({ onLogin }: { onLogin: (key: string) => void }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);

  const attempt = async () => {
    const res = await fetch("/api/admin/chats", { headers: { "x-admin-key": val } });
    if (res.ok) { onLogin(val); }
    else { setErr(true); setTimeout(() => setErr(false), 2000); }
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100%", padding: "24px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "48px 40px",
        boxShadow: "0 8px 48px rgba(22,71,251,0.1)", width: "100%", maxWidth: "380px",
        textAlign: "center",
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "16px", background: "#1647FB",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
        }}>
          <Sparkle size={28} color="white" />
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#080808", margin: "0 0 6px", letterSpacing: "-0.03em", fontFamily: "Montserrat, sans-serif" }}>
          Duckert Admin
        </h1>
        <p style={{ fontSize: "13px", color: "rgba(8,8,8,0.45)", margin: "0 0 32px", fontFamily: "Montserrat, sans-serif" }}>
          Indtast din admin-nøgle for at fortsætte
        </p>
        <input
          type="password"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void attempt()}
          placeholder="Admin-nøgle"
          style={{
            width: "100%", padding: "12px 16px", border: `1.5px solid ${err ? "#ef4444" : "rgba(22,71,251,0.2)"}`,
            borderRadius: "10px", fontSize: "14px", fontFamily: "Montserrat, sans-serif",
            color: "#080808", outline: "none", background: "#fff",
            boxSizing: "border-box", marginBottom: "12px",
            transition: "border-color 0.2s",
          }}
        />
        {err && (
          <p style={{ fontSize: "12px", color: "#ef4444", margin: "0 0 12px", fontFamily: "Montserrat, sans-serif" }}>
            Forkert nøgle. Prøv igen.
          </p>
        )}
        <button onClick={() => void attempt()}
          style={{
            width: "100%", padding: "12px", background: "#1647FB", color: "#fff",
            border: "none", borderRadius: "10px", fontSize: "14px",
            fontFamily: "Montserrat, sans-serif", fontWeight: 700, cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Log ind
        </button>
      </div>
    </div>
  );
}

/* ─── Main admin app ──────────────────────────────────────── */
function AdminApp({ adminKey, onLogout }: { adminKey: string; onLogout: () => void }) {
  const [tab, setTab]                       = useState<Tab>("chats");
  const [chats, setChats]                   = useState<ChatSession[]>([]);
  const [emails, setEmails]                 = useState<Email[]>([]);
  const [selectedChat, setSelectedChat]     = useState<ChatSession | null>(null);
  const [selectedEmail, setSelectedEmail]   = useState<EmailBody | null>(null);
  const [loadingEmail, setLoadingEmail]     = useState(false);
  const [replyText, setReplyText]           = useState("");
  const [sending, setSending]               = useState(false);
  const [notification, setNotification]     = useState<string | null>(null);
  const [unreadChats, setUnreadChats]       = useState<Set<string>>(new Set());
  const [unreadMails, setUnreadMails]       = useState(0);
  const messagesEndRef                       = useRef<HTMLDivElement>(null);
  const sseAbortRef                          = useRef<AbortController | null>(null);
  const headers                              = { "x-admin-key": adminKey, "Content-Type": "application/json" };

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const loadChats = useCallback(async () => {
    const res = await fetch("/api/admin/chats", { headers: { "x-admin-key": adminKey } });
    if (res.ok) setChats(await res.json());
  }, [adminKey]);

  const loadEmails = useCallback(async () => {
    const res = await fetch("/api/admin/emails", { headers: { "x-admin-key": adminKey } });
    if (res.ok) {
      const list: Email[] = await res.json();
      setEmails(list);
      setUnreadMails(list.filter((e) => !e.seen).length);
    }
  }, [adminKey]);

  // Initial load
  useEffect(() => { void loadChats(); void loadEmails(); }, [loadChats, loadEmails]);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages?.length]);

  // SSE for real-time events
  useEffect(() => {
    const ctrl = new AbortController();
    sseAbortRef.current = ctrl;

    (async () => {
      try {
        const res = await fetch("/api/admin/events", {
          headers: { "x-admin-key": adminKey },
          signal: ctrl.signal,
        });
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
              const evt = JSON.parse(ln.slice(6));
              if (evt.type === "new_chat_session" || evt.type === "new_chat_message") {
                void loadChats();
                if (evt.sessionId) {
                  setUnreadChats((prev) => new Set([...prev, evt.sessionId]));
                }
              }
              if (evt.type === "new_email") {
                void loadEmails();
                setUnreadMails((n) => n + 1);
              }
            } catch {}
          }
        }
      } catch {}
    })();

    return () => ctrl.abort();
  }, [adminKey, loadChats, loadEmails]);

  // Keep selectedChat in sync with chats list
  useEffect(() => {
    if (!selectedChat) return;
    const updated = chats.find((c) => c.id === selectedChat.id);
    if (updated) setSelectedChat(updated);
  }, [chats]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectChat = (session: ChatSession) => {
    setSelectedChat(session);
    setSelectedEmail(null);
    setReplyText("");
    setUnreadChats((prev) => { const next = new Set(prev); next.delete(session.id); return next; });
  };

  const selectEmail = async (email: Email) => {
    setSelectedChat(null);
    setSelectedEmail(null);
    setReplyText("");
    setLoadingEmail(true);
    try {
      const res = await fetch(`/api/admin/emails/${email.uid}`, { headers: { "x-admin-key": adminKey } });
      if (res.ok) setSelectedEmail(await res.json());
    } finally { setLoadingEmail(false); }
  };

  const sendChatReply = async () => {
    if (!selectedChat || !replyText.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/chats/reply", {
        method: "POST",
        headers,
        body: JSON.stringify({ sessionId: selectedChat.id, content: replyText.trim() }),
      });
      if (res.ok) {
        setReplyText("");
        showNotif("Svar sendt!");
        void loadChats();
      } else { showNotif("Fejl ved afsendelse"); }
    } finally { setSending(false); }
  };

  const sendEmailReply = async () => {
    if (!selectedEmail || !replyText.trim() || sending) return;
    setSending(true);
    const fromAddr = selectedEmail.from.match(/<([^>]+)>/)?.[1] ?? selectedEmail.from;
    try {
      const res = await fetch("/api/admin/emails/reply", {
        method: "POST",
        headers,
        body: JSON.stringify({
          to: fromAddr,
          subject: selectedEmail.subject.startsWith("Re:") ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
          body: replyText.trim(),
        }),
      });
      if (res.ok) {
        setReplyText("");
        showNotif("Mail sendt!");
      } else { showNotif("Fejl ved afsendelse"); }
    } finally { setSending(false); }
  };

  const roleColor = (role: string) => {
    if (role === "user") return { bg: "#1647FB", color: "#fff", align: "flex-end" as const };
    if (role === "admin") return { bg: "#e8edff", color: "#1647FB", align: "flex-start" as const };
    return { bg: "#f0f0f0", color: "#333", align: "flex-start" as const };
  };

  const SIDEBAR_W = 280;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Montserrat, sans-serif" }}>

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
            fontFamily: "Montserrat, sans-serif", fontWeight: 600,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
        >
          Log ud
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <div style={{
          width: `${SIDEBAR_W}px`, flexShrink: 0, background: "#fff",
          borderRight: "1px solid rgba(22,71,251,0.1)",
          display: "flex", flexDirection: "column",
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(22,71,251,0.1)", padding: "8px 8px 0" }}>
            {([["chats", "Live Chat"], ["mails", "Mails"]] as [Tab, string][]).map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: "10px 8px", border: "none", cursor: "pointer",
                  background: "transparent", fontFamily: "Montserrat, sans-serif",
                  fontSize: "12px", fontWeight: 700,
                  color: tab === t ? "#1647FB" : "rgba(8,8,8,0.45)",
                  borderBottom: `2px solid ${tab === t ? "#1647FB" : "transparent"}`,
                  transition: "color 0.15s, border-color 0.15s",
                  position: "relative",
                }}>
                {label}
                {t === "chats" && unreadChats.size > 0 && (
                  <span style={{
                    position: "absolute", top: "6px", right: "8px",
                    background: "#1647FB", color: "#fff", borderRadius: "999px",
                    fontSize: "9px", fontWeight: 800, padding: "1px 5px", lineHeight: "14px",
                  }}>{unreadChats.size}</span>
                )}
                {t === "mails" && unreadMails > 0 && (
                  <span style={{
                    position: "absolute", top: "6px", right: "8px",
                    background: "#ef4444", color: "#fff", borderRadius: "999px",
                    fontSize: "9px", fontWeight: 800, padding: "1px 5px", lineHeight: "14px",
                  }}>{unreadMails}</span>
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {tab === "chats" && (
              chats.length === 0
                ? <p style={{ padding: "24px 16px", fontSize: "13px", color: "rgba(8,8,8,0.4)", textAlign: "center" }}>Ingen chats endnu</p>
                : chats.map((s) => {
                    const last = s.messages[s.messages.length - 1];
                    const isSelected = selectedChat?.id === s.id;
                    const hasUnread = unreadChats.has(s.id);
                    return (
                      <div key={s.id} onClick={() => selectChat(s)}
                        style={{
                          padding: "14px 16px", cursor: "pointer",
                          background: isSelected ? "rgba(22,71,251,0.06)" : "transparent",
                          borderLeft: `3px solid ${isSelected ? "#1647FB" : "transparent"}`,
                          borderBottom: "1px solid rgba(22,71,251,0.06)",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "rgba(22,71,251,0.03)"; }}
                        onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <div style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            background: s.status === "human" ? "#1647FB" : "#e5e7eb",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill={s.status === "human" ? "white" : "#9ca3af"} />
                            </svg>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "12px", fontWeight: hasUnread ? 800 : 600, color: "#080808", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" }}>
                                {s.status === "human" ? "Live chat" : "AI chat"}
                              </span>
                              <span style={{ fontSize: "10px", color: "rgba(8,8,8,0.4)", flexShrink: 0 }}>{fmtTime(s.updatedAt)}</span>
                            </div>
                          </div>
                          {hasUnread && <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#1647FB", flexShrink: 0 }} />}
                        </div>
                        <p style={{ fontSize: "11px", color: "rgba(8,8,8,0.5)", margin: "0 0 0 36px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {last?.content?.slice(0, 48) ?? "Ingen beskeder"}
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
                          borderBottom: "1px solid rgba(22,71,251,0.06)",
                          transition: "background 0.15s",
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
                            <p style={{ fontSize: "11px", color: "rgba(8,8,8,0.55)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {e.subject}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
            )}
          </div>

          {/* Refresh button */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(22,71,251,0.08)" }}>
            <button onClick={() => { void loadChats(); void loadEmails(); }}
              style={{
                width: "100%", padding: "8px", background: "rgba(22,71,251,0.06)",
                border: "none", borderRadius: "8px", fontSize: "12px",
                fontFamily: "Montserrat, sans-serif", fontWeight: 600, color: "#1647FB",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(22,71,251,0.12)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(22,71,251,0.06)")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="#1647FB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Opdater
            </button>
          </div>
        </div>

        {/* ── Main panel ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Empty state */}
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

          {/* Loading email body */}
          {loadingEmail && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "24px", height: "24px", border: "2.5px solid rgba(22,71,251,0.2)", borderTopColor: "#1647FB", borderRadius: "50%", animation: "admin-spin 0.8s linear infinite" }} />
              <style>{`@keyframes admin-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* ── Chat detail ── */}
          {selectedChat && (
            <>
              {/* Chat header */}
              <div style={{
                padding: "16px 24px", background: "#fff",
                borderBottom: "1px solid rgba(22,71,251,0.08)",
                display: "flex", alignItems: "center", gap: "12px", flexShrink: 0,
              }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: selectedChat.status === "human" ? "#1647FB" : "#e5e7eb",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill={selectedChat.status === "human" ? "white" : "#9ca3af"} />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#080808", fontFamily: "Montserrat, sans-serif" }}>
                    {selectedChat.status === "human" ? "Live chat" : "AI chat"}
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(8,8,8,0.45)", fontFamily: "Montserrat, sans-serif" }}>
                    {selectedChat.messages.length} beskeder · oprettet {fmtTime(selectedChat.createdAt)}
                  </div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <span style={{
                    background: selectedChat.status === "human" ? "rgba(22,71,251,0.08)" : "rgba(34,197,94,0.1)",
                    color: selectedChat.status === "human" ? "#1647FB" : "#16a34a",
                    borderRadius: "999px", padding: "4px 12px",
                    fontSize: "11px", fontWeight: 700, fontFamily: "Montserrat, sans-serif",
                  }}>
                    {selectedChat.status === "human" ? "Menneskelig" : "AI"}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px", background: "#f9f9fb" }}>
                {selectedChat.messages.filter((m) => m.content).map((msg) => {
                  const { bg, color, align } = roleColor(msg.role);
                  return (
                    <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: align, gap: "3px" }}>
                      <div style={{ fontSize: "10px", color: "rgba(8,8,8,0.4)", fontFamily: "Montserrat, sans-serif", fontWeight: 600 }}>
                        {msg.role === "user" ? "Bruger" : msg.role === "admin" ? "Du (admin)" : "AI"} · {fmtTime(msg.ts)}
                      </div>
                      <div style={{
                        maxWidth: "75%", background: bg, color,
                        padding: "10px 14px", borderRadius: "12px",
                        fontSize: "13px", lineHeight: 1.6, fontFamily: "Montserrat, sans-serif",
                        whiteSpace: "pre-wrap", wordBreak: "break-word",
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply */}
              <div style={{ padding: "16px 24px", background: "#fff", borderTop: "1px solid rgba(22,71,251,0.08)", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void sendChatReply(); }}
                    placeholder="Svar til brugeren… (⌘↵ sender)"
                    rows={3}
                    style={{
                      flex: 1, padding: "12px 14px", border: "1.5px solid rgba(22,71,251,0.18)",
                      borderRadius: "12px", fontSize: "13px", fontFamily: "Montserrat, sans-serif",
                      color: "#080808", resize: "none", outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#1647FB")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(22,71,251,0.18)")}
                  />
                  <button onClick={() => void sendChatReply()}
                    disabled={!replyText.trim() || sending}
                    style={{
                      background: replyText.trim() && !sending ? "#1647FB" : "rgba(22,71,251,0.2)",
                      border: "none", borderRadius: "12px", padding: "12px 20px",
                      fontSize: "13px", fontFamily: "Montserrat, sans-serif", fontWeight: 700,
                      color: replyText.trim() && !sending ? "#fff" : "rgba(22,71,251,0.5)",
                      cursor: replyText.trim() && !sending ? "pointer" : "default",
                      transition: "background 0.2s, color 0.2s",
                      flexShrink: 0, height: "fit-content",
                    }}>
                    {sending ? "Sender…" : "Send"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Email detail ── */}
          {selectedEmail && !loadingEmail && (
            <>
              {/* Email header */}
              <div style={{
                padding: "16px 24px", background: "#fff",
                borderBottom: "1px solid rgba(22,71,251,0.08)", flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: "#1647FB", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 800, color: "#fff", flexShrink: 0,
                  }}>
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

              {/* Email body */}
              <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#f9f9fb" }}>
                <div style={{
                  background: "#fff", borderRadius: "14px", padding: "24px",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
                  fontSize: "14px", lineHeight: 1.75, color: "#222",
                  fontFamily: "Montserrat, sans-serif", whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>
                  {selectedEmail.text ?? "(Ingen tekstindhold)"}
                </div>
              </div>

              {/* Email reply */}
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
                    style={{
                      flex: 1, padding: "12px 14px", border: "1.5px solid rgba(22,71,251,0.18)",
                      borderRadius: "12px", fontSize: "13px", fontFamily: "Montserrat, sans-serif",
                      color: "#080808", resize: "none", outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#1647FB")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(22,71,251,0.18)")}
                  />
                  <button onClick={() => void sendEmailReply()}
                    disabled={!replyText.trim() || sending}
                    style={{
                      background: replyText.trim() && !sending ? "#1647FB" : "rgba(22,71,251,0.2)",
                      border: "none", borderRadius: "12px", padding: "12px 20px",
                      fontSize: "13px", fontFamily: "Montserrat, sans-serif", fontWeight: 700,
                      color: replyText.trim() && !sending ? "#fff" : "rgba(22,71,251,0.5)",
                      cursor: replyText.trim() && !sending ? "pointer" : "default",
                      transition: "background 0.2s, color 0.2s",
                      flexShrink: 0, height: "fit-content",
                    }}>
                    {sending ? "Sender…" : "Send mail"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Toast notification ── */}
      {notification && (
        <div style={{
          position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
          background: "#080808", color: "#fff", padding: "10px 20px", borderRadius: "999px",
          fontSize: "13px", fontFamily: "Montserrat, sans-serif", fontWeight: 600,
          zIndex: 9999, animation: "admin-toast 0.25s ease both",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        }}>
          <style>{`@keyframes admin-toast { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
          {notification}
        </div>
      )}
    </div>
  );
}

/* ─── Root ────────────────────────────────────────────────── */
export default function MitPage() {
  const [adminKey, setAdminKey] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("duckert-admin-key");
  });

  const handleLogin = (key: string) => {
    try { sessionStorage.setItem("duckert-admin-key", key); } catch {}
    setAdminKey(key);
  };

  const handleLogout = () => {
    try { sessionStorage.removeItem("duckert-admin-key"); } catch {}
    setAdminKey(null);
  };

  if (!adminKey) return <LoginScreen onLogin={handleLogin} />;
  return <AdminApp adminKey={adminKey} onLogout={handleLogout} />;
}
