export const metadata = {
  title: "Privatlivs Politik – Duckert Design",
  description: "Læs om hvordan Duckert Design behandler dine personoplysninger.",
};

const section = (title: string, body: string) => ({ title, body });

const sections = [
  section(
    "1. Dataansvarlig",
    "Duckert Design er dataansvarlig for behandlingen af de personoplysninger, som vi modtager om dig. Kontakt os på hej@duckert.design ved spørgsmål vedrørende vores behandling af dine personoplysninger."
  ),
  section(
    "2. Hvilke oplysninger indsamler vi?",
    "Vi indsamler de oplysninger, du selv afgiver, når du kontakter os via kontaktformularen: navn, e-mailadresse og den besked du sender. Vi indsamler ikke oplysninger automatisk ud over standard serverlogfiler."
  ),
  section(
    "3. Formål og retsgrundlag",
    "Oplysningerne bruges udelukkende til at besvare din henvendelse og eventuelt indgå en aftale med dig. Retsgrundlaget er GDPR artikel 6, stk. 1, litra b (nødvendig for at opfylde en aftale) og litra f (legitim interesse i at besvare kundehenvendelser)."
  ),
  section(
    "4. Opbevaring og sletning",
    "Dine oplysninger opbevares kun så længe det er nødvendigt. Henvendelser slettes senest 2 år efter den afsluttende kommunikation, medmindre lovgivningen kræver længere opbevaring."
  ),
  section(
    "5. Videregivelse",
    "Vi videregiver ikke dine personoplysninger til tredjeparter, medmindre det er nødvendigt for at levere den aftalte ydelse, eller vi er forpligtet hertil ved lov."
  ),
  section(
    "6. Dine rettigheder",
    "Du har til enhver tid ret til indsigt, berigtigelse, sletning, begrænsning af behandling og dataportabilitet. Du har også ret til at gøre indsigelse mod behandlingen. Kontakt os på hej@duckert.design for at udøve dine rettigheder. Du kan klage til Datatilsynet på dt.dk."
  ),
  section(
    "7. Cookies",
    "Hjemmesiden anvender udelukkende teknisk nødvendige cookies for at sikre korrekt funktionalitet. Der anvendes ikke tracking- eller marketingcookies."
  ),
  section(
    "8. Ændringer",
    "Vi forbeholder os retten til at opdatere denne privatlivspolitik. Den seneste version vil altid være tilgængelig på denne side."
  ),
];

export default function PrivatlivspolitikPage() {
  return (
    <main style={{ paddingTop: "96px", minHeight: "100vh", background: "#ffffff" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "80px 40px 120px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#aaa",
            marginBottom: "24px",
          }}
        >
          Juridisk
        </p>
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            color: "#080808",
            margin: "0 0 64px",
          }}
        >
          Privatlivs Politik
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
          {sections.map((s) => (
            <div key={s.title} style={{ borderTop: "1px solid #ebebeb", paddingTop: "32px" }}>
              <h2
                style={{
                  fontSize: "17px",
                  fontWeight: 600,
                  color: "#080808",
                  margin: "0 0 12px",
                  letterSpacing: "-0.01em",
                }}
              >
                {s.title}
              </h2>
              <p style={{ fontSize: "15px", color: "#666", lineHeight: 1.8, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "12px", color: "#bbb", marginTop: "64px" }}>
          Sidst opdateret: januar 2026
        </p>
      </div>
    </main>
  );
}
