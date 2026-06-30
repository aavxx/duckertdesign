import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";
import type { FaqEntry } from "@/lib/faq";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { id } = await params;
  const { category, question, answer } = await req.json() as Partial<FaqEntry>;

  if (!category) return new Response("Missing category", { status: 400 });

  const raw = await redis.get<string>(`faq:${category}:${id}`);
  if (!raw) return new Response("Not found", { status: 404 });

  const entry: FaqEntry = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (question) entry.question = question.trim();
  if (answer) entry.answer = answer.trim();
  entry.updatedAt = Date.now();

  await redis.set(`faq:${category}:${id}`, JSON.stringify(entry));
  return Response.json({ ok: true, entry });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { id } = await params;
  const url = new URL(req.url);
  const category = url.searchParams.get("category") as "admin" | "customer" | null;
  if (!category) return new Response("Missing category", { status: 400 });

  await redis.del(`faq:${category}:${id}`);
  await redis.srem(`faq:${category}:idx`, id);
  return Response.json({ ok: true });
}
