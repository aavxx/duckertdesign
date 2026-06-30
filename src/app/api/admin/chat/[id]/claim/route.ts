import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";
import type { ChatSession, AdminEvent } from "@/lib/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { id } = await params;
  const raw = await redis.get<string>(`chat:session:${id}`);
  if (!raw) return new Response("Not found", { status: 404 });

  const session: ChatSession = typeof raw === "string" ? JSON.parse(raw) : raw;
  session.status = "claimed";
  session.claimedAt = Date.now();
  session.updatedAt = Date.now();

  await redis.set(`chat:session:${id}`, JSON.stringify(session));

  // Notify customer widget that a human took over
  await redis.publish(`chat:reply:${id}`, JSON.stringify({ type: "claimed" })).catch(() => {});

  const event: AdminEvent = { type: "chat_claimed", sessionId: id, ts: Date.now() };
  await redis.publish("admin:events", JSON.stringify(event)).catch(() => {});

  return Response.json({ ok: true });
}
