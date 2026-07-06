import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { listChatSessions } from "@/lib/chatStore";
import type { ChatSession, EmailThread } from "@/lib/types";

type InboxEntry =
  | { kind: "chat"; id: string; score: number; status: ChatSession["status"]; preview: string; updatedAt: number }
  | { kind: "email"; id: string; score: number; status: EmailThread["status"]; subject: string; from: string; updatedAt: number };

export async function GET(req: Request) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const entries: InboxEntry[] = [];

  // Chats live in Supabase (30-day retention)
  const sessions = await listChatSessions(100);
  for (const session of sessions) {
    const lastMsg = session.messages.at(-1);
    entries.push({
      kind: "chat",
      id: session.id,
      score: session.updatedAt,
      status: session.status,
      preview: lastMsg?.content?.slice(0, 120) ?? "",
      updatedAt: session.updatedAt,
    });
  }

  // Emails still live in Redis
  const members = await redis.zrange("inbox:idx", 0, 99, { rev: true, withScores: true });
  for (let i = 0; i < members.length; i += 2) {
    const raw = members[i] as string;
    const score = Number(members[i + 1]);
    if (!raw.startsWith("email:")) continue;

    const id = raw.slice(6);
    const data = await redis.get<string>(`email:thread:${id}`);
    if (!data) continue;
    const thread: EmailThread = typeof data === "string" ? JSON.parse(data) : data;
    entries.push({
      kind: "email",
      id,
      score,
      status: thread.status,
      subject: thread.subject,
      from: thread.participants[0] ?? "",
      updatedAt: thread.updatedAt,
    });
  }

  entries.sort((a, b) => b.score - a.score);
  return Response.json(entries.slice(0, 100));
}
