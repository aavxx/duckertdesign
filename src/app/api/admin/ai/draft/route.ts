import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getFaqEntries, faqToPromptBlock } from "@/lib/faq";
import type { ChatSession, EmailThread } from "@/lib/types";

export async function POST(req: Request) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { type, id } = await req.json() as { type: "chat" | "email"; id: string };
  if (!type || !id) return new Response("Missing type or id", { status: 400 });

  const [context, faqEntries] = await Promise.all([
    redis.get<string>("ai:context").then((v) => v ?? ""),
    getFaqEntries("admin"),
  ]);

  let conversationSummary = "";

  if (type === "chat") {
    const raw = await redis.get<string>(`chat:session:${id}`);
    if (!raw) return new Response("Not found", { status: 404 });
    const session: ChatSession = typeof raw === "string" ? JSON.parse(raw) : raw;
    conversationSummary = session.messages
      .filter((m) => m.role !== "system")
      .slice(-10)
      .map((m) => `${m.role === "user" ? "Kunde" : "Support"}: ${m.content}`)
      .join("\n");
  } else {
    const raw = await redis.get<string>(`email:thread:${id}`);
    if (!raw) return new Response("Not found", { status: 404 });
    const thread: EmailThread = typeof raw === "string" ? JSON.parse(raw) : raw;
    conversationSummary = thread.messages
      .slice(-6)
      .map((m) => `${m.direction === "inbound" ? "Kunde" : "Support"} (${m.subject}): ${m.text ?? ""}`)
      .join("\n\n");
  }

  const faqBlock = faqToPromptBlock(faqEntries);

  const systemPrompt = `Du er en professionel kundesupportmedarbejder hos Duckert Design — et dansk webdesign-studie. Svar altid på dansk, i "jeg" eller "vi" form afhængig af kontekst.

${context ? `Yderligere kontekst:\n${context}\n\n` : ""}${faqBlock ? `FAQ-vidensbase (brug disse svar som grundlag når relevant):\n\n${faqBlock}\n\n` : ""}Skriv et kortfattet, venligt og professionelt svar til kunden baseret på samtalen nedenfor.

VIGTIGT: Svar KUN med en JSON-objekt i dette format — ingen tekst udenfor JSON:
{
  "draft": "dit svartekst her",
  "sources": ["A1", "A3"]
}

- "draft": dit faktiske svartekst som du vil sende til kunden. Ingen FAQ-ID'er eller kildehenvisninger her.
- "sources": en liste over FAQ-ID'er (f.eks. ["A1", "A7"]) som du baserede svaret på. Tom liste hvis ingen FAQ var relevant.`;

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Samtale:\n${conversationSummary}\n\nSkriv dit svar som JSON:` },
      ],
      max_tokens: 600,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!groqRes.ok) {
    const err = await groqRes.text();
    return Response.json({ error: `Groq fejl: ${err}` }, { status: 502 });
  }

  const data = await groqRes.json() as { choices: Array<{ message: { content: string } }> };
  const raw = data.choices?.[0]?.message?.content?.trim() ?? "{}";

  let draft = "";
  let sources: string[] = [];

  try {
    const parsed = JSON.parse(raw) as { draft?: string; sources?: string[] };
    draft = parsed.draft ?? "";
    sources = Array.isArray(parsed.sources) ? parsed.sources : [];
  } catch {
    draft = raw;
  }

  // Enrich sources with question text for display in admin UI
  const sourceDetails = sources
    .map((sid) => faqEntries.find((e) => e.id === sid))
    .filter(Boolean)
    .map((e) => ({ id: e!.id, question: e!.question }));

  return Response.json({ draft, sources, sourceDetails });
}
