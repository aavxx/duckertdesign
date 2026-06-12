import { useState } from "react";
import { useStore } from "../store";
import { sendEmailReply } from "../api";
import type { EmailSummary } from "../store";

const BRAND = "#1647FB";

export function EmailPane() {
  const { emails, selectedEmailUid, selectEmail } = useStore();
  const selected = emails.find((e) => e.uid === selectedEmailUid) ?? null;

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Inbox list */}
      <div style={{
        width: "280px", borderRight: "1px solid #e5e7eb",
        overflowY: "auto", flexShrink: 0, background: "#fff",
      }}>
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f0f0f0" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111" }}>Indbakke</h2>
          <p style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{emails.length} emails</p>
        </div>
        {emails.length === 0 && (
          <p style={{ padding: "24px 16px", color: "#999", fontSize: "13px", textAlign: "center" }}>Ingen emails endnu</p>
        )}
        {emails.map((email) => (
          <EmailRow
            key={email.uid}
            email={email}
            selected={email.uid === selectedEmailUid}
            onClick={() => selectEmail(email.uid)}
          />
        ))}
      </div>

      {/* Reading pane */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {selected ? (
          <ReadingPane email={selected} />
        ) : (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            color: "#bbb", fontSize: "14px",
          }}>
            Vælg en email for at læse
          </div>
        )}
      </div>
    </div>
  );
}

function EmailRow({ email, selected, onClick }: {
  email: EmailSummary;
  selected: boolean;
  onClick: () => void;
}) {
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
        <span style={{
          fontSize: "13px", fontWeight: email.seen ? 400 : 700,
          color: "#111", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {email.from.replace(/<.*>/, "").trim() || email.from}
        </span>
        {!email.seen && (
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: BRAND, flexShrink: 0 }} />
        )}
      </div>
      <p style={{
        fontSize: "12px", color: email.seen ? "#888" : "#333",
        fontWeight: email.seen ? 400 : 500,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {email.subject}
      </p>
      {email.date && (
        <p style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
          {new Date(email.date).toLocaleString("da-DK", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </button>
  );
}

function ReadingPane({ email }: { email: EmailSummary }) {
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    const trimmed = replyText.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await sendEmailReply({
        to: email.from,
        subject: email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
        body: trimmed,
      });
      setReplyText("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      alert("Fejl ved afsendelse: " + err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f0f0f0", background: "#fff" }}>
        <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#111", marginBottom: "6px", lineHeight: 1.3 }}>
          {email.subject}
        </h2>
        <p style={{ fontSize: "13px", color: "#555" }}>Fra: {email.from}</p>
        {email.date && (
          <p style={{ fontSize: "12px", color: "#aaa", marginTop: "2px" }}>
            {new Date(email.date).toLocaleString("da-DK", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>

      {/* Body placeholder */}
      <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto", background: "#fafafa" }}>
        <p style={{ color: "#888", fontSize: "13px", fontStyle: "italic" }}>
          Email body — tilføj GET /api/admin/emails/&#123;uid&#93; endpoint for at hente fuldt indhold.
        </p>
      </div>

      {/* Reply box */}
      <div style={{ padding: "12px 24px 16px", borderTop: "1px solid #f0f0f0", background: "#fff" }}>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Skriv svar…"
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
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px", gap: "8px", alignItems: "center" }}>
          {sent && <span style={{ color: "#22c55e", fontSize: "12px" }}>Sendt ✓</span>}
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
            {sending ? "Sender…" : "Send (⌘↵)"}
          </button>
        </div>
      </div>
    </div>
  );
}
