export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "admin";
  content: string;
  ts: number;
};

export type ChatSession = {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: "ai" | "human" | "closed";
  messages: ChatMessage[];
  visitorInfo?: { page: string; userAgent: string };
};

export type AdminEvent =
  | { type: "new_email"; uid: string; from: string; subject: string; ts: number }
  | { type: "new_chat_session"; sessionId: string; humanRequested?: boolean; ts: number }
  | { type: "new_chat_message"; sessionId: string; messageId: string; content: string; role: "user" | "admin"; ts: number };
