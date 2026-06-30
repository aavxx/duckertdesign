import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";
import type { EmailThread } from "@/lib/types";

export async function GET(req: Request) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const ids = await redis.zrange("email:threads:idx", 0, 99, { rev: true });
  if (!ids.length) return Response.json([]);

  const threads: EmailThread[] = [];
  for (const id of ids) {
    const raw = await redis.get<string>(`email:thread:${id}`);
    if (!raw) continue;
    try {
      const t: EmailThread = typeof raw === "string" ? JSON.parse(raw) : raw;
      threads.push({ ...t, messages: [] });
    } catch {}
  }

  return Response.json(threads);
}
