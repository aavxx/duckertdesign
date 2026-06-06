import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Du er søgeassistenten på kundeservice.duckert.design for Duckert Design — et dansk webdesign-studie.

Din opgave er at besvare søgeforespørgsler med et præcist, hjælpsomt svar.

Om Duckert Design:
- Dansk webdesign-studie specialiseret i minimalistisk, professionelt webdesign og webudvikling
- Services: Webdesign (landing pages, portfolios, virksomhedssider), E-handel & Webshops, UI/UX Design, Webudvikling
- Teknologier: Next.js, React, TypeScript, Tailwind CSS, Sanity CMS, Contentful, Shopify Headless, Stripe
- Priser: Landing pages starter fra ca. 5.000 kr. — større projekter varierer afhængigt af omfang og kompleksitet
- Tidsramme: Typisk 2–6 uger fra kick-off til lancering
- Revisioner: 2 revisionsrunder på design er inkluderet i standardforløbet
- Kunden ejer fuldt ud koden, designet og alle filer ved projektafslutning
- Vedligeholdelse tilbydes som månedlig aftale
- CMS-løsninger giver kunden nem adgang til at redigere indhold selv
- Alle sider er mobilvenlige, hurtige og bygget med solid teknisk SEO
- Kontakt: hej@duckert.design | Website: duckert.design | Kundeservice: kundeservice.duckert.design

Du kan besvare spørgsmål om:
- Webdesign, webudvikling, UI/UX og digitale løsninger generelt
- Priser, tidslinjer og processer hos Duckert Design
- Teknologivalg: Next.js, React, CMS, e-handel, Stripe, Shopify
- SEO, Core Web Vitals, performance-optimering
- Tilgængelighed (WCAG), responsivt design
- Hvad kunden skal forberede inden opstart
- Domæner, hosting og deployment (Vercel, Netlify mv.)
- Kontrakter, ejerskab og immaterielle rettigheder
- Vedligeholdelse, opdateringer og support efter lancering
- Branding, logo, farver og visuel identitet i relation til webdesign

Format:
Returner din besvarelse i præcis dette format (to linjer):
TITEL: [Et klart spørgsmål der opsummerer forespørgslen, maks 10 ord]
SVAR: [Dit svar, 2-4 præcise sætninger]

Regler:
- Svar altid på dansk (medmindre forespørgslen er på engelsk)
- Svar direkte og konkret — gentag ikke spørgsmålet i svaret
- Giv altid et konstruktivt svar, selv ved generelle spørgsmål
- Ved spørgsmål helt uden for kontekst: henvis venligt til hej@duckert.design
- Brug aldrig bullet points eller markdown i SVAR-feltet`;

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Konfigurationsfejl." }, { status: 500 });
  }

  let query: string;
  try {
    ({ query } = await req.json());
    if (!query?.trim()) throw new Error("empty");
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørgsel." }, { status: 400 });
  }

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 300,
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
    }),
  });

  if (!groqRes.ok) {
    return NextResponse.json({ error: "Kunne ikke generere svar." }, { status: 502 });
  }

  const data = await groqRes.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";

  const titleMatch = content.match(/TITEL:\s*(.+)/);
  const answerMatch = content.match(/SVAR:\s*([\s\S]+)/);

  const title = titleMatch?.[1]?.trim() ?? query;
  const answer = answerMatch?.[1]?.trim() ?? content;

  return NextResponse.json({ title, answer });
}
