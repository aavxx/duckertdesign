import { corsHeaders } from "@/lib/cors";
import { redis } from "@/lib/redis";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
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
      "admin:events",
      JSON.stringify({
        type: "customer_typing",
        sessionId,
        typing: !!typing,
        ts: Date.now(),
      })
    );
  } catch {}

  return Response.json({ ok: true }, { headers: corsHeaders() });
}
