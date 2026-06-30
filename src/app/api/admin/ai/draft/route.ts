import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";
import type { ChatSession, EmailThread } from "@/lib/types";

export async function POST(req: Request) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { type, id } = await req.json() as { type: "chat" | "email"; id: string };

  if (!type || !id) return new Response("Missing type or id", { status: 400 });

  const context = await redis.get<string>("ai:context") ?? "";

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

  const systemPrompt = `Du er en venlig og professionel kundesupportmedarbejder hos Duckert Design. Svar altid på dansk.

${context ? `Virksomhedsinfo:\n${context}\n` : ""}
Skriv et passende og kortfattet svar til kunden baseret på samtalen nedenfor. Svar direkte til kunden — ingen noter eller forklaringer.`;

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
        { role: "user", content: `Samtale:\n${conversationSummary}\n\nSkriv dit svar:` },
      ],
      max_tokens: 400,
      temperature: 0.4,
    }),
  });

  if (!groqRes.ok) {
    const err = await groqRes.text();
    return Response.json({ error: `Groq fejl: ${err}` }, { status: 502 });
  }

  const data = await groqRes.json() as { choices: Array<{ message: { content: string } }> };
  const draft = data.choices?.[0]?.message?.content?.trim() ?? "";

  return Response.json({ draft });
}
