import { requireAdmin } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { FaqEntry } from "@/lib/faq";

const ADMIN_FAQ: Omit<FaqEntry, "createdAt" | "updatedAt">[] = [
  { id: "A1", category: "admin", question: "Hvad koster en hjemmeside?", answer: "Det starter fra 2.500 kr., men den endelige pris afhænger af projektets omfang. Send gerne en besked, så finder vi den rigtige pris til dig." },
  { id: "A2", category: "admin", question: "Hvor lang tid tager det at få en hjemmeside?", answer: "Typisk 1-3 uger, afhængig af projektets størrelse og hvor hurtigt vi får det nødvendige materiale fra dig." },
  { id: "A3", category: "admin", question: "Kan I lave online booking på hjemmesiden?", answer: "Ja, det er noget vi ofte integrerer i hjemmesider til frisører, caféer og lignende virksomheder med behov for tidsbestilling." },
  { id: "A4", category: "admin", question: "Hvem laver hjemmesiden — er det jer selv?", answer: "Ja, det gør jeg selv — fra design til udvikling og levering. Ingen mellemled." },
  { id: "A5", category: "admin", question: "Kan vi få ændringer efter hjemmesiden er leveret?", answer: "Ja, mindre justeringer er normalt inkluderet i den oprindelige pris. Større ændringer eller løbende vedligeholdelse aftales separat." },
  { id: "A6", category: "admin", question: "Skal vi selv levere tekst og billeder?", answer: "Det er en fordel hvis I har eget materiale, men jeg kan også hjælpe med at skrive tekster og finde passende billeder, hvis det er nødvendigt." },
  { id: "A7", category: "admin", question: "Får vi vores eget domæne, eller bruger I et fælles?", answer: "I får jeres eget domæne (f.eks. dinvirksomhed.dk). Jeg hjælper gerne med opsætning, hvis I ikke allerede har et." },
  { id: "A8", category: "admin", question: "Hvad sker der hvis hjemmesiden går ned eller fejler?", answer: "Sig til, så kigger jeg på det hurtigst muligt. Mindre fejl efter levering rettes normalt uden ekstra beregning." },
  { id: "A9", category: "admin", question: "Skal vi binde os til en fast aftale, eller er det engangsbetaling?", answer: "Det er typisk en engangsbetaling for selve hjemmesiden. Hvis I ønsker løbende vedligeholdelse eller opdateringer, kan det aftales separat som et tilkøb." },
  { id: "A10", category: "admin", question: "Kan I hjælpe med SEO, så vi findes bedre på Google?", answer: "Ja, grundlæggende SEO (titler, beskrivelser, hurtig hjemmeside, mobilvenligt design) er en del af hver levering. Mere avanceret SEO-arbejde kan aftales separat." },
  { id: "A11", category: "admin", question: "Hvor mange sider er inkluderet i prisen?", answer: "Det afhænger af projektet, men en typisk hjemmeside indeholder forside, om os, services/ydelser og kontakt. Flere sider kan tilføjes mod et tillæg." },
  { id: "A12", category: "admin", question: "Kan vi betale i rater?", answer: "Standardvilkår er 50% ved opstart og 50% ved aflevering. Andre aftaler kan drøftes, hvis det giver bedre mening for jer." },
  { id: "A13", category: "admin", question: "Hvad sker der hvis vi ikke er tilfredse med designet?", answer: "Vi laver revisioner undervejs, så vi rammer det rigtige look inden levering. Du godkender altid designet før vi går videre til udvikling." },
  { id: "A14", category: "admin", question: "Kan I hoste hjemmesiden for os, eller skal vi selv finde en hosting-løsning?", answer: "Ja, jeg kan stå for hosting og opsætning, så I ikke skal tænke på det tekniske selv." },
  { id: "A15", category: "admin", question: "Hvilke betalingsmetoder accepterer I?", answer: "Bankoverførsel er standard. Andre metoder kan aftales efter behov." },
  { id: "A16", category: "admin", question: "Kan I lave en webshop?", answer: "Det afhænger af omfanget — kontakt mig med detaljer om hvad I forestiller jer, så vurderer jeg om det er noget jeg kan løse." },
  { id: "A17", category: "admin", question: "Hvad er forskellen på en simpel hjemmeside og en med booking-system?", answer: "En simpel hjemmeside er informativ — kontaktoplysninger, services, om-os. En med booking giver kunderne mulighed for selv at bestille tid direkte på siden, hvilket sparer jer for telefonopkald og koordinering." },
  { id: "A18", category: "admin", question: "Hvor hurtigt svarer I på henvendelser?", answer: "Normalt inden for samme dag, ofte hurtigere." },
  { id: "A19", category: "admin", question: "Kan I lave hjemmesiden på flere sprog?", answer: "Ja, det kan tilføjes — sig til hvilke sprog der er relevante for jeres kunder." },
  { id: "A20", category: "admin", question: "Hvad har I lavet før — har I referencer?", answer: "Ja, send gerne en besked, så deler jeg eksempler på tidligere projekter der matcher jeres branche." },
];

