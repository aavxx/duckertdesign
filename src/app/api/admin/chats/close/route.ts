import { requireAdminKey } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { redis } from "@/lib/redis";
import type { ChatSession, ChatMessage, AdminEvent } from "@/lib/types";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  const authErr = await requireAdminKey(req);
  if (authErr) return authErr;

  let sessionId: string, sendMessage: string | undefined;
  try {
    ({ sessionId, sendMessage } = await req.json());
  } catch {
    return new Response("Bad request", { status: 400, headers: corsHeaders() });
  }

  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400, headers: corsHeaders() });
  }

  const now = Date.now();

  const raw = await redis.get<string>(`chat:session:${sessionId}`);
  if (!raw) return new Response("Session not found", { status: 404, headers: corsHeaders() });

  const session: ChatSession = typeof raw === "string" ? JSON.parse(raw) : (raw as ChatSession);

  // Optional goodbye message from the agent
  if (sendMessage && sendMessage.trim()) {
    const adminMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "admin",
      content: sendMessage.trim(),
      ts: now,
    };
    session.messages.push(adminMsg);
    await redis.publish(`chat:reply:${sessionId}`, JSON.stringify(adminMsg)).catch(() => {});
    const msgEvent: AdminEvent = {
      type: "new_chat_message",
      sessionId,
      messageId: adminMsg.id,
      content: adminMsg.content,
      role: "admin",
      ts: now,
    };
    await redis.publish("admin:events", JSON.stringify(msgEvent)).catch(() => {});
  }

  const sysMsg: ChatMessage = {
    id: crypto.randomUUID(),
    role: "system",
    content: "Chat Afsluttet",
    ts: Date.now(),
  };
  session.messages.push(sysMsg);
  session.status = "closed";
  session.closedAt = now;
  session.updatedAt = Date.now();

  await redis.set(`chat:session:${sessionId}`, JSON.stringify(session));

  await redis
    .publish(`chat:reply:${sessionId}`, JSON.stringify({ type: "system", content: "Chat Afsluttet" }))
    .catch(() => {});

  const closedEvent: AdminEvent = { type: "chat_closed", sessionId, ts: now };
  await redis.publish("admin:events", JSON.stringify(closedEvent)).catch(() => {});

  return Response.json({ ok: true }, { headers: corsHeaders() });
}
