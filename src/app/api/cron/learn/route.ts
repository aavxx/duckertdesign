import { supabase } from "@/lib/supabase";
import { getFaqEntries } from "@/lib/faq";
import type { ChatMessage } from "@/lib/types";

// Daily auto-learn job (vercel.json cron): distills recent chat conversations
// into new Q&A entries in the AI knowledge base (faq_entries, source='learned'),
// so the assistant improves from real conversations before they are deleted
// by the 30-day retention cleanup.

const MAX_SESSIONS_PER_RUN = 20;
const MAX_NEW_ENTRIES_PER_RUN = 3;
const MAX_LEARNED_TOTAL = 60;

type SessionRow = { id: string; messages: ChatMessage[] };

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return Response.json({ ok: false, error: "GROQ_API_KEY missing" }, { status: 500 });

  // Sessions not yet learned from, settled for at least an hour, with a real conversation
  const settledBefore = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, messages")
    .eq("learned", false)
    .lt("updated_at", settledBefore)
    .gt("expires_at", new Date().toISOString())
    .order("updated_at", { ascending: true })
    .limit(MAX_SESSIONS_PER_RUN);

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  const sessions = ((data ?? []) as SessionRow[]).filter(
    (s) => (s.messages ?? []).filter((m) => m.role === "user").length >= 2
  );
  const skipped = ((data ?? []) as SessionRow[]).filter((s) => !sessions.includes(s));

  // Too-short sessions are marked learned so they aren't re-scanned every run
  if (skipped.length) {
    await supabase.from("chat_sessions").update({ learned: true }).in("id", skipped.map((s) => s.id));
  }

  if (!sessions.length) return Response.json({ ok: true, learned: 0, scanned: 0 });

  const existing = await getFaqEntries("customer");
  const learnedCount = existing.filter((e) => e.source === "learned").length;
  if (learnedCount >= MAX_LEARNED_TOTAL) {
    return Response.json({ ok: true, learned: 0, reason: "learned cap reached" });
  }

  const transcripts = sessions
    .map((s, i) => {
      const lines = s.messages
        .filter((m) => m.role !== "system")
        .map((m) => `${m.role === "user" ? "Kunde" : "AI"}: ${m.content}`)
        .join("\n");
      return `--- Samtale ${i + 1} ---\n${lines}`;
    })
    .join("\n\n");

  const existingQuestions = existing.map((e) => `- ${e.question}`).join("\n");

  const systemPrompt = `Du analyserer kundesamtaler for Duckert Design (dansk webdesign-studie) og udtrækker ny, genbrugelig viden til chatbot'ens vidensbase.

Regler:
- Udtræk KUN spørgsmål/svar-par der er generelt nyttige for fremtidige kunder — ingen personoplysninger, navne, e-mails eller enkeltsags-detaljer.
- Spring alt over der allerede er dækket af de eksisterende spørgsmål nedenfor.
- Svar skal være korrekte ud fra samtalerne — opfind ALDRIG priser eller løfter.
- Maks ${MAX_NEW_ENTRIES_PER_RUN} nye par. Returnér en tom liste hvis intet nyt er lærerigt.
- Skriv på dansk, kortfattet og professionelt i "vi"-form.

Eksisterende spørgsmål i vidensbasen:
${existingQuestions || "(ingen)"}

Svar KUN med JSON i dette format:
{"entries": [{"question": "...", "answer": "..."}]}`;

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 800,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Samtaler:\n\n${transcripts}` },
      ],
    }),
  });

  if (!groqRes.ok) {
    return Response.json({ ok: false, error: `Groq ${groqRes.status}` }, { status: 502 });
  }

  const completion = await groqRes.json() as { choices?: Array<{ message?: { content?: string } }> };
  let entries: Array<{ question?: string; answer?: string }> = [];
  try {
    entries = (JSON.parse(completion.choices?.[0]?.message?.content ?? "{}").entries ?? []) as typeof entries;
  } catch {}

  const valid = entries
    .filter((e) => e.question?.trim() && e.answer?.trim())
    .slice(0, Math.min(MAX_NEW_ENTRIES_PER_RUN, MAX_LEARNED_TOTAL - learnedCount));

  if (valid.length) {
    const ts = Date.now().toString(36);
    await supabase.from("faq_entries").insert(
      valid.map((e, i) => ({
        id: `L${ts}${i}`,
        category: "customer" as const,
        question: e.question!.trim(),
        answer: e.answer!.trim(),
        source: "learned" as const,
      }))
    );
  }

  await supabase.from("chat_sessions").update({ learned: true }).in("id", sessions.map((s) => s.id));

  return Response.json({ ok: true, scanned: sessions.length, learned: valid.length });
}
