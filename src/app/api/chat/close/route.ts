import { corsHeaders } from "@/lib/cors";
import { redis } from "@/lib/redis";
import type { ChatSession, ChatMessage } from "@/lib/types";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  let sessionId: string;
  try {
    ({ sessionId } = await req.json());
  } catch {
    return new Response("Bad request", { status: 400, headers: corsHeaders() });
  }

  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400, headers: corsHeaders() });
  }

  const now = Date.now();

  const raw = await redis.get<string>(`chat:session:${sessionId}`);
  if (raw) {
    const session: ChatSession = typeof raw === "string" ? JSON.parse(raw) : (raw as ChatSession);
    session.status = "closed";
    session.closedAt = now;
    session.updatedAt = now;
    const sysMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "system",
      content: "Chat Afsluttet",
      ts: now,
    };
    session.messages.push(sysMsg);
    await redis.set(`chat:session:${sessionId}`, JSON.stringify(session));
  }

  try {
    await redis.publish(
      `chat:reply:${sessionId}`,
      JSON.stringify({ type: "system", content: "Chat Afsluttet" })
    );
  } catch {}

  try {
    await redis.publish(
      "admin:events",
      JSON.stringify({ type: "chat_closed", sessionId, ts: now })
    );
  } catch {}

  return Response.json({ ok: true }, { headers: corsHeaders() });
}
