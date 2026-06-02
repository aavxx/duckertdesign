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

  const inputStyle = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #ebebeb",
    padding: "16px 0",
    fontSize: "15px",
    fontFamily: "Montserrat, sans-serif",
    color: "#080808",
    outline: "none",
    transition: "border-color 0.2s",
    display: "block",
  };

  const labelStyle = {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "#aaa",
    display: "block",
    marginBottom: "4px",
    marginTop: "40px",
  };

  return (
    <section
      id="kontakt"
      style={{
        background: "#ffffff",
        padding: "120px 40px",
      }}
    >
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            marginBottom: "64px",
            borderBottom: "1px solid #ebebeb",
            paddingBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#aaa",
              margin: 0,
            }}
          >
            Kontakt
          </h2>
        </div>

        <h3
          style={{
            fontSize: "clamp(32px, 4vw, 56px)",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            color: "#080808",
            margin: "0 0 24px",
          }}
        >
          Lad os bygge noget fedt.
        </h3>
        <p
          style={{
            fontSize: "15px",
            color: "#888",
            lineHeight: 1.8,
            margin: "0 0 56px",
          }}
        >
          Har du et projekt i tankerne? Skriv til os og vi vender tilbage inden for 24 timer.
        </p>

        {/* Form */}
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
                marginBottom: "24px",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h4 style={{ fontSize: "24px", fontWeight: 600, color: "#080808", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Besked sendt!</h4>
            <p style={{ fontSize: "15px", color: "#888", margin: 0 }}>Vi vender tilbage hurtigst muligt.</p>
            <button
              onClick={() => setStatus("idle")}
              style={{ marginTop: "32px", background: "none", border: "none", color: "#1647FB", fontSize: "13px", fontFamily: "Montserrat, sans-serif", fontWeight: 600, letterSpacing: "0.08em", cursor: "pointer", padding: 0, textTransform: "uppercase" }}
            >
              Send ny besked →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={{ ...labelStyle, marginTop: 0 }}>Navn</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Dit navn"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderBottomColor = "#1647FB")}
              onBlur={(e) => (e.target.style.borderBottomColor = "#ebebeb")}
            />
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="din@email.dk"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderBottomColor = "#1647FB")}
              onBlur={(e) => (e.target.style.borderBottomColor = "#ebebeb")}
            />
            <label style={labelStyle}>Besked</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Fortæl om dit projekt..."
              style={{ ...inputStyle, resize: "none" }}
              onFocus={(e) => (e.target.style.borderBottomColor = "#1647FB")}
              onBlur={(e) => (e.target.style.borderBottomColor = "#ebebeb")}
            />
            {status === "error" && (
              <p style={{ color: "#ff4444", fontSize: "13px", marginTop: "16px" }}>{errorMsg}</p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                marginTop: "40px",
                width: "100%",
                padding: "18px",
                background: "#1647FB",
                color: "#fff",
                border: "none",
                fontSize: "11px",
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: status === "loading" ? "not-allowed" : "pointer",
                opacity: status === "loading" ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => status !== "loading" && (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = status === "loading" ? "0.6" : "1")}
            >
              {status === "loading" ? "Sender..." : "Send besked"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
