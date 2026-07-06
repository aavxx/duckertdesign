export const metadata = {
  title: "Privatlivspolitik – Duckert Design",
  description: "Læs om hvordan Duckert Design behandler dine personoplysninger.",
};

const section = (title: string, body: string) => ({ title, body });

const sections = [
  section(
    "1. Dataansvarlig",
    "Duckert Design er dataansvarlig for behandlingen af de personoplysninger, som vi modtager om dig. Har du spørgsmål til vores behandling af dine oplysninger, er du velkommen til at kontakte os på data@duckert.design."
  ),
  section(
    "2. Hvilke oplysninger indsamler vi?",
    "Vi indsamler de oplysninger, du selv afgiver, når du kontakter os: navn, e-mailadresse og den besked du sender. Bruger du vores AI-kundeservicechat, gemmes samtalens indhold sikkert i vores database i 30 dage, hvorefter den slettes automatisk og permanent. Vi indsamler desuden standard serverlogfiler (IP-adresse, tidspunkt, browsertype) til driftssikkerhed."
  ),
  section(
    "3. AI-assistent og chathistorik",
    "Vores kundeservice benytter en AI-assistent drevet af Groq (groq.com), der leverer hurtig sprogmodelinfrastruktur. Samtaledata sendes til Groq for at generere svar og gemmes ikke hos Groq. Chatsamtaler opbevares i 30 dage hos vores databaseleverandør Supabase og bruges i denne periode til kvalitetssikring og til at forbedre AI-assistentens svar. Forbedringen sker ved at udlede generelle, anonyme spørgsmål/svar-mønstre — aldrig personoplysninger, navne eller enkeltsager. Efter 30 dage slettes samtalerne automatisk. Del venligst ikke følsomme personoplysninger i chatten."
  ),
  section(
    "4. Formål og retsgrundlag",
    "Dine oplysninger bruges udelukkende til at besvare din henvendelse og eventuelt indgå en aftale med dig. Retsgrundlaget er GDPR artikel 6, stk. 1, litra b (opfyldelse af aftale) og litra f (legitim interesse i at besvare henvendelser). Vi bruger aldrig dine oplysninger til markedsføring."
  ),
  section(
    "5. Opbevaring og sletning",
    "Dine oplysninger opbevares kun så længe det er nødvendigt. Chatsamtaler og chat-feedback slettes automatisk efter 30 dage. E-mailhenvendelser slettes senest 2 år efter afsluttet kommunikation, medmindre lovgivningen kræver anden opbevaring. Ønsker du dine oplysninger slettet hurtigere, skriv til data@duckert.design — så sletter vi dem uden unødigt ophold."
  ),
  section(
    "6. Videregivelse",
    "Vi videregiver ikke dine personoplysninger til tredjeparter til markedsføringsformål. Vi anvender Vercel (vercel.com) til hosting, Supabase (supabase.com) til sikker opbevaring af chatsamtaler og Groq (groq.com) til AI-funktionalitet. Alle er underlagt databehandleraftaler og overholder GDPR."
  ),
  section(
    "7. Dine rettigheder",
    "Du har ret til indsigt, berigtigelse, sletning, begrænsning af behandling og dataportabilitet. Du kan til enhver tid gøre indsigelse mod behandlingen. Kontakt os på data@duckert.design for at udøve dine rettigheder — vi svarer inden for 30 dage. Du kan også klage til Datatilsynet på dt.dk."
  ),
  section(
    "8. Cookies",
    "Vi anvender udelukkende teknisk nødvendige cookies for at sikre korrekt funktionalitet. Der anvendes ingen tracking-, analyse- eller marketingcookies. Du bliver ikke profileret."
  ),
  section(
    "9. Sikkerhed",
    "Vi beskytter dine oplysninger med passende tekniske foranstaltninger, herunder krypteret HTTPS-forbindelse. Opdager vi et sikkerhedsbrud, underretter vi Datatilsynet inden for 72 timer."
  ),
  section(
    "10. Ændringer",
    "Vi forbeholder os retten til at opdatere denne privatlivspolitik. Den seneste version vil altid være tilgængelig på denne side."
  ),
];

export default function PrivatlivspolitikPage() {
  return (
    <main style={{ paddingTop: "96px", minHeight: "100vh", background: "#ffffff" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "80px clamp(20px, 5vw, 40px) 120px" }}>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#bbb",
            display: "block",
            marginBottom: "24px",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Juridisk
        </span>
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 64px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            color: "#080808",
            margin: "0 0 72px",
            fontFamily: "'Archivo', sans-serif",
          }}
        >
          Privatlivs&shy;politik
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
          {sections.map((s) => (
            <div key={s.title} style={{ borderTop: "1px solid #ebebeb", paddingTop: "32px" }}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#080808",
                  margin: "0 0 12px",
                  letterSpacing: "-0.01em",
                  fontFamily: "'Archivo', sans-serif",
                }}
              >
                {s.title}
              </h2>
              <p style={{ fontSize: "15px", color: "#777", lineHeight: 1.85, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "11px", color: "#ccc", marginTop: "64px", letterSpacing: "0.04em", fontFamily: "'Space Grotesk', sans-serif" }}>
          Sidst opdateret: juli 2026 · Spørgsmål: <a href="mailto:data@duckert.design" style={{ color: "#1647FB", textDecoration: "none" }}>data@duckert.design</a>
        </p>
      </div>
    </main>
  );
}
