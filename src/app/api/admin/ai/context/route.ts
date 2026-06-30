import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";

export async function GET(req: Request) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const context = await redis.get<string>("ai:context") ?? "";
  return Response.json({ context });
}

export async function POST(req: Request) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { context } = await req.json() as { context: string };
  if (typeof context !== "string") return new Response("Invalid context", { status: 400 });

  await redis.set("ai:context", context);
  return Response.json({ ok: true });
}
