import { supabase } from "@/lib/supabase";
import type { ChatSession, ChatMessage } from "@/lib/types";

// Chat sessions live in Supabase (table chat_sessions) with a 30-day expiry.
// Rows past expires_at are ignored on read and purged by /api/cron/cleanup.

type ChatSessionRow = {
  id: string;
  status: ChatSession["status"];
  messages: ChatMessage[];
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  archived_at: string | null;
};

function rowToSession(row: ChatSessionRow): ChatSession {
  return {
    id: row.id,
    status: row.status,
    messages: row.messages ?? [],
    tags: row.tags ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    closedAt: row.closed_at ? new Date(row.closed_at).getTime() : undefined,
    archivedAt: row.archived_at ? new Date(row.archived_at).getTime() : undefined,
  };
}

export async function getChatSession(id: string): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, status, messages, tags, created_at, updated_at, closed_at, archived_at")
    .eq("id", id)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error || !data) return null;
  return rowToSession(data as ChatSessionRow);
}

export async function saveChatSession(session: ChatSession): Promise<void> {
  const { error } = await supabase.from("chat_sessions").upsert({
    id: session.id,
    status: session.status,
    messages: session.messages,
    tags: session.tags ?? [],
    created_at: new Date(session.createdAt).toISOString(),
    updated_at: new Date(session.updatedAt).toISOString(),
    closed_at: session.closedAt ? new Date(session.closedAt).toISOString() : null,
    archived_at: session.archivedAt ? new Date(session.archivedAt).toISOString() : null,
  });
  if (error) console.error("Supabase saveChatSession error:", error.message);
}

export async function listChatSessions(limit = 100): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, status, messages, tags, created_at, updated_at, closed_at, archived_at")
    .gt("expires_at", new Date().toISOString())
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as ChatSessionRow[]).map(rowToSession);
}
