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
  closedAt?: number;
  claimedAt?: number;
  archivedAt?: number;
};

export type AdminEvent =
  | { type: "new_email"; uid: string; from: string; subject: string; ts: number }
  | { type: "new_chat_session"; sessionId: string; humanRequested?: boolean; ts: number }
  | { type: "new_chat_message"; sessionId: string; messageId: string; content: string; role: "user" | "admin"; ts: number }
  | { type: "customer_typing"; sessionId: string; typing: boolean; ts: number }
  | { type: "chat_claimed"; sessionId: string; ts: number }
  | { type: "chat_closed"; sessionId: string; ts: number }
  | { type: "chat_archived"; sessionId: string; ts: number };

export type Feedback = {
  id: string;
  sessionId: string;
  rating: number;
  createdAt: number;
};
