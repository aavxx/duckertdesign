"use client";

import { useEffect, useState } from "react";

const CONSENT_COOKIE = "dd_cookie_consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 12 måneder
const SHOW_DELAY_MS = 900;
const EXIT_MS = 320;

function hasConsent(): boolean {
  if (typeof document === "undefined") return true;
  return document.cookie.split("; ").some((c) => c.startsWith(`${CONSENT_COOKIE}=`));
}

function storeConsent(): void {
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${CONSENT_COOKIE}=accepted; max-age=${CONSENT_MAX_AGE}; path=/; SameSite=Lax${secure}`;
  } catch {}
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (hasConsent()) return;
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const accept = () => {
    storeConsent();
    setLeaving(true);
    setTimeout(() => setVisible(false), EXIT_MS);
  };

  if (!visible) return null;

  return (
    <>
      <div
        role="dialog"
        aria-label="Cookie-information"
        style={{
          position: "fixed",
          left: "20px",
          bottom: "20px",
          zIndex: 100,
          width: "min(380px, calc(100vw - 40px))",
          background: "#ffffff",
          border: "1px solid #ebebeb",
          borderRadius: "20px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
          padding: "24px",
          animation: `${leaving ? "ccOut" : "ccIn"} ${leaving ? EXIT_MS : 500}ms cubic-bezier(0.16,1,0.3,1) both`,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#bbb",
            display: "block",
            marginBottom: "10px",
          }}
        >
          🍪 Cookies
        </span>
        <p style={{ fontSize: "14px", color: "#777", lineHeight: 1.7, margin: "0 0 16px" }}>
          Vi bruger kun teknisk nødvendige cookies, der får siden til at fungere — ingen tracking,
          analyse eller markedsføring. Læs mere i vores{" "}
          <a href="/privatlivspolitik" style={{ color: "#1647FB", textDecoration: "underline" }}>
            privatlivspolitik
          </a>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          style={{
            padding: "11px 24px",
            background: "#1647FB",
            color: "#ffffff",
            border: "none",
            borderRadius: "3px",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            cursor: "pointer",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#2355FF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#1647FB";
          }}
        >
          OK, forstået
        </button>
      </div>
      <style>{`
        @keyframes ccIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ccOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(16px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-label="Cookie-information"] { animation: none !important; }
        }
      `}</style>
    </>
  );
}
