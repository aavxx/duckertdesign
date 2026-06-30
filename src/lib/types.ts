// ── Shared types used by both customer-facing chat routes and the admin system ──

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "admin" | "system";
  content: string;
  ts: number;
};

export type ChatSession = {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: "ai" | "human" | "claimed" | "inactive" | "closed" | "archived";
  messages: ChatMessage[];
  visitorInfo?: { page: string; userAgent: string };
  tags?: string[];
  closedAt?: number;
  claimedAt?: number;
  archivedAt?: number;
};

// ── Email types ──

export type EmailMessage = {
  id: string;
  from: string;
  to: string;
  subject: string;
  text: string | null;
  html: string | null;
  ts: number;
  direction: "inbound" | "outbound";
  messageId?: string;
  inReplyTo?: string;
};

export type EmailThread = {
  id: string;
  subject: string;
  participants: string[];
  messages: EmailMessage[];
  status: "new" | "open" | "waiting" | "closed";
  tags: string[];
  createdAt: number;
  updatedAt: number;
};

// ── Unified inbox item (pointer into inbox:idx sorted set) ──

export type InboxItem = {
  type: "chat" | "email";
  id: string;
  score: number; // updatedAt timestamp for sorting
};

// ── Admin events published on Redis channel admin:events ──

export type AdminEvent =
  | { type: "new_email"; threadId: string; from: string; subject: string; ts: number }
  | { type: "new_chat_session"; sessionId: string; humanRequested?: boolean; ts: number }
  | { type: "new_chat_message"; sessionId: string; messageId: string; content: string; role: "user" | "admin"; ts: number }
  | { type: "customer_typing"; sessionId: string; typing: boolean; ts: number }
  | { type: "chat_claimed"; sessionId: string; ts: number }
  | { type: "chat_closed"; sessionId: string; ts: number }
  | { type: "chat_archived"; sessionId: string; ts: number };

// ── Feedback ──

export type Feedback = {
  id: string;
  sessionId: string;
  rating: number;
  createdAt: number;
};
