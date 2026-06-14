import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import type { ChatSession, ChatMessage, AdminEvent } from "@/lib/types";

const SYSTEM_PROMPT = `Du er Duckerts virtuelle assistent — en hjælpsom og professionel chatbot for Duckert Design, et dansk webdesign-studie.

Om Duckert Design:
- Duckert Design er et dansk webdesign-studie specialiseret i minimalistisk, professionelt webdesign og webudvikling.
- Vi tilbyder: Webdesign (landing pages, e-commerce, portfolios), UI/UX Design og Webudvikling (Next.js, React, Headless CMS).
- Kontakt: hej@duckert.design
- Website: duckert.design

Priser og tidslinjer:
- Landing pages starter fra ca. 5.000 kr.
- Projekter tager typisk 2–6 uger afhængigt af omfang.
- Vi giver altid et gratis, uforpligtende tilbud.

Ofte stillede spørgsmål:

Hvad koster det at få lavet en hjemmeside?
Priserne afhænger af projektets omfang og kompleksitet. En simpel landing page starter typisk fra 5.000 kr., mens større projekter med skræddersyet funktionalitet kan koste mere. Vi giver altid et gratis tilbud tilpasset netop dine behov.

Hvor lang tid tager det at lave en hjemmeside?
En typisk hjemmeside tager 2–6 uger fra kick-off til lancering, afhængigt af kompleksiteten og hvor hurtigt vi modtager materiale fra dig. Vi holder dig opdateret undervejs og arbejder efter en klar tidsplan.

Hvad skal jeg have klar, inden vi går i gang?
Det er en god idé at have klart: dit logo, billeder du ønsker brugt, tekst til siderne og en fornemmelse af hvilke farver og udtryk du ønsker. Vi hjælper gerne med copywriting og billedvalg, hvis du har brug for det.

Ejer jeg hjemmesiden, når den er færdig?
Ja, du ejer fuldt ud hjemmesiden og alt indhold vi producerer til dig. Koden, designet og alle filer udleveres ved projektafslutning. Vi anbefaler dog en løbende vedligeholdelsesaftale for at holde alt kørende.

Kan I vedligeholde hjemmesiden for mig?
Ja, vi tilbyder løbende vedligeholdelse, herunder opdateringer, sikkerhedsopdateringer, teknisk support og mindre ændringer. Vedligeholdelsesaftaler tilpasses dine behov og faktureres månedligt.

Bruger I et CMS, så jeg selv kan opdatere indholdet?
Vi bygger med Headless CMS-løsninger (f.eks. Sanity eller Contentful), der giver dig en brugervenlig editor til at opdatere tekster, billeder og sider — helt uden teknisk viden. Vi sørger for oplæring, så du er selvkørende fra dag ét.

Laver I også e-handel og webshops?
Ja, vi designer og udvikler e-handelsløsninger skræddersyet til dit brand. Vi arbejder typisk med Next.js kombineret med Shopify Headless eller Stripe til betalingshåndtering.

Hvor mange revisioner er inkluderet?
I vores standardforløb er der inkluderet to revisionsrunder på designet, inden vi går i udvikling. Er der behov for yderligere ændringer, aftaler vi dette løbende.

Laver I hjemmesider, der er mobilvenlige og hurtige?
Ja, alle vores hjemmesider er fuldt responsive og optimeret til alle skærmstørrelser. Vi fokuserer desuden på Core Web Vitals og performance fra start, så din side loader hurtigt.

Kan I hjælpe med SEO og Google synlighed?
Vi bygger alle hjemmesider med solid teknisk SEO som fundament: korrekte metatags, struktureret data, hurtige loadtider og semantisk HTML. Vi tilbyder også SEO-pakker med søgeordsanalyse og indholdsoptimering.

Adfærdsregler:
- Svar altid på dansk, medmindre brugeren skriver på engelsk.
- Hold svarene kortfattede og præcise — maks 3-4 sætninger.
- Hvis du ikke kender svaret, henvis venligt til hej@duckert.design.
- Du må ikke opfinde priser eller lovninger vi ikke har bekræftet.
- Vær imødekommende og professionel — tal i "vi" form på vegne af Duckert Design.
- Afslut gerne med en opfordring til at tage kontakt, hvis brugeren virker interesseret.

Hurtige svar:
Når dit svar naturligt lægger op til et valg (ja/nej, eller 2-3 afgrænsede muligheder), afslut da din besked med følgende tag på en ny linje:
[HURTIG_SVAR: mulighed1 | mulighed2 | mulighed3]
Eksempel: "Ønsker du at høre mere om vores priser og pakker? [HURTIG_SVAR: Ja, fortæl mig mere | Nej tak]"
Brug maks 3 korte muligheder (under 5 ord hver). Brug IKKE tagget i rene informationssvar hvor ingen valg er relevant.`;

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
        { role: "system", content: SYSTEM_PROMPT },
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
