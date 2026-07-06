import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getChatSession, saveChatSession } from "@/lib/chatStore";
import type { AdminEvent } from "@/lib/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { id } = await params;
  const session = await getChatSession(id);
  if (!session) return new Response("Not found", { status: 404 });

  session.status = "closed";
  session.closedAt = Date.now();
  session.updatedAt = Date.now();
  await saveChatSession(session);

  const event: AdminEvent = { type: "chat_closed", sessionId: id, ts: Date.now() };
  await redis.publish("admin:events", JSON.stringify(event)).catch(() => {});

  return Response.json({ ok: true });
}
