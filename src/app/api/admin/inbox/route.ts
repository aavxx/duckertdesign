import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";
import type { ChatSession, EmailThread } from "@/lib/types";

type InboxEntry =
  | { kind: "chat"; id: string; score: number; status: ChatSession["status"]; preview: string; updatedAt: number }
  | { kind: "email"; id: string; score: number; status: EmailThread["status"]; subject: string; from: string; updatedAt: number };

export async function GET(req: Request) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  // Get top 100 most recent items from unified inbox
  const members = await redis.zrange("inbox:idx", 0, 99, { rev: true, withScores: true });

  if (!members.length) return Response.json([]);

  const entries: InboxEntry[] = [];

  // members alternates [member, score, member, score, ...]
  for (let i = 0; i < members.length; i += 2) {
    const raw = members[i] as string;
    const score = Number(members[i + 1]);

    if (raw.startsWith("chat:")) {
      const id = raw.slice(5);
      const data = await redis.get<string>(`chat:session:${id}`);
      if (!data) continue;
      const session: ChatSession = typeof data === "string" ? JSON.parse(data) : data;
      const lastMsg = session.messages.at(-1);
      entries.push({
        kind: "chat",
        id,
        score,
        status: session.status,
        preview: lastMsg?.content?.slice(0, 120) ?? "",
        updatedAt: session.updatedAt,
      });
    } else if (raw.startsWith("email:")) {
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
  }

  return Response.json(entries);
}
