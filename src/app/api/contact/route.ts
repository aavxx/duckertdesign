import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Alle felter skal udfyldes." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Ugyldig emailadresse." },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: "Duckert Design <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL || "hej@duckertdesign.dk",
      replyTo: email,
      subject: `Ny henvendelse fra ${name}`,
      html: `
        <div style="font-family: 'Montserrat', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1647FB; padding: 32px; text-align: center;">
            <h1 style="color: white; font-size: 20px; font-weight: 600; margin: 0;">Duckert Design</h1>
          </div>
          <div style="padding: 40px; background: #ffffff; border: 1px solid #e5e7eb;">
            <h2 style="font-size: 18px; font-weight: 600; color: #0a0a0a; margin-bottom: 24px;">
              Ny henvendelse fra ${name}
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px; width: 80px;">Navn</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px;">Email</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">
                  <a href="mailto:${email}" style="color: #1647FB;">${email}</a>
                </td>
              </tr>
            </table>
            <div style="margin-top: 24px;">
              <p style="color: #6b7280; font-size: 13px; margin-bottom: 8px;">Besked</p>
              <p style="font-size: 14px; color: #0a0a0a; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          <div style="padding: 20px; text-align: center; background: #f9fafb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Sendt via duckertdesign.dk
            </p>
          </div>
        </div>
      `,
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
