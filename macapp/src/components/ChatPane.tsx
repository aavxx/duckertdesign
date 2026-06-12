import { useRef, useEffect, useState } from "react";
import { useStore } from "../store";
import { sendChatReply } from "../api";
import type { ChatSession, ChatMessage } from "../store";

const BRAND = "#1647FB";

const STATUS_LABELS: Record<ChatSession["status"], string> = {
  ai: "AI",
  human: "Menneskelig hjælp",
  closed: "Lukket",
};

const STATUS_COLORS: Record<ChatSession["status"], string> = {
  ai: "#888",
  human: "#f59e0b",
  closed: "#d1d5db",
};

export function ChatPane() {
  const { sessions, selectedSessionId, selectSession } = useStore();
  const selected = sessions.find((s) => s.id === selectedSessionId) ?? null;

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Session list */}
      <div style={{
        width: "260px", borderRight: "1px solid #e5e7eb",
        overflowY: "auto", flexShrink: 0, background: "#fff",
      }}>
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f0f0f0" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111" }}>Chat-sessioner</h2>
          <p style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
            {sessions.filter((s) => s.status === "human").length} afventer svar
          </p>
        </div>
        {sessions.length === 0 && (
          <p style={{ padding: "24px 16px", color: "#999", fontSize: "13px", textAlign: "center" }}>Ingen aktive chat-sessioner</p>
        )}
        {sessions.map((s) => (
          <SessionRow
            key={s.id}
            session={s}
            selected={s.id === selectedSessionId}
            onClick={() => selectSession(s.id)}
          />
        ))}
      </div>

      {/* Chat view */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {selected ? (
          <ChatView session={selected} />
        ) : (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            color: "#bbb", fontSize: "14px",
          }}>
            Vælg en session for at se beskeder
          </div>
        )}
      </div>
    </div>
  );
}

function SessionRow({ session, selected, onClick }: {
  session: ChatSession;
  selected: boolean;
  onClick: () => void;
}) {
  const lastMsg = session.messages[session.messages.length - 1];
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left", padding: "12px 16px",
        background: selected ? "#f0f4ff" : "transparent",
        borderBottom: "1px solid #f5f5f5", border: "none",
        cursor: "pointer",
        borderLeft: selected ? `3px solid ${BRAND}` : "3px solid transparent",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <span style={{ fontSize: "12px", color: "#999", fontFamily: "monospace" }}>
          {session.id.slice(0, 8)}…
        </span>
        <span style={{
          fontSize: "10px", fontWeight: 600,
          color: STATUS_COLORS[session.status],
          background: `${STATUS_COLORS[session.status]}22`,
          padding: "2px 7px", borderRadius: "99px",
        }}>
          {STATUS_LABELS[session.status]}
        </span>
      </div>
      {lastMsg && (
        <p style={{
          fontSize: "12px", color: "#555",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {lastMsg.role === "admin" ? "Du: " : ""}{lastMsg.content}
        </p>
      )}
      <p style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
        {new Date(session.updatedAt).toLocaleString("da-DK", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
      </p>
    </button>
  );
}

function ChatView({ session }: { session: ChatSession }) {
  const appendChatMessage = useStore((s) => s.appendChatMessage);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages]);

  async function handleSend() {
    const trimmed = replyText.trim();
    if (!trimmed || sending) return;
    setSending(true);

    // Optimistic update
    const optimisticMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "admin",
      content: trimmed,
      ts: Date.now(),
    };
    appendChatMessage(session.id, optimisticMsg);
    setReplyText("");

    try {
      await sendChatReply(session.id, trimmed);
    } catch (err) {
      alert("Fejl ved afsendelse: " + err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Session header */}
      <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #f0f0f0", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "13px", color: "#555", fontFamily: "monospace" }}>{session.id}</span>
          <span style={{
            fontSize: "11px", fontWeight: 600,
            color: STATUS_COLORS[session.status],
            background: `${STATUS_COLORS[session.status]}22`,
            padding: "2px 8px", borderRadius: "99px",
          }}>
            {STATUS_LABELS[session.status]}
          </span>
        </div>
        <p style={{ fontSize: "11px", color: "#aaa", marginTop: "3px" }}>
          Startet: {new Date(session.createdAt).toLocaleString("da-DK")} · {session.messages.length} beskeder
        </p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", background: "#f9fafb", display: "flex", flexDirection: "column", gap: "10px" }}>
        {session.messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply */}
      <div style={{ padding: "12px 20px 16px", borderTop: "1px solid #f0f0f0", background: "#fff" }}>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Skriv svar til kunden… (⌘↵ sender)"
          rows={3}
          style={{
            width: "100%", border: "1px solid #e0e0e0", borderRadius: "8px",
            padding: "10px 12px", fontSize: "13px", resize: "vertical",
            outline: "none", fontFamily: "inherit",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
          <button
            onClick={handleSend}
            disabled={sending || !replyText.trim()}
            style={{
              background: BRAND, color: "#fff", border: "none",
              borderRadius: "8px", padding: "8px 20px",
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
              opacity: sending || !replyText.trim() ? 0.5 : 1,
            }}
          >
            {sending ? "Sender…" : "Send til kunde (⌘↵)"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const isAdmin = msg.role === "admin";

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div style={{
        maxWidth: "75%",
        background: isUser ? "#e8f0fe" : isAdmin ? BRAND : "#fff",
        color: isAdmin ? "#fff" : "#111",
        padding: "10px 14px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        border: isUser ? "1px solid #c7d7fb" : isAdmin ? "none" : "1px solid #e5e7eb",
        fontSize: "13px", lineHeight: 1.55,
      }}>
        {!isUser && (
          <span style={{
            fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
            color: isAdmin ? "rgba(255,255,255,0.7)" : "#888",
            display: "block", marginBottom: "4px",
          }}>
            {isAdmin ? "Du" : "AI Assistent"}
          </span>
        )}
        {msg.content}
        <div style={{ fontSize: "10px", color: isAdmin ? "rgba(255,255,255,0.5)" : "#bbb", marginTop: "4px", textAlign: "right" }}>
          {new Date(msg.ts).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}
