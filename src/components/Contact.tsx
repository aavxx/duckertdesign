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

  const field: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #e0e0e0",
    padding: "16px 0",
    fontSize: "15px",
    fontFamily: "Montserrat, sans-serif",
    color: "#080808",
    outline: "none",
    transition: "border-color 0.2s",
    display: "block",
  };

  const label: React.CSSProperties = {
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#bbb",
    display: "block",
    marginBottom: "4px",
    marginTop: "40px",
  };

  return (
    <section
      id="kontakt"
      style={{ padding: "120px 40px 0" }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            paddingBottom: "24px",
            borderBottom: "1px solid #ebebeb",
            marginBottom: "64px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#bbb",
            }}
          >
            Kontakt
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 72px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            color: "#080808",
            margin: "0 0 28px",
          }}
        >
          Lad os bygge noget fedt.
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "#999",
            lineHeight: 1.8,
            margin: "0 0 64px",
            maxWidth: "520px",
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "28px",
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
                fontSize: "26px",
                fontWeight: 700,
                color: "#080808",
                margin: "0 0 10px",
                letterSpacing: "-0.025em",
              }}
            >
              Besked sendt!
            </h4>
            <p style={{ fontSize: "15px", color: "#999", margin: 0 }}>
              Vi vender tilbage hurtigst muligt.
            </p>
            <button
              onClick={() => setStatus("idle")}
              style={{
                marginTop: "36px",
                background: "none",
                border: "none",
                color: "#1647FB",
                fontSize: "10px",
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.14em",
                cursor: "pointer",
                padding: 0,
                textTransform: "uppercase",
              }}
            >
              Send ny besked →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Two-column: name + email */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "40px",
              }}
            >
              <div>
                <label style={{ ...label, marginTop: 0 }}>Navn</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Dit navn"
                  style={field}
                  onFocus={(e) => (e.target.style.borderBottomColor = "#080808")}
                  onBlur={(e) => (e.target.style.borderBottomColor = "#e0e0e0")}
                />
              </div>
              <div>
                <label style={{ ...label, marginTop: 0 }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="din@email.dk"
                  style={field}
                  onFocus={(e) => (e.target.style.borderBottomColor = "#080808")}
                  onBlur={(e) => (e.target.style.borderBottomColor = "#e0e0e0")}
                />
              </div>
            </div>

            <label style={label}>Besked</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Fortæl om dit projekt..."
              style={{ ...field, resize: "none" }}
              onFocus={(e) => (e.target.style.borderBottomColor = "#080808")}
              onBlur={(e) => (e.target.style.borderBottomColor = "#e0e0e0")}
            />

            {status === "error" && (
              <p
                style={{
                  color: "#e53935",
                  fontSize: "12px",
                  marginTop: "16px",
                  letterSpacing: "0.02em",
                }}
              >
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                marginTop: "48px",
                padding: "18px 56px",
                background: "#1647FB",
                color: "#fff",
                border: "none",
                fontSize: "10px",
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: status === "loading" ? "not-allowed" : "pointer",
                opacity: status === "loading" ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) =>
                status !== "loading" && (e.currentTarget.style.opacity = "0.8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.opacity =
                  status === "loading" ? "0.6" : "1")
              }
            >
              {status === "loading" ? "Sender..." : "Send besked"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
