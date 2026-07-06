import { requireAdmin } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { rowToFaq } from "@/lib/faq";
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

  const patch: Record<string, string> = { updated_at: new Date().toISOString() };
  if (question) patch.question = question.trim();
  if (answer) patch.answer = answer.trim();

  const { data, error } = await supabase
    .from("faq_entries")
    .update(patch)
    .eq("category", category)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return new Response(error.message, { status: 500 });
  if (!data) return new Response("Not found", { status: 404 });
  return Response.json({ ok: true, entry: rowToFaq(data) });
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

  const { error } = await supabase
    .from("faq_entries")
    .delete()
    .eq("category", category)
    .eq("id", id);

  if (error) return new Response(error.message, { status: 500 });
  return Response.json({ ok: true });
}
