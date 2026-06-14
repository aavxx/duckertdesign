import { requireAdminKey } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { redis } from "@/lib/redis";
import type { Feedback } from "@/lib/types";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: Request) {
  const authErr = await requireAdminKey(req);
  if (authErr) return authErr;

  // Newest first
  const ids = await redis.zrange<string[]>("chat:feedback:index", 0, -1, { rev: true });
  if (!ids || !ids.length) return Response.json([], { headers: corsHeaders() });

  const items: Feedback[] = [];
  for (const id of ids) {
    const raw = await redis.get<string>(`chat:feedback:${id}`);
    if (raw) {
      try {
        items.push(typeof raw === "string" ? JSON.parse(raw) : (raw as Feedback));
      } catch {}
    }
  }

  return Response.json(items, { headers: corsHeaders() });
}
