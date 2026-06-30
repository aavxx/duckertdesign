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
  const { message } = await req.json().catch(() => ({ message: undefined })) as { message?: string };

  if (message?.trim()) {
    const farewell: ChatMessage = {
      id: crypto.randomUUID(),
      role: "admin",
      content: message.trim(),
      ts: Date.now(),
    };
    session.messages.push(farewell);
    await redis.publish(`chat:reply:${id}`, JSON.stringify(farewell)).catch(() => {});
  }

  // Send system close event to customer widget
  await redis.publish(`chat:reply:${id}`, JSON.stringify({ type: "system", content: "Chat Afsluttet" })).catch(() => {});

  session.status = "closed";
  session.closedAt = Date.now();
  session.updatedAt = Date.now();

  await redis.set(`chat:session:${id}`, JSON.stringify(session));

  const event: AdminEvent = { type: "chat_closed", sessionId: id, ts: Date.now() };
  await redis.publish("admin:events", JSON.stringify(event)).catch(() => {});

  return Response.json({ ok: true });
}
