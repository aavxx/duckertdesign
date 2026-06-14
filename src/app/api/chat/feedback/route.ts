import { corsHeaders } from "@/lib/cors";
import { redis } from "@/lib/redis";
import type { Feedback } from "@/lib/types";

const FEEDBACK_TTL = 360 * 24 * 60 * 60; // ~360 days in seconds

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  let sessionId: string, rating: number;
  try {
    ({ sessionId, rating } = await req.json());
  } catch {
    return new Response("Bad request", { status: 400, headers: corsHeaders() });
  }

  if (!sessionId || typeof rating !== "number") {
    return new Response("Missing sessionId or rating", { status: 400, headers: corsHeaders() });
  }

  const id = crypto.randomUUID();
  const createdAt = Date.now();
  const feedback: Feedback = { id, sessionId, rating, createdAt };

  await redis.set(`chat:feedback:${id}`, JSON.stringify(feedback), { ex: FEEDBACK_TTL });
  await redis.zadd("chat:feedback:index", { score: createdAt, member: id });
  await redis.expire("chat:feedback:index", FEEDBACK_TTL).catch(() => {});

  return Response.json({ ok: true }, { headers: corsHeaders() });
}
