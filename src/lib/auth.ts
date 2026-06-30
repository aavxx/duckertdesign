import { redis } from "@/lib/redis";

export async function requireAdmin(req: Request): Promise<Response | null> {
  const token = req.headers.get("x-admin-key");
  if (!token) return new Response("Unauthorized", { status: 401 });

  const email = await redis.get<string>(`admin:session:${token}`);
  if (!email) return new Response("Unauthorized", { status: 401 });

  // Sliding 1-hour window
  await redis.expire(`admin:session:${token}`, 3600).catch(() => {});
  return null;
}
