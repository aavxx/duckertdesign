import { requireAdminKey } from "@/lib/auth";
import { redis } from "@/lib/redis";
import type { ChatSession } from "@/lib/types";

export async function GET(req: Request) {
  const authErr = requireAdminKey(req);
  if (authErr) return authErr;

  const ids = await redis.smembers("chat:sessions:index");
  if (!ids.length) return Response.json([]);

  const sessions: ChatSession[] = [];
  for (const id of ids) {
    const raw = await redis.get<string>(`chat:session:${id}`);
    if (raw) {
      try {
        sessions.push(typeof raw === "string" ? JSON.parse(raw) : raw as ChatSession);
      } catch {}
    }
  }

  sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  return Response.json(sessions);
}
