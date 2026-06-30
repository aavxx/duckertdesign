import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { getFaqEntries, faqToPromptBlock } from "@/lib/faq";
import type { ChatSession, ChatMessage, AdminEvent } from "@/lib/types";

const BASE_SYSTEM_PROMPT = `Du er Duckerts virtuelle assistent — en hjælpsom og professionel chatbot for Duckert Design, et dansk webdesign-studie.

Om Duckert Design:
- Duckert Design er et dansk webdesign-studie specialiseret i minimalistisk, professionelt webdesign og webudvikling.
- Vi tilbyder: Webdesign (landing pages, e-commerce, portfolios), UI/UX Design og Webudvikling (Next.js, React, Headless CMS).
- Kontakt: hej@duckert.design
- Website: duckert.design

Priser og tidslinjer:
- Hjemmesider starter fra 2.500 kr. Den endelige pris afhænger af projektets omfang.
- Projekter tager typisk 1–3 uger afhængigt af størrelse og materialeleverance.
- Vi giver altid et gratis, uforpligtende tilbud.

Adfærdsregler:
- Svar altid på dansk, medmindre brugeren skriver på engelsk.
- Hold svarene kortfattede og præcise — maks 3-4 sætninger.
- Hvis du ikke kender svaret, henvis venligt til hej@duckert.design.
- Du må ikke opfinde priser eller lovninger vi ikke har bekræftet.
- Vær imødekommende og professionel — tal i "vi" form på vegne af Duckert Design.
- Afslut gerne med en opfordring til at tage kontakt, hvis brugeren virker interesseret.
- Brug ALDRIG FAQ-ID'er, kildehenvisninger eller interne noter i dit svar til kunden.

Hurtige svar:
Når dit svar naturligt lægger op til et valg (ja/nej, eller 2-3 afgrænsede muligheder), afslut da din besked med følgende tag på en ny linje:
[HURTIG_SVAR: mulighed1 | mulighed2 | mulighed3]
Eksempel: "Ønsker du at høre mere om vores priser og pakker? [HURTIG_SVAR: Ja, fortæl mig mere | Nej tak]"
Brug maks 3 korte muligheder (under 5 ord hver). Brug IKKE tagget i rene informationssvar hvor ingen valg er relevant.`;

async function buildSystemPrompt(): Promise<string> {
  const faqEntries = await getFaqEntries("customer");
  const faqBlock = faqToPromptBlock(faqEntries);
  if (!faqBlock) return BASE_SYSTEM_PROMPT;
  return `${BASE_SYSTEM_PROMPT}\n\nVidenbase (brug disse svar som grundlag — skriv naturligt, ingen ID'er til kunden):\n\n${faqBlock}`;
}

type GptMessage = {
  role: "user" | "assistant";
  content: string;
};

async function persistSession(session: ChatSession) {
  await redis.set(`chat:session:${session.id}`, JSON.stringify(session));
  await redis.sadd("chat:sessions:index", session.id);
}

async function publishAdminEvent(event: AdminEvent) {
  try {
    await redis.publish("admin:events", JSON.stringify(event));
  } catch (err) {
    console.error("Redis publish error:", err);
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Konfigurationsfejl." }, { status: 500 });
  }

  let messages: GptMessage[], userMessage: string, sessionId: string | undefined, humanHandoff: boolean | undefined;
  try {
    ({ messages, userMessage, sessionId, humanHandoff } = await req.json());
  } catch {
    return NextResponse.json({ error: "Ugyldig anmodning." }, { status: 400 });
  }

  const isNewSession = !sessionId;
  const sid = sessionId ?? crypto.randomUUID();
  const now = Date.now();

  // Load or create session
  let session: ChatSession;
  if (!isNewSession) {
    const raw = await redis.get<string>(`chat:session:${sid}`);
    if (raw) {
      session = typeof raw === "string" ? JSON.parse(raw) : raw as ChatSession;
    } else {
      // Session expired or missing — treat as new
      session = { id: sid, createdAt: now, updatedAt: now, status: "ai", messages: [] };
    }
  } else {
    session = { id: sid, createdAt: now, updatedAt: now, status: "ai", messages: [] };
  }

  // Human handoff request
  if (humanHandoff) {
    session.status = "human";
    session.updatedAt = now;
    // Store the user's "Tal med en agent" message in the session
    if (userMessage) {
      session.messages.push({
        id: crypto.randomUUID(),
        role: "user",
        content: userMessage,
        ts: now,
      });
    }
    await persistSession(session);
    await publishAdminEvent({ type: "new_chat_session", sessionId: sid, humanRequested: true, ts: now });
    const responseHeaders = new Headers({
      "Content-Type": "application/json",
      "X-Session-Id": sid,
    });
    return new Response(JSON.stringify({ ok: true, sessionId: sid }), { headers: responseHeaders });
  }

  // Persist user message
  const userMsg: ChatMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: userMessage,
    ts: now,
  };
  session.messages.push(userMsg);
  session.updatedAt = now;

  // Human/claimed/inactive/closed/archived session: store message, notify admin, no AI response
  if (session.status === "human" || session.status === "claimed" || session.status === "inactive" || session.status === "closed" || session.status === "archived") {
    await persistSession(session);
    await publishAdminEvent({
      type: "new_chat_message",
      sessionId: sid,
      messageId: userMsg.id,
      content: userMessage,
      role: "user",
      ts: now,
    });
    return new Response(JSON.stringify({ ok: true, waiting: true }), {
      headers: new Headers({ "Content-Type": "application/json", "X-Session-Id": sid }),
    });
  }

  // Publish events
  if (isNewSession) {
    await persistSession(session);
    await publishAdminEvent({ type: "new_chat_session", sessionId: sid, ts: now });
  } else {
    await publishAdminEvent({
      type: "new_chat_message",
      sessionId: sid,
      messageId: userMsg.id,
      content: userMessage,
      role: "user",
      ts: now,
    });
  }

  const systemPrompt = await buildSystemPrompt();

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL ?? "llama-3.1-8b-instant",
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!groqRes.ok) {
    return NextResponse.json({ error: "Kunne ikke kontakte assistenten. Prøv igen." }, { status: 502 });
  }

  // Stream response, collect full text to persist after
  const assistantMsgId = crypto.randomUUID();
  let fullResponse = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = groqRes.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        buf += chunk;

        // Extract text content from SSE lines to build full response.
        // Groq returns \r\n line endings, so split on /\r?\n/ and trim.
        const lines = buf.split(/\r?\n/);
        buf = lines.pop() ?? "";
        for (const raw of lines) {
          const ln = raw.trim();
          if (!ln.startsWith("data:") || ln === "data: [DONE]") continue;
          try {
            fullResponse += JSON.parse(ln.slice(5).trim()).choices?.[0]?.delta?.content ?? "";
          } catch {}
        }

        controller.enqueue(new TextEncoder().encode(chunk));
      }

      // Persist AI response and update session
      if (fullResponse) {
        const aiMsg: ChatMessage = {
          id: assistantMsgId,
          role: "assistant",
          content: fullResponse,
          ts: Date.now(),
        };
        session.messages.push(aiMsg);
        session.updatedAt = Date.now();
        await persistSession(session).catch(() => {});
      }

      controller.close();
    },
  });

  const responseHeaders = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Session-Id": sid,
  });

  return new Response(stream, { headers: responseHeaders });
}
