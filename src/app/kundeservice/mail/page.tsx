"use client";

import { useState } from "react";

const CATEGORIES = [
  { value: "technical", label: "Teknisk support" },
  { value: "billing",   label: "Faktura & betaling" },
  { value: "order",     label: "Ny opgave / Bestilling" },
  { value: "privacy",   label: "Privatliv & data" },
  { value: "complaint", label: "Klage" },
  { value: "other",     label: "Andet" },
];

const ERROR_TYPES = [
  "Siden virker ikke",
  "Siden loader langsomt",
  "Visuel fejl / layout-problem",
  "Formular sender ikke",
  "Andet",
];

const PROJECT_TYPES = [
  "Ny hjemmeside",
  "Webshop",
  "Redesign af eksisterende side",
  "Logo & branding",
  "SEO-optimering",
  "Vedligeholdelse",
  "Andet",
];

const BUDGETS = [
  "Under 5.000 kr.",
  "5.000–15.000 kr.",
  "15.000–30.000 kr.",
  "30.000–60.000 kr.",
  "Over 60.000 kr.",
  "Ved ikke endnu",
];

const REQUEST_TYPES = [
  "Indsigt i mine personoplysninger",
  "Sletning af mine data",
  "Rettelse af forkerte oplysninger",
  "Tilbagetrækning af samtykke",
  "Klage over databehandling",
  "Andet",
];

type FormState = "idle" | "sending" | "success" | "error";

interface Fields {
  category: string;
  name: string;
  email: string;
  clientId: string;
  message: string;
  // technical
  platformUrl: string;
  browser: string;
  errorType: string;
  // billing
  invoiceNumber: string;
  invoiceDate: string;
  // order
  projectType: string;
  budget: string;
  startDate: string;
  // privacy
  requestType: string;
  // complaint
  originalContactDate: string;
}

