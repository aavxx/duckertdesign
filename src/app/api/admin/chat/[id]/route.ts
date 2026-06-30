import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";
import type { ChatSession } from "@/lib/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { id } = await params;
  const raw = await redis.get<string>(`chat:session:${id}`);
  if (!raw) return new Response("Not found", { status: 404 });

  const session: ChatSession = typeof raw === "string" ? JSON.parse(raw) : raw;
  return Response.json(session);
}
