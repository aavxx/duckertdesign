export const metadata = {
  title: "Service Vilkår – Duckert Design",
  description: "Læs om Duckert Designs service- og samarbejdsvilkår.",
};

const section = (title: string, body: string) => ({ title, body });

const sections = [
  section(
    "1. Aftaleindgåelse",
    "En aftale med Duckert Design anses for indgået, når begge parter skriftligt har bekræftet samarbejdets omfang, pris og leveringstidspunkt via e-mail eller tilbud."
  ),
  section(
    "2. Ydelser",
    "Duckert Design leverer webdesign, branding og UI/UX-løsninger som aftalt i det konkrete tilbud. Eventuelle ændringer i opgavens omfang aftales skriftligt og kan medføre justering af pris og tidsplan."
  ),
  section(
    "3. Betaling",
    "Betaling sker i henhold til den fremsendte faktura. Standardvilkår er 50 % ved opstart og 50 % ved aflevering, medmindre andet er aftalt. Betalingsfrist er 8 dage netto."
  ),
  section(
    "4. Leveringstid",
    "Leveringstid aftales individuelt for hvert projekt. Duckert Design forbeholder sig ret til at justere leveringstidspunktet ved forsinkelser fra kundens side, herunder manglende materiale eller godkendelser."
  ),
  section(
    "5. Ophavsret",
    "Alle rettigheder til det leverede materiale overgår til kunden ved fuld betaling. Duckert Design forbeholder sig retten til at anvende projektet i sin portefølje, medmindre andet er skriftligt aftalt."
  ),
  section(
    "6. Ansvarsbegrænsning",
    "Duckert Design er ikke ansvarlig for indirekte tab, tab af omsætning eller andre følgetab som følge af forsinkelse, fejl eller mangler. Det samlede ansvar kan ikke overstige den aftalte projektpris."
  ),
  section(
    "7. Fortrolighed",
    "Begge parter forpligter sig til at behandle fortrolige oplysninger om den anden parts forretning fortroligt og ikke at videreformidle disse til tredjeparter."
  ),
  section(
    "8. Lovvalg og værneting",
    "Eventuelle tvister afgøres efter dansk ret med Retten i København som værneting."
  ),
];

export default function ServiceVilkarPage() {
  return (
    <main style={{ paddingTop: "96px", minHeight: "100vh", background: "#ffffff" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "80px 40px 120px" }}>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#bbb",
            display: "block",
            marginBottom: "24px",
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
          }}
        >
          Service Vilkår
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
                }}
              >
                {s.title}
              </h2>
              <p style={{ fontSize: "15px", color: "#777", lineHeight: 1.85, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "11px", color: "#ccc", marginTop: "64px", letterSpacing: "0.04em" }}>
          Sidst opdateret: januar 2026
        </p>
      </div>
    </main>
  );
}
