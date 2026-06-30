import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";
import type { ChatSession, ChatMessage, AdminEvent } from "@/lib/types";

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
  const { content } = await req.json() as { content: string };
  if (!content?.trim()) return new Response("Content required", { status: 400 });

  const msg: ChatMessage = {
    id: crypto.randomUUID(),
    role: "admin",
    content: content.trim(),
    ts: Date.now(),
  };

  session.messages.push(msg);
  session.updatedAt = Date.now();
  if (session.status !== "claimed") session.status = "human";

  await redis.set(`chat:session:${id}`, JSON.stringify(session));
  await redis.zadd("inbox:idx", { score: session.updatedAt, member: `chat:${id}` });

  // Push to customer widget
  await redis.publish(`chat:reply:${id}`, JSON.stringify(msg)).catch(() => {});

  // Notify admin SSE (so other admin tabs update)
  const event: AdminEvent = {
    type: "new_chat_message",
    sessionId: id,
    messageId: msg.id,
    content: msg.content,
    role: "admin",
    ts: msg.ts,
  };
  await redis.publish("admin:events", JSON.stringify(event)).catch(() => {});

  return Response.json({ ok: true, messageId: msg.id });
}
