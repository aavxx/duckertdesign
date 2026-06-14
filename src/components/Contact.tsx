"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Noget gik galt.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Forbindelsesfejl. Prøv igen.");
      setStatus("error");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#ffffff",
    border: "1px solid #ddd",
    borderRadius: "3px",
    padding: "14px 16px",
    fontSize: "15px",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#080808",
    outline: "none",
    transition: "border-color 0.18s",
    display: "block",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#bbb",
    display: "block",
    marginBottom: "8px",
    marginTop: "24px",
  };

  return (
    <section
      id="kontakt"
      style={{
        background: "#ffffff",
        padding: "clamp(80px, 12vw, 140px) clamp(20px, 5vw, 80px)",
        borderTop: "1px solid #ebebeb",
      }}
    >
      <div style={{ maxWidth: "660px", margin: "0 auto" }}>
        {/* Section label */}
        <div
          style={{
            paddingBottom: "20px",
            borderBottom: "1px solid #ebebeb",
            marginBottom: "clamp(40px, 6vw, 60px)",
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#bbb",
            }}
          >
            Kontakt
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: "clamp(36px, 5vw, 64px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            color: "#080808",
            margin: "0 0 20px",
          }}
        >
          Lad os bygge{" "}
          <em style={{ fontStyle: "italic", fontWeight: 300, color: "#1647FB" }}>noget fedt.</em>
        </h1>

        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "15px",
            color: "#888",
            lineHeight: 1.8,
            margin: "0 0 clamp(40px, 6vw, 60px)",
            fontWeight: 400,
          }}
        >
          Har du et projekt i tankerne? Skriv til os — vi vender tilbage inden for 24 timer.
        </p>

        {status === "success" ? (
          <div>
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "#1647FB",
                borderRadius: "3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h4
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontSize: "24px",
                fontWeight: 700,
                color: "#080808",
                margin: "0 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              Besked sendt!
            </h4>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "15px",
                color: "#888",
                margin: 0,
              }}
            >
              Vi vender tilbage hurtigst muligt.
            </p>
            <button
              onClick={() => setStatus("idle")}
              style={{
                marginTop: "32px",
                background: "none",
                border: "none",
                color: "#1647FB",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
                letterSpacing: "0.03em",
              }}
            >
              Send ny besked →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <label style={{ ...labelStyle, marginTop: 0 }} htmlFor="name">
              Navn *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
              placeholder="Dit navn"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#1647FB")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />

            <label style={labelStyle} htmlFor="email">
              Email *
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="din@email.dk"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#1647FB")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />

            <label style={labelStyle} htmlFor="message">
              Besked *
            </label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Fortæl om dit projekt..."
              style={{ ...inputStyle, resize: "none" }}
              onFocus={(e) => (e.target.style.borderColor = "#1647FB")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />

            {status === "error" && (
              <p
                role="alert"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: "#ff4545",
                  fontSize: "13px",
                  marginTop: "12px",
                  letterSpacing: "0.01em",
                }}
              >
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                marginTop: "32px",
                padding: "16px 48px",
                background: "#1647FB",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.03em",
                cursor: status === "loading" ? "not-allowed" : "pointer",
                opacity: status === "loading" ? 0.6 : 1,
                transition: "background 0.18s, opacity 0.18s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                if (status !== "loading") {
                  e.currentTarget.style.background = "#2355FF";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#1647FB";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {status === "loading" ? "Sender..." : "Send besked →"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
