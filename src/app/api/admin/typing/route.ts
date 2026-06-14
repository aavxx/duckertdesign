import { requireAdminKey } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { redis } from "@/lib/redis";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  const authErr = await requireAdminKey(req);
  if (authErr) return authErr;

  let sessionId: string, typing: boolean;
  try {
    ({ sessionId, typing } = await req.json());
  } catch {
    return new Response("Bad request", { status: 400, headers: corsHeaders() });
  }

  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400, headers: corsHeaders() });
  }

  try {
    await redis.publish(
      `chat:reply:${sessionId}`,
      JSON.stringify({ type: "typing", who: "agent", typing: !!typing })
    );
  } catch {}

  return Response.json({ ok: true }, { headers: corsHeaders() });
}
