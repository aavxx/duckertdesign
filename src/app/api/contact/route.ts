import { NextResponse } from "next/server";
import { Resend } from "resend";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function row(label: string, value: string | undefined) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:160px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;vertical-align:top;">${value}</td>
    </tr>`;
}

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const body = await req.json();
    const {
      name, email, message,
      // new fields
      category, categoryLabel, clientId,
      platformUrl, browser, errorType,
      invoiceNumber, invoiceDate,
      projectType, budget, startDate,
      requestType,
      originalContactDate,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Navn og e-mail skal udfyldes." }, { status: 400 });
    }
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Ugyldig emailadresse." }, { status: 400 });
    }
    // Legacy form requires message; new form doesn't
    if (!category && !message) {
      return NextResponse.json({ error: "Besked skal udfyldes." }, { status: 400 });
    }

    const subject = category
      ? `[${categoryLabel ?? category}] Henvendelse fra ${name}`
      : `Ny henvendelse fra ${name}`;

    const html = `
      <div style="font-family:'Montserrat',Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1647FB;padding:28px 32px;">
          <h1 style="color:#fff;font-size:18px;font-weight:700;margin:0;letter-spacing:-0.02em;">Duckert Design</h1>
          ${categoryLabel ? `<p style="color:rgba(255,255,255,0.65);font-size:12px;margin:6px 0 0;letter-spacing:0.05em;text-transform:uppercase;">${categoryLabel}</p>` : ""}
        </div>
        <div style="padding:36px 32px;background:#fff;border:1px solid #e5e7eb;border-top:none;">
          <h2 style="font-size:17px;font-weight:700;color:#080808;margin:0 0 24px;letter-spacing:-0.02em;">
            Henvendelse fra ${name}
          </h2>
          <table style="width:100%;border-collapse:collapse;">
            ${row("Navn", name)}
            ${row("E-mail", `<a href="mailto:${email}" style="color:#1647FB;">${email}</a>`)}
            ${row("Klient-ID", clientId)}
            ${row("Kategori", categoryLabel)}
            ${row("URL på siden", platformUrl ? `<a href="${platformUrl}" style="color:#1647FB;">${platformUrl}</a>` : undefined)}
            ${row("Browser & enhed", browser)}
            ${row("Type af fejl", errorType)}
            ${row("Fakturanummer", invoiceNumber)}
            ${row("Fakturadato", invoiceDate)}
            ${row("Projekttype", projectType)}
            ${row("Budget", budget)}
            ${row("Ønsket startdato", startDate)}
            ${row("Anmodningstype", requestType)}
            ${row("Dato for henvendelse", originalContactDate)}
          </table>
          ${message ? `
          <div style="margin-top:24px;">
            <p style="color:#6b7280;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 10px;">Besked</p>
            <p style="font-size:14px;color:#080808;line-height:1.7;white-space:pre-wrap;margin:0;padding:16px;background:#f9fafb;border-radius:8px;border:1px solid #f3f4f6;">${message}</p>
          </div>` : ""}
        </div>
        <div style="padding:16px 32px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">Sendt via kundeservice.duckert.design/mail</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Duckert Design <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL || "hej@duckertdesign.dk",
      replyTo: email,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json(
      { error: "Beskeden kunne ikke sendes. Prøv igen senere." },
      { status: 500 }
    );
  }
}
