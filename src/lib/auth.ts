import { corsHeaders } from "@/lib/cors";
import { redis } from "@/lib/redis";

export async function requireAdminKey(req: Request): Promise<Response | null> {
  const key = req.headers.get("x-admin-key");
  if (!key) return new Response("Unauthorized", { status: 401, headers: corsHeaders() });

  // Legacy API key (kept for backwards compat)
  if (process.env.ADMIN_API_KEY && key === process.env.ADMIN_API_KEY) return null;

  // OTP session token
  const valid = await redis.get(`admin:session:${key}`);
  if (valid) {
    // Sliding 15-minute window: reset TTL on each authenticated request
    await redis.expire(`admin:session:${key}`, 900).catch(() => {});
    return null;
  }

  return new Response("Unauthorized", { status: 401, headers: corsHeaders() });
}
