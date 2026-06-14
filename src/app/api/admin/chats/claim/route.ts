import { requireAdminKey } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { redis } from "@/lib/redis";
import type { ChatSession, AdminEvent } from "@/lib/types";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  const authErr = await requireAdminKey(req);
  if (authErr) return authErr;

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
  if (!raw) return new Response("Session not found", { status: 404, headers: corsHeaders() });

  const session: ChatSession = typeof raw === "string" ? JSON.parse(raw) : (raw as ChatSession);
  session.status = "claimed";
  session.claimedAt = now;
  session.updatedAt = now;

  await redis.set(`chat:session:${sessionId}`, JSON.stringify(session));

  const event: AdminEvent = { type: "chat_claimed", sessionId, ts: now };
  await redis.publish("admin:events", JSON.stringify(event)).catch(() => {});

  return Response.json({ ok: true }, { headers: corsHeaders() });
}
