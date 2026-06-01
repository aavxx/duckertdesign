"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
        setErrorMsg(data.error || "Noget gik galt. Prøv igen.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Kunne ikke sende beskeden. Tjek din forbindelse.");
      setStatus("error");
    }
  };

  return (
    <section id="kontakt" className="py-32 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#1647FB] font-medium mb-6">
              Kontakt
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-8">
              Lad os bygge noget fedt sammen.
            </h2>
            <p className="text-gray-500 leading-relaxed mb-10">
              Har du et projekt i tankerne? Skriv til os og vi vender tilbage inden for 24 timer.
            </p>
            <div className="space-y-4 text-sm text-gray-500">
              <p>
                <span className="font-medium text-gray-900">Email</span>
                <br />
                hej@duckertdesign.dk
              </p>
              <p>
                <span className="font-medium text-gray-900">Placering</span>
                <br />
                Danmark
              </p>
            </div>
          </div>

          <div>
            {status === "success" ? (
              <div className="h-full flex flex-col justify-center">
                <div className="w-12 h-12 bg-[#1647FB] flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-2">Besked sendt!</h3>
                <p className="text-gray-500">Tak for din henvendelse. Vi vender tilbage hurtigst muligt.</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-8 text-sm text-[#1647FB] font-medium hover:underline"
                >
                  Send en ny besked
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">
                    Navn
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Dit navn"
                    className="w-full border-b border-gray-200 pb-3 text-sm outline-none focus:border-[#1647FB] transition-colors duration-200 placeholder:text-gray-300 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="din@email.dk"
                    className="w-full border-b border-gray-200 pb-3 text-sm outline-none focus:border-[#1647FB] transition-colors duration-200 placeholder:text-gray-300 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">
                    Besked
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Fortæl os om dit projekt..."
                    className="w-full border-b border-gray-200 pb-3 text-sm outline-none focus:border-[#1647FB] transition-colors duration-200 placeholder:text-gray-300 bg-transparent resize-none"
                  />
                </div>
                {status === "error" && (
                  <p className="text-red-500 text-sm">{errorMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-4 bg-[#1647FB] text-white text-sm font-medium tracking-wide hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? "Sender..." : "Send besked"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
