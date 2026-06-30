"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "admin" | "system";
  content: string;
  ts: number;
};

type ChatSession = {
  id: string;
  status: "ai" | "human" | "claimed" | "inactive" | "closed" | "archived";
  messages: ChatMessage[];
  updatedAt: number;
  tags?: string[];
};

type EmailMessage = {
  id: string;
  from: string;
  to: string;
  subject: string;
  text: string | null;
  html: string | null;
  ts: number;
  direction: "inbound" | "outbound";
};

type EmailThread = {
  id: string;
  subject: string;
  participants: string[];
  messages: EmailMessage[];
  status: "new" | "open" | "waiting" | "closed";
  tags: string[];
  updatedAt: number;
};

type InboxEntry =
  | { kind: "chat"; id: string; score: number; status: ChatSession["status"]; preview: string; updatedAt: number }
  | { kind: "email"; id: string; score: number; status: EmailThread["status"]; subject: string; from: string; updatedAt: number };

type AdminEvent = {
  type: string;
  sessionId?: string;
  threadId?: string;
  from?: string;
  subject?: string;
  content?: string;
  ts?: number;
};

type View = { kind: "chat"; id: string } | { kind: "email"; id: string } | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("da-DK", { day: "numeric", month: "short" });
}

function statusColor(s: string) {
  if (s === "new") return "#ef4444";
  if (s === "open" || s === "ai" || s === "human" || s === "claimed") return "#22c55e";
  if (s === "waiting") return "#f59e0b";
  return "#6b7280";
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    new: "ny", open: "åben", waiting: "venter", closed: "lukket",
    ai: "ai", human: "human", claimed: "krævet", inactive: "inaktiv",
    archived: "arkiveret",
  };
  return map[s] ?? s;
}

// ─── Audio helper ─────────────────────────────────────────────────────────────

function playSound(url: string) {
  try { new Audio(url).play().catch(() => {}); } catch {}
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function api(url: string, opts: RequestInit = {}, token?: string | null) {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(opts.headers as Record<string, string> ?? {}) };
  if (token) headers["x-admin-key"] = token;
  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) throw new Error(`${res.status}`);
  return res;
}

// ─── Login screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const codeRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  async function requestOtp() {
    setLoading(true); setErr("");
    try {
      await api("/api/admin/auth/request", { method: "POST", body: JSON.stringify({ email }) });
      setStep("otp");
      setTimeout(() => codeRefs[0].current?.focus(), 50);
    } catch (e: unknown) {
      setErr(e instanceof Error && e.message === "404" ? "Denne e-mail er ikke registreret." : "Noget gik galt, prøv igen.");
    } finally { setLoading(false); }
  }

  async function verifyOtp() {
    const c = code.join("");
    if (c.length < 4) return;
    setLoading(true); setErr("");
    try {
      const res = await api("/api/admin/auth/verify", { method: "POST", body: JSON.stringify({ email, code: c }) });
      const { token } = await res.json() as { token: string };
      onLogin(token);
    } catch {
      setErr("Forkert eller udløbet kode.");
      setCode(["", "", "", ""]);
      setTimeout(() => codeRefs[0].current?.focus(), 50);
    } finally { setLoading(false); }
  }

  function handleCodeInput(i: number, val: string) {
    const clean = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = clean;
    setCode(next);
    if (clean && i < 3) setTimeout(() => codeRefs[i + 1].current?.focus(), 0);
    if (next.every((d) => d)) {
      setTimeout(() => {
        const fullCode = next.join("");
        setLoading(true); setErr("");
        api("/api/admin/auth/verify", { method: "POST", body: JSON.stringify({ email, code: fullCode }) })
          .then((r) => r.json())
          .then((d) => onLogin((d as { token: string }).token))
          .catch(() => { setErr("Forkert eller udløbet kode."); setCode(["", "", "", ""]); setTimeout(() => codeRefs[0].current?.focus(), 50); })
          .finally(() => setLoading(false));
      }, 0);
    }
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (digits.length === 4) {
      e.preventDefault();
      setCode(digits.split(""));
    }
  }

  return (
    <div style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f9", fontFamily: "Montserrat, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 40, width: 360, boxShadow: "0 4px 40px rgba(0,0,0,0.08)" }}>
        <div style={{ width: 48, height: 48, background: "#1647FB", borderRadius: 12, marginBottom: 24 }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Mit Duckert Design</h1>
        <p style={{ color: "rgba(8,8,8,0.5)", fontSize: 13, margin: "0 0 28px" }}>
          {step === "email" ? "Indtast din e-mail for at modtage en login-kode." : `Koden er sendt til ${email}.`}
        </p>

        {step === "email" ? (
          <>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="din@email.dk" autoFocus
              onKeyDown={(e) => e.key === "Enter" && requestOtp()}
              style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 16 }}
            />
            <button onClick={requestOtp} disabled={loading || !email.includes("@")}
              style={{ width: "100%", background: "#1647FB", color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Sender…" : "Send kode"}
            </button>
          </>
        ) : (
          <>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }} onPaste={handleCodePaste}>
              {code.map((d, i) => (
                <input
                  key={i} ref={codeRefs[i]} value={d} maxLength={1} inputMode="numeric"
                  onChange={(e) => handleCodeInput(i, e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) codeRefs[i - 1].current?.focus(); }}
                  style={{ width: 56, height: 64, textAlign: "center", fontSize: 28, fontWeight: 700, border: "2px solid #e0e0e0", borderRadius: 12, outline: "none", color: "#1647FB" }}
                />
              ))}
            </div>
            <button onClick={verifyOtp} disabled={loading || code.some((d) => !d)}
              style={{ width: "100%", background: "#1647FB", color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Verificerer…" : "Log ind"}
            </button>
            <button onClick={() => { setStep("email"); setCode(["", "", "", ""]); setErr(""); }}
              style={{ marginTop: 10, width: "100%", background: "transparent", border: "none", color: "rgba(8,8,8,0.4)", fontSize: 13, cursor: "pointer" }}>
              Ændre e-mail
            </button>
          </>
        )}

        {err && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12, textAlign: "center" }}>{err}</p>}
      </div>
    </div>
  );
}

