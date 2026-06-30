import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getFaqEntries } from "@/lib/faq";
import type { FaqEntry } from "@/lib/faq";

export async function GET(req: Request) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const url = new URL(req.url);
  const category = url.searchParams.get("category") as "admin" | "customer" | null;

  if (category) {
    return Response.json(await getFaqEntries(category));
  }

  const [adminEntries, customerEntries] = await Promise.all([
    getFaqEntries("admin"),
    getFaqEntries("customer"),
  ]);
  return Response.json({ admin: adminEntries, customer: customerEntries });
}

export async function POST(req: Request) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { category, question, answer, id: customId } = await req.json() as {
    category: "admin" | "customer";
    question: string;
    answer: string;
    id?: string;
  };

  if (!category || !question?.trim() || !answer?.trim()) {
    return new Response("Missing fields", { status: 400 });
  }

  const id = customId ?? crypto.randomUUID().slice(0, 8);
  const now = Date.now();
  const entry: FaqEntry = { id, category, question: question.trim(), answer: answer.trim(), createdAt: now, updatedAt: now };

  await redis.set(`faq:${category}:${id}`, JSON.stringify(entry));
  await redis.sadd(`faq:${category}:idx`, id);

  return Response.json({ ok: true, entry });
}
