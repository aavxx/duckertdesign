import { supabase } from "@/lib/supabase";

// Daily retention job (vercel.json cron): permanently deletes chat sessions
// and feedback older than 30 days, as promised in the privacy policy.

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date().toISOString();

  const { count: sessions, error: sessErr } = await supabase
    .from("chat_sessions")
    .delete({ count: "exact" })
    .lt("expires_at", now);

  const { count: feedback, error: fbErr } = await supabase
    .from("chat_feedback")
    .delete({ count: "exact" })
    .lt("expires_at", now);

  if (sessErr || fbErr) {
    return Response.json(
      { ok: false, error: sessErr?.message ?? fbErr?.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, deleted: { sessions: sessions ?? 0, feedback: feedback ?? 0 } });
}
