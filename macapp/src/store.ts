import { create } from "zustand";

export type EmailSummary = {
  uid: string;
  subject: string;
  from: string;
  date: string | null;
  seen: boolean;
};

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
};

type Store = {
  connected: boolean;
  setConnected: (v: boolean) => void;

  // Email
  emails: EmailSummary[];
  selectedEmailUid: string | null;
  unreadEmails: number;
  setEmails: (emails: EmailSummary[]) => void;
  prependEmail: (email: EmailSummary) => void;
  selectEmail: (uid: string | null) => void;
  markEmailSeen: (uid: string) => void;

  // Chat
  sessions: ChatSession[];
  selectedSessionId: string | null;
  unreadChats: number;
  setSessions: (sessions: ChatSession[]) => void;
  upsertSession: (session: ChatSession) => void;
  appendChatMessage: (sessionId: string, msg: ChatMessage) => void;
  selectSession: (id: string | null) => void;
  decrementUnreadChats: () => void;

  // Navigation
  activePane: "email" | "chat";
  setActivePane: (pane: "email" | "chat") => void;
  navigateTo: (pane: "email" | "chat", id: string) => void;
};

export const useStore = create<Store>((set, get) => ({
  connected: false,
  setConnected: (v) => set({ connected: v }),

  emails: [],
  selectedEmailUid: null,
  unreadEmails: 0,
  setEmails: (emails) =>
    set({ emails, unreadEmails: emails.filter((e) => !e.seen).length }),
  prependEmail: (email) =>
    set((s) => ({
      emails: [email, ...s.emails],
      unreadEmails: s.unreadEmails + 1,
    })),
  selectEmail: (uid) =>
    set((s) => {
      const emails = s.emails.map((e) =>
        e.uid === uid ? { ...e, seen: true } : e
      );
      const unreadEmails = emails.filter((e) => !e.seen).length;
      return { selectedEmailUid: uid, emails, unreadEmails };
    }),
  markEmailSeen: (uid) =>
    set((s) => ({
      emails: s.emails.map((e) => (e.uid === uid ? { ...e, seen: true } : e)),
      unreadEmails: Math.max(0, s.unreadEmails - 1),
    })),

  sessions: [],
  selectedSessionId: null,
  unreadChats: 0,
  setSessions: (sessions) =>
    set({ sessions, unreadChats: sessions.filter((s) => s.status === "human").length }),
  upsertSession: (session) =>
    set((s) => {
      const exists = s.sessions.some((x) => x.id === session.id);
      const sessions = exists
        ? s.sessions.map((x) => (x.id === session.id ? session : x))
        : [session, ...s.sessions];
      sessions.sort((a, b) => b.updatedAt - a.updatedAt);
      const unreadChats = sessions.filter((x) => x.status === "human").length;
      return { sessions, unreadChats };
    }),
  appendChatMessage: (sessionId, msg) =>
    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId
          ? { ...sess, messages: [...sess.messages, msg], updatedAt: msg.ts }
          : sess
      ),
    })),
  selectSession: (id) => {
    set((s) => {
      if (!id) return { selectedSessionId: null };
      const sessions = s.sessions.map((sess) =>
        sess.id === id && sess.status === "human"
          ? { ...sess, status: "human" as const }
          : sess
      );
      const unreadChats = sessions.filter((x) => x.status === "human").length;
      return { selectedSessionId: id, sessions, unreadChats };
    });
  },
  decrementUnreadChats: () =>
    set((s) => ({ unreadChats: Math.max(0, s.unreadChats - 1) })),

  activePane: "email",
  setActivePane: (pane) => set({ activePane: pane }),
  navigateTo: (pane, id) => {
    const s = get();
    set({ activePane: pane });
    if (pane === "email") s.selectEmail(id);
    else s.selectSession(id);
  },
}));
