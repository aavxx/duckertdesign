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

  let sessionId: string, content: string;
  try {
    ({ sessionId, content } = await req.json());
  } catch {
    return new Response("Bad request", { status: 400, headers: corsHeaders() });
  }

  if (!sessionId || !content?.trim()) {
    return new Response("Missing sessionId or content", { status: 400, headers: corsHeaders() });
  }

  const raw = await redis.get<string>(`chat:session:${sessionId}`);
  if (!raw) return new Response("Session not found", { status: 404, headers: corsHeaders() });

  const session: ChatSession = typeof raw === "string" ? JSON.parse(raw) : raw as ChatSession;

  const msg: ChatMessage = {
    id: crypto.randomUUID(),
    role: "admin",
    content: content.trim(),
    ts: Date.now(),
  };

  session.messages.push(msg);
  session.updatedAt = Date.now();
  session.status = "human";

  await redis.set(`chat:session:${sessionId}`, JSON.stringify(session));

  // Push to customer's widget SSE
  await redis.publish(`chat:reply:${sessionId}`, JSON.stringify(msg));

  // Notify admin SSE feed so the reply appears in Mac app immediately
  const event: AdminEvent = {
    type: "new_chat_message",
    sessionId,
    messageId: msg.id,
    content: msg.content,
    role: "admin",
    ts: msg.ts,
  };
  await redis.publish("admin:events", JSON.stringify(event));

  return Response.json({ ok: true, messageId: msg.id }, { headers: corsHeaders() });
}
