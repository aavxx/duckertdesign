import { requireAdminKey } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { redis } from "@/lib/redis";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  const authErr = await requireAdminKey(req);
  if (authErr) return authErr;

  const ids = await redis.smembers<string[]>("chat:sessions:index");
  let cleared = 0;
  for (const id of (ids ?? [])) {
    await redis.del(`chat:session:${id}`);
    cleared++;
  }
  await redis.del("chat:sessions:index");

  return Response.json({ ok: true, cleared }, { headers: corsHeaders() });
}