const CUSTOMER_FAQ: Omit<FaqEntry, "createdAt" | "updatedAt">[] = [
  { id: "B1", category: "customer", question: "Hvordan booker jeg en tid?", answer: "Brug booking-knappen på hjemmesiden, vælg en ledig tid, og bekræft med dine kontaktoplysninger." },
  { id: "B2", category: "customer", question: "Kan jeg ændre eller aflyse min booking?", answer: "Ja, normalt via et link i din bekræftelsesmail/SMS, eller ved at kontakte virksomheden direkte." },
  { id: "B3", category: "customer", question: "Får jeg en bekræftelse på min booking?", answer: "Ja, du modtager en bekræftelse via e-mail eller SMS, afhængig af hvad virksomheden har valgt." },
  { id: "B4", category: "customer", question: "Hvad gør jeg, hvis jeg ikke kan se nogen ledige tider?", answer: "Det betyder typisk at der er fuldt booket. Prøv at tjekke igen senere, eller kontakt virksomheden direkte for at høre om muligheder." },
  { id: "B5", category: "customer", question: "Kan jeg booke uden at oprette en konto?", answer: "Ja, de fleste booking-systemer kræver ikke en konto — kun navn og kontaktoplysninger." },
  { id: "B6", category: "customer", question: "Hvordan finder jeg åbningstiderne?", answer: "Åbningstiderne står typisk på forsiden eller kontaktsiden af hjemmesiden." },
  { id: "B7", category: "customer", question: "Kan jeg booke flere personer på samme tid?", answer: "Det afhænger af virksomhedens system — kontakt dem direkte hvis du er i tvivl." },
  { id: "B8", category: "customer", question: "Hvad sker der hvis jeg kommer for sent til min tid?", answer: "Det varierer fra virksomhed til virksomhed — kontakt dem direkte for at høre deres politik." },
  { id: "B9", category: "customer", question: "Kan jeg betale online ved booking?", answer: "Det afhænger af virksomheden — nogle kræver forudbetaling, andre betaler du på stedet." },
  { id: "B10", category: "customer", question: "Hvordan kontakter jeg virksomheden direkte?", answer: "Kontaktoplysninger findes på kontaktsiden, eller du kan bruge chatten her til at blive sat i forbindelse med dem." },
];

export async function POST(req: Request) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { force } = await req.json().catch(() => ({ force: false })) as { force?: boolean };

  const rows = [...ADMIN_FAQ, ...CUSTOMER_FAQ].map((entry) => ({
    id: entry.id,
    category: entry.category,
    question: entry.question,
    answer: entry.answer,
    source: "manual" as const,
  }));

  const { error, count } = force
    ? await supabase.from("faq_entries").upsert(rows, { count: "exact" })
    : await supabase.from("faq_entries").upsert(rows, { ignoreDuplicates: true, count: "exact" });

  if (error) return new Response(error.message, { status: 500 });
  return Response.json({ ok: true, seeded: count ?? rows.length });
}
