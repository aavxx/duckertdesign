const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "https://duckert.design";
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY ?? "";

export const SSE_URL = `${BACKEND_URL}/api/admin/events`;

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": ADMIN_KEY,
      ...(init?.headers ?? {}),
    },
  });
  return res;
}

export async function fetchEmails() {
  const res = await apiFetch("/api/admin/emails");
  if (!res.ok) throw new Error("Failed to fetch emails");
  return res.json();
}

export async function fetchEmailBody(uid: string) {
  const res = await apiFetch(`/api/admin/emails/${uid}`);
  if (!res.ok) throw new Error("Failed to fetch email body");
  return res.json();
}

export async function sendEmailReply(payload: {
  to: string;
  subject: string;
  body: string;
  inReplyTo?: string;
}) {
  const res = await apiFetch("/api/admin/emails/reply", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to send email reply");
  return res.json();
}

export async function fetchChats() {
  const res = await apiFetch("/api/admin/chats");
  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
}

export async function sendChatReply(sessionId: string, content: string) {
  const res = await apiFetch("/api/admin/chats/reply", {
    method: "POST",
    body: JSON.stringify({ sessionId, content }),
  });
  if (!res.ok) throw new Error("Failed to send chat reply");
  return res.json();
}

export { ADMIN_KEY };
