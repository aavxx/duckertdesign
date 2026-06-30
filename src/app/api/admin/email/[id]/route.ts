import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";
import type { EmailThread } from "@/lib/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { id } = await params;
  const raw = await redis.get<string>(`email:thread:${id}`);
  if (!raw) return new Response("Not found", { status: 404 });

  const thread: EmailThread = typeof raw === "string" ? JSON.parse(raw) : raw;

  // Mark as open when viewed
  if (thread.status === "new") {
    thread.status = "open";
    await redis.set(`email:thread:${id}`, JSON.stringify(thread));
  }

  return Response.json(thread);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { id } = await params;
  const raw = await redis.get<string>(`email:thread:${id}`);
  if (!raw) return new Response("Not found", { status: 404 });

  const thread: EmailThread = typeof raw === "string" ? JSON.parse(raw) : raw;
  const updates = await req.json() as Partial<Pick<EmailThread, "status" | "tags">>;

  if (updates.status) thread.status = updates.status;
  if (updates.tags) thread.tags = updates.tags;

  await redis.set(`email:thread:${id}`, JSON.stringify(thread));
  return Response.json({ ok: true });
}
