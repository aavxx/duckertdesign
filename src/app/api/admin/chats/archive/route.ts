import { requireAdminKey } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { redis } from "@/lib/redis";
import type { ChatSession, ChatMessage } from "@/lib/types";

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
  const TTL_30_DAYS = 30 * 24 * 60 * 60;

  const raw = await redis.get<string>(`chat:session:${sessionId}`);
  if (!raw) return new Response("Session not found", { status: 404, headers: corsHeaders() });

  const session: ChatSession = typeof raw === "string" ? JSON.parse(raw) : (raw as ChatSession);

  if (sendMessage) {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "admin",
      content: sendMessage,
      ts: now,
    };
    session.messages.push(msg);
    await redis.publish(`chat:reply:${sessionId}`, JSON.stringify(msg)).catch(() => {});
  }

  session.status = "archived";
  session.archivedAt = now;
  session.updatedAt = now;

  // Store with 30-day TTL
  await redis.set(`chat:session:${sessionId}`, JSON.stringify(session), { ex: TTL_30_DAYS });

  // Notify customer that chat ended
  await redis.publish(`chat:reply:${sessionId}`, JSON.stringify({ type: "system", content: "Chat Afsluttet" })).catch(() => {});
  // Notify admin panel
  await redis.publish("admin:events", JSON.stringify({ type: "chat_archived", sessionId, ts: now })).catch(() => {});

  return Response.json({ ok: true }, { headers: corsHeaders() });
}
