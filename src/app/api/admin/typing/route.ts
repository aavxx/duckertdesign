import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { sessionId, typing } = await req.json() as { sessionId: string; typing: boolean };
  if (!sessionId) return new Response("Missing sessionId", { status: 400 });

  await redis.publish(`chat:reply:${sessionId}`, JSON.stringify({ type: "typing", who: "agent", typing })).catch(() => {});
  return Response.json({ ok: true });
}