const empty: Fields = {
  category: "",
  name: "",
  email: "",
  clientId: "",
  message: "",
  platformUrl: "",
  browser: "",
  errorType: "",
  invoiceNumber: "",
  invoiceDate: "",
  projectType: "",
  budget: "",
  startDate: "",
  requestType: "",
  originalContactDate: "",
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{
        fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "rgba(8,8,8,0.45)",
        fontFamily: "Montserrat, sans-serif",
      }}>
        {label}{required && <span style={{ color: "#1647FB", marginLeft: "2px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  fontSize: "14px",
  fontFamily: "Montserrat, sans-serif",
  color: "#080808",
  background: "#fff",
  border: "1.5px solid rgba(8,8,8,0.1)",
  borderRadius: "10px",
  outline: "none",
  transition: "border-color 0.18s, box-shadow 0.18s",
  boxSizing: "border-box",
};

function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      style={inputStyle}
      onFocus={(e) => { e.currentTarget.style.borderColor = "#1647FB"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22,71,251,0.1)"; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(8,8,8,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
    />
  );
}

function Select({
  options,
  value,
  onChange,
  placeholder,
  required,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          ...inputStyle,
          appearance: "none",
          WebkitAppearance: "none",
          cursor: "pointer",
          paddingRight: "36px",
          color: value ? "#080808" : "rgba(8,8,8,0.35)",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "#1647FB"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22,71,251,0.1)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(8,8,8,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <path d="M6 9l6 6 6-6" stroke="#080808" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function MailPage() {
  const [fields, setFields] = useState<Fields>(empty);
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (key: keyof Fields) => (v: string) =>
    setFields((f) => ({ ...f, [key]: v }));

  const categoryLabel = CATEGORIES.find((c) => c.value === fields.category)?.label ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, categoryLabel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Noget gik galt.");
      setState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Noget gik galt. Prøv igen.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <>
        <style>{`
          @keyframes ml-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
          .ml-up { animation: ml-up 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        `}</style>
        <main style={{ paddingTop: "80px", minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px 60px" }}>
          <div className="ml-up" style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "20px",
              background: "rgba(22,71,251,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 28px",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#1647FB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 style={{
              fontSize: "32px", fontWeight: 800, color: "#080808",
              letterSpacing: "-0.04em", margin: "0 0 12px",
              fontFamily: "Montserrat, sans-serif",
            }}>
              Henvendelse modtaget
            </h1>
            <p style={{
              fontSize: "15px", color: "rgba(8,8,8,0.5)", lineHeight: 1.7,
              margin: "0 0 36px", fontFamily: "Montserrat, sans-serif",
            }}>
              Tak for din besked. Vi vender tilbage inden for 24 timer.
            </p>
            <a href="/"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "#1647FB", color: "#fff", borderRadius: "12px",
                padding: "13px 28px", fontSize: "13px", fontWeight: 700,
                letterSpacing: "0.03em", textDecoration: "none",
                fontFamily: "Montserrat, sans-serif",
              }}>
              Tilbage til forsiden
            </a>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes ml-in { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .ml-fields { animation: ml-in 0.38s cubic-bezier(0.16,1,0.3,1) both; }
        .ml-input::placeholder { color: rgba(8,8,8,0.3); }
      `}</style>

      <main style={{ paddingTop: "80px", minHeight: "100vh", background: "#fff" }}>
        <section style={{ maxWidth: "560px", margin: "0 auto", padding: "52px 24px 80px" }}>

          {/* Header */}
          <div style={{ marginBottom: "40px" }}>
            <a href="/" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              fontSize: "12px", fontWeight: 600, color: "rgba(8,8,8,0.4)",
              textDecoration: "none", fontFamily: "Montserrat, sans-serif",
              marginBottom: "28px",
              letterSpacing: "0.05em",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1647FB")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(8,8,8,0.4)")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Kundeservice
            </a>
            <h1 style={{
              fontSize: "clamp(36px, 7vw, 64px)",
              fontWeight: 900, letterSpacing: "-0.045em",
              lineHeight: 0.95, color: "#080808",
              margin: "0 0 16px",
              fontFamily: "Montserrat, sans-serif",
            }}>
              Kontakt<br />
              <em style={{ fontStyle: "italic", fontWeight: 300 }}>formular</em>
            </h1>
            <p style={{
              fontSize: "14px", color: "rgba(8,8,8,0.45)", lineHeight: 1.7,
              margin: 0, fontFamily: "Montserrat, sans-serif",
            }}>
              Vælg en kategori for at komme i gang. Vi svarer inden for 24 timer.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Step 1 — Category */}
            <Field label="Kategori" required>
              <div style={{ position: "relative" }}>
                <select
                  value={fields.category}
                  onChange={(e) => setFields({ ...empty, category: e.target.value })}
                  required
                  style={{
                    ...inputStyle,
                    appearance: "none",
                    WebkitAppearance: "none",
                    cursor: "pointer",
                    paddingRight: "36px",
                    fontWeight: fields.category ? 600 : 400,
                    color: fields.category ? "#080808" : "rgba(8,8,8,0.35)",
                    fontSize: "15px",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#1647FB"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22,71,251,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(8,8,8,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <option value="">Vælg kategori…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <path d="M6 9l6 6 6-6" stroke="#080808" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Field>

            {/* Step 2 — rest of form (revealed after category chosen) */}
            {fields.category && (
              <div className="ml-fields" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* Divider */}
                <div style={{ borderTop: "1px solid rgba(8,8,8,0.07)", paddingTop: "4px" }} />

                {/* Base fields */}
                <Field label="Fulde navn" required>
                  <Input
                    placeholder="Anders Jensen"
                    value={fields.name}
                    onChange={set("name")}
                    required
                  />
                </Field>

                <Field label="E-mailadresse" required>
                  <Input
                    type="email"
                    placeholder="anders@email.dk"
                    value={fields.email}
                    onChange={set("email")}
                    required
                  />
                </Field>

                <Field label="Klient-ID">
                  <Input
                    placeholder="F.eks. DD-2024-083"
                    value={fields.clientId}
                    onChange={set("clientId")}
                  />
                </Field>

                {/* ─── Category-specific fields ─── */}

                {fields.category === "technical" && (
                  <>
                    <Field label="URL på siden" required>
                      <Input
                        type="url"
                        placeholder="https://ditdomæne.dk"
                        value={fields.platformUrl}
                        onChange={set("platformUrl")}
                        required
                      />
                    </Field>
                    <Field label="Browser & enhed">
                      <Input
                        placeholder="F.eks. Chrome på iPhone 15"
                        value={fields.browser}
                        onChange={set("browser")}
                      />
                    </Field>
                    <Field label="Type af fejl" required>
                      <Select
                        options={ERROR_TYPES}
                        value={fields.errorType}
                        onChange={set("errorType")}
                        placeholder="Vælg fejltype…"
                        required
                      />
                    </Field>
                  </>
                )}

                {fields.category === "billing" && (
                  <>
                    <Field label="Fakturanummer" required>
                      <Input
                        placeholder="F.eks. INV-2025-001"
                        value={fields.invoiceNumber}
                        onChange={set("invoiceNumber")}
                        required
                      />
                    </Field>
                    <Field label="Fakturadato">
                      <Input
                        type="date"
                        value={fields.invoiceDate}
                        onChange={set("invoiceDate")}
                      />
                    </Field>
                  </>
                )}

                {fields.category === "order" && (
                  <>
                    <Field label="Projekttype" required>
                      <Select
                        options={PROJECT_TYPES}
                        value={fields.projectType}
                        onChange={set("projectType")}
                        placeholder="Vælg projekttype…"
                        required
                      />
                    </Field>
                    <Field label="Budget">
                      <Select
                        options={BUDGETS}
                        value={fields.budget}
                        onChange={set("budget")}
                        placeholder="Vælg budget…"
                      />
                    </Field>
                    <Field label="Ønsket startdato">
                      <Input
                        type="date"
                        value={fields.startDate}
                        onChange={set("startDate")}
                      />
                    </Field>
                  </>
                )}

                {fields.category === "privacy" && (
                  <Field label="Type af anmodning" required>
                    <Select
                      options={REQUEST_TYPES}
                      value={fields.requestType}
                      onChange={set("requestType")}
                      placeholder="Vælg anmodningstype…"
                      required
                    />
                  </Field>
                )}

                {fields.category === "complaint" && (
                  <Field label="Dato for oprindelig henvendelse">
                    <Input
                      type="date"
                      value={fields.originalContactDate}
                      onChange={set("originalContactDate")}
                    />
                  </Field>
                )}

                {/* ─── Message (optional) ─── */}
                <Field label="Besked (valgfri)">
                  <textarea
                    placeholder="Uddyb gerne din henvendelse…"
                    value={fields.message}
                    onChange={(e) => set("message")(e.target.value)}
                    rows={4}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      minHeight: "100px",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#1647FB"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22,71,251,0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(8,8,8,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </Field>

                {/* Error message */}
                {state === "error" && (
                  <p style={{
                    fontSize: "13px", color: "#dc2626",
                    fontFamily: "Montserrat, sans-serif",
                    margin: 0, padding: "12px 14px",
                    background: "#fef2f2", borderRadius: "10px",
                    border: "1px solid rgba(220,38,38,0.15)",
                  }}>
                    {errorMsg}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={state === "sending"}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    background: state === "sending" ? "rgba(22,71,251,0.6)" : "#1647FB",
                    color: "#fff", border: "none", borderRadius: "12px",
                    padding: "15px 28px", fontSize: "14px", fontWeight: 700,
                    letterSpacing: "0.03em", cursor: state === "sending" ? "default" : "pointer",
                    fontFamily: "Montserrat, sans-serif",
                    transition: "opacity 0.2s, background 0.2s",
                    marginTop: "4px",
                  }}
                  onMouseEnter={(e) => { if (state !== "sending") e.currentTarget.style.opacity = "0.87"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >
                  {state === "sending" ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.9s linear infinite" }}>
                        <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
                        <path d="M12 3a9 9 0 019 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                      Sender…
                    </>
                  ) : (
                    <>
                      Send henvendelse
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>

                <p style={{
                  fontSize: "11px", color: "rgba(8,8,8,0.35)",
                  fontFamily: "Montserrat, sans-serif", margin: 0,
                  textAlign: "center", lineHeight: 1.6,
                }}>
                  Dine oplysninger behandles fortroligt i overensstemmelse med vores{" "}
                  <a href="/privatlivspolitik" style={{ color: "#1647FB", textDecoration: "none" }}>privatlivspolitik</a>.
                </p>

              </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>
        </section>
      </main>
    </>
  );
}
