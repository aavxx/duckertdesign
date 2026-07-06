import { corsHeaders } from "@/lib/cors";
import { redis } from "@/lib/redis";
import { getChatSession, saveChatSession } from "@/lib/chatStore";
import type { ChatMessage } from "@/lib/types";

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

  const session = await getChatSession(sessionId);
  if (session) {
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
    await saveChatSession(session);
  }

  try {
    await redis.publish(
      "admin:events",
      JSON.stringify({ type: "chat_closed", sessionId, ts: now })
    );
  } catch {}

  return Response.json({ ok: true }, { headers: corsHeaders() });
}