// ─── Settings modal ────────────────────────────────────────────────────────────

function SettingsModal({ token, onClose }: { token: string; onClose: () => void }) {
  const [context, setContext] = useState("");
  const [saving, setSaving] = useState(false);
  const [pushState, setPushState] = useState<"idle" | "subscribed" | "loading">("idle");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api("/api/admin/ai/context", {}, token).then((r) => r.json()).then((d) => {
      setContext((d as { context: string }).context ?? "");
    }).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      navigator.serviceWorker?.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setPushState("subscribed");
        });
      });
    }
  }, []);

  async function saveContext() {
    setSaving(true);
    try {
      await api("/api/admin/ai/context", { method: "POST", body: JSON.stringify({ context }) }, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  }

  async function subscribePush() {
    setPushState("loading");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setPushState("idle"); return; }

      await navigator.serviceWorker.register("/sw.js");
      const reg = await navigator.serviceWorker.ready;
      const vapidRes = await api("/api/admin/push/vapid", {}, token);
      const { publicKey } = await vapidRes.json() as { publicKey: string };

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });

      await api("/api/admin/push/register", { method: "POST", body: JSON.stringify(sub.toJSON()) }, token);
      setPushState("subscribed");
    } catch (e) { console.error(e); setPushState("idle"); }
  }

  async function unsubscribePush() {
    const reg = await navigator.serviceWorker?.ready;
    const sub = await reg?.pushManager?.getSubscription();
    if (sub) {
      await api("/api/admin/push/register", { method: "DELETE", body: JSON.stringify(sub.toJSON()) }, token);
      await sub.unsubscribe();
    }
    setPushState("idle");
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 32, width: 500, maxWidth: "90vw", fontFamily: "Montserrat, sans-serif" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>Indstillinger</h2>

        <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 6px" }}>AI-kontekst</p>
        <p style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", margin: "0 0 8px" }}>Beskriv dine services, priser og FAQ. AI bruger dette til at foreslå svar.</p>
        <textarea value={context} onChange={(e) => setContext(e.target.value)} rows={8}
          style={{ width: "100%", border: "1.5px solid #e0e0e0", borderRadius: 10, padding: 12, fontSize: 13, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
        <button onClick={saveContext} disabled={saving}
          style={{ marginTop: 8, background: "#1647FB", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          {saving ? "Gemmer…" : saved ? "Gemt ✓" : "Gem"}
        </button>

        <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid #eee" }} />

        <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 6px" }}>Web Push-notifikationer</p>
        <p style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", margin: "0 0 12px" }}>Modtag push-beskeder selv når admin-fanen er i baggrunden.</p>
        {pushState === "subscribed" ? (
          <button onClick={unsubscribePush} style={{ background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Afmeld push
          </button>
        ) : (
          <button onClick={subscribePush} disabled={pushState === "loading"} style={{ background: "#f0f4ff", color: "#1647FB", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {pushState === "loading" ? "Aktiverer…" : "Aktiver push"}
          </button>
        )}

        <div style={{ marginTop: 24, textAlign: "right" }}>
          <button onClick={onClose} style={{ background: "transparent", border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "8px 20px", fontSize: 13, cursor: "pointer" }}>
            Luk
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Chat thread view ──────────────────────────────────────────────────────────

function ChatView({ id, token, onUpdate }: { id: string; token: string; onUpdate: () => void }) {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftLoading, setDraftLoading] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await api(`/api/admin/chat/${id}`, {}, token);
      setSession(await res.json() as ChatSession);
    } catch {}
  }, [id, token]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [session?.messages.length]);

  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api(`/api/admin/chat/${id}/reply`, { method: "POST", body: JSON.stringify({ content: reply }) }, token);
      setReply(""); setDraft("");
      await load(); onUpdate();
    } catch {} finally { setSending(false); }
  }

  async function claim() {
    try { await api(`/api/admin/chat/${id}/claim`, { method: "POST", body: "{}" }, token); await load(); onUpdate(); } catch {}
  }

  async function close() {
    const msg = prompt("Afskedsbeskeds (valgfri, Enter for at springe over):");
    try { await api(`/api/admin/chat/${id}/close`, { method: "POST", body: JSON.stringify({ message: msg ?? "" }) }, token); await load(); onUpdate(); } catch {}
  }

  async function getDraft() {
    setDraftLoading(true);
    try {
      const res = await api("/api/admin/ai/draft", { method: "POST", body: JSON.stringify({ type: "chat", id }) }, token);
      const { draft: d } = await res.json() as { draft: string };
      setDraft(d); setReply(d);
    } catch {}
    setDraftLoading(false);
  }

  function sendTyping(typing: boolean) {
    setAgentTyping(typing);
    api("/api/admin/typing", { method: "POST", body: JSON.stringify({ sessionId: id, typing }) }, token).catch(() => {});
  }

  if (!session) return <div style={{ padding: 32, color: "rgba(0,0,0,0.4)" }}>Indlæser…</div>;

  const isOpen = !["closed", "archived"].includes(session.status);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Montserrat, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Live chat — {id.slice(0, 8)}</div>
          <div style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", marginTop: 2 }}>
            <span style={{ background: statusColor(session.status), display: "inline-block", width: 7, height: 7, borderRadius: "50%", marginRight: 5 }} />
            {statusLabel(session.status)}
          </div>
        </div>
        {isOpen && session.status !== "claimed" && (
          <button onClick={claim} style={{ background: "#f0f4ff", color: "#1647FB", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Kræv
          </button>
        )}
        {isOpen && (
          <button onClick={close} style={{ background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Luk chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {session.messages.filter((m) => m.role !== "system").map((m) => {
          const isUser = m.role === "user";
          const isAdmin = m.role === "admin";
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: isUser ? "flex-start" : "flex-end" }}>
              <div style={{
                maxWidth: "72%", padding: "10px 14px", borderRadius: isUser ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                background: isAdmin ? "#1647FB" : isUser ? "#f5f5f5" : "#e8f0ff",
                color: isAdmin ? "#fff" : "#080808",
                fontSize: 13, lineHeight: 1.5,
              }}>
                {!isUser && !isAdmin && <div style={{ fontSize: 11, marginBottom: 4, opacity: 0.6 }}>AI</div>}
                {m.content}
                <div style={{ fontSize: 10, marginTop: 4, opacity: 0.5, textAlign: "right" }}>{fmtTime(m.ts)}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      {isOpen && (
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button onClick={getDraft} disabled={draftLoading} style={{ background: "#f0f4ff", color: "#1647FB", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {draftLoading ? "Genererer…" : "✨ AI-udkast"}
            </button>
          </div>
          <textarea
            value={reply} onChange={(e) => { setReply(e.target.value); if (!agentTyping) sendTyping(true); }}
            onBlur={() => sendTyping(false)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendReply(); } }}
            placeholder="Skriv svar… (Cmd+Enter for at sende)"
            rows={3}
            style={{ width: "100%", border: "1.5px solid #e0e0e0", borderRadius: 10, padding: "10px 14px", fontSize: 13, resize: "none", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={sendReply} disabled={sending || !reply.trim()}
              style={{ background: "#1647FB", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: sending || !reply.trim() ? 0.5 : 1 }}>
              {sending ? "Sender…" : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Email thread view ─────────────────────────────────────────────────────────

function EmailView({ id, token, onUpdate }: { id: string; token: string; onUpdate: () => void }) {
  const [thread, setThread] = useState<EmailThread | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await api(`/api/admin/email/${id}`, {}, token);
      setThread(await res.json() as EmailThread);
    } catch {}
  }, [id, token]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread?.messages.length]);

  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api(`/api/admin/email/${id}/reply`, { method: "POST", body: JSON.stringify({ body: reply }) }, token);
      setReply(""); await load(); onUpdate();
    } catch {} finally { setSending(false); }
  }

  async function getDraft() {
    setDraftLoading(true);
    try {
      const res = await api("/api/admin/ai/draft", { method: "POST", body: JSON.stringify({ type: "email", id }) }, token);
      const { draft } = await res.json() as { draft: string };
      setReply(draft);
    } catch {}
    setDraftLoading(false);
  }

  if (!thread) return <div style={{ padding: 32, color: "rgba(0,0,0,0.4)" }}>Indlæser…</div>;

  const isOpen = thread.status !== "closed";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Montserrat, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0", flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{thread.subject}</div>
        <div style={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>
          <span style={{ background: statusColor(thread.status), display: "inline-block", width: 7, height: 7, borderRadius: "50%", marginRight: 5 }} />
          {statusLabel(thread.status)} · {thread.participants.join(", ")}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        {thread.messages.map((m) => (
          <div key={m.id} style={{ borderRadius: 12, border: "1px solid #f0f0f0", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", background: m.direction === "inbound" ? "#f8f9ff" : "#f0f4ff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{m.from}</div>
              <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)" }}>{fmtTime(m.ts)}</div>
            </div>
            <div style={{ padding: "14px 16px", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {m.text ?? (m.html ? <span dangerouslySetInnerHTML={{ __html: m.html }} /> : "(ingen indhold)")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      {isOpen && (
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button onClick={getDraft} disabled={draftLoading} style={{ background: "#f0f4ff", color: "#1647FB", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {draftLoading ? "Genererer…" : "✨ AI-udkast"}
            </button>
          </div>
          <textarea value={reply} onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendReply(); } }}
            placeholder="Skriv svar… (Cmd+Enter for at sende)"
            rows={4}
            style={{ width: "100%", border: "1.5px solid #e0e0e0", borderRadius: 10, padding: "10px 14px", fontSize: 13, resize: "none", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={sendReply} disabled={sending || !reply.trim()}
              style={{ background: "#1647FB", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: sending || !reply.trim() ? 0.5 : 1 }}>
              {sending ? "Sender…" : "Besvar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main admin app ────────────────────────────────────────────────────────────

function AdminApp({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [inbox, setInbox] = useState<InboxEntry[]>([]);
  const [view, setView] = useState<View>(null);
  const [search, setSearch] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [unread, setUnread] = useState<Set<string>>(new Set());

  const loadInbox = useCallback(async () => {
    try {
      const res = await api("/api/admin/inbox", {}, token);
      setInbox(await res.json() as InboxEntry[]);
    } catch {}
  }, [token]);

  useEffect(() => { loadInbox(); }, [loadInbox]);

  // SSE admin events
  useEffect(() => {
    let es: EventSource;
    let closed = false;

    function connect() {
      es = new EventSource(`/api/admin/events?token=${encodeURIComponent(token)}`);
      es.onmessage = (e) => {
        try {
          const ev = JSON.parse(e.data) as AdminEvent;
          if (ev.type === "new_email" || ev.type === "new_chat_session" || ev.type === "new_chat_message") {
            loadInbox();
            const id = ev.threadId ?? ev.sessionId;
            if (id) {
              setUnread((prev) => new Set(prev).add(id));
              playSound("/newmessage.m4a");
            }
          }
        } catch {}
      };
      es.onerror = () => { if (!closed) setTimeout(connect, 3000); };
    }

    // SSE requires auth header — but EventSource doesn't support headers.
    // We'll use a query-param token approach: the event stream checks a temp cookie.
    // For now, rely on same-origin session cookie or rebuild with fetch-based SSE.
    connect();
    return () => { closed = true; es.close(); };
  }, [token, loadInbox]);

  const filtered = inbox.filter((item) => {
    const q = search.toLowerCase();
    if (!q) return true;
    if (item.kind === "email") return item.subject.toLowerCase().includes(q) || item.from.toLowerCase().includes(q);
    return item.preview.toLowerCase().includes(q) || item.id.includes(q);
  });

  function openItem(item: InboxEntry) {
    setView({ kind: item.kind, id: item.id });
    setUnread((prev) => { const n = new Set(prev); n.delete(item.id); return n; });
  }

  return (
    <div style={{ display: "flex", height: "100dvh", fontFamily: "Montserrat, sans-serif", background: "#fff" }}>
      {/* Sidebar */}
      <div style={{ width: 300, borderRight: "1px solid #f0f0f0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Sidebar header */}
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "#1647FB", borderRadius: 8, flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>Indbakke</span>
          <button onClick={() => setShowSettings(true)} title="Indstillinger"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(0,0,0,0.4)", fontSize: 16 }}>⚙</button>
          <button onClick={onLogout} title="Log ud"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(0,0,0,0.4)", fontSize: 13 }}>↩</button>
        </div>

        {/* Search */}
        <div style={{ padding: "10px 12px" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Søg…"
            style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #f0f0f0", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box", background: "#f9f9f9" }} />
        </div>

        {/* Inbox list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.length === 0 && (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "rgba(0,0,0,0.3)", fontSize: 13 }}>
              {inbox.length === 0 ? "Ingen samtaler endnu" : "Ingen resultater"}
            </div>
          )}
          {filtered.map((item) => {
            const isActive = view?.id === item.id;
            const hasUnread = unread.has(item.id);
            return (
              <button key={`${item.kind}:${item.id}`} onClick={() => openItem(item)}
                style={{
                  width: "100%", textAlign: "left", padding: "12px 16px", border: "none", cursor: "pointer",
                  background: isActive ? "#f0f4ff" : "transparent",
                  borderLeft: isActive ? "3px solid #1647FB" : "3px solid transparent",
                  display: "block",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, flex: 1 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor(item.status), flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: hasUnread ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.kind === "email" ? item.subject : `Chat ${item.id.slice(0, 8)}`}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {hasUnread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1647FB" }} />}
                    <span style={{ fontSize: 11, color: "rgba(0,0,0,0.35)" }}>{fmtTime(item.updatedAt)}</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", marginTop: 3, marginLeft: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.kind === "email" ? item.from : item.preview}
                </div>
                <div style={{ marginTop: 4, marginLeft: 14 }}>
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: "#f0f0f0", color: "rgba(0,0,0,0.45)" }}>
                    {item.kind === "email" ? "📧" : "💬"} {statusLabel(item.status)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {!view ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(0,0,0,0.25)", fontSize: 14 }}>
            Vælg en samtale fra indbakken
          </div>
        ) : view.kind === "chat" ? (
          <ChatView key={view.id} id={view.id} token={token} onUpdate={loadInbox} />
        ) : (
          <EmailView key={view.id} id={view.id} token={token} onUpdate={loadInbox} />
        )}
      </div>

      {showSettings && <SettingsModal token={token} onClose={() => setShowSettings(false)} />}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function MitPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin-token");
    if (stored) setToken(stored);
  }, []);

  function handleLogin(t: string) {
    sessionStorage.setItem("admin-token", t);
    setToken(t);
  }

  function handleLogout() {
    sessionStorage.removeItem("admin-token");
    setToken(null);
  }

  if (!token) return <LoginScreen onLogin={handleLogin} />;
  return <AdminApp token={token} onLogout={handleLogout} />;
}
