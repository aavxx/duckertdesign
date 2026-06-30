import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  let sub: object;
  try {
    sub = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!sub || typeof sub !== "object") return new Response("Invalid subscription", { status: 400 });

  await redis.sadd("push:subs", JSON.stringify(sub));
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  let sub: object;
  try {
    sub = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  await redis.srem("push:subs", JSON.stringify(sub));
  return Response.json({ ok: true });
}
