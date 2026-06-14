import { corsHeaders } from "@/lib/cors";
import { redis } from "@/lib/redis";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  let email: string;
  try {
    ({ email } = await req.json());
  } catch {
    return Response.json({ error: "Ugyldig forespørgsel" }, { status: 400, headers: corsHeaders() });
  }

  if (!email?.includes("@")) {
    return Response.json({ error: "Ugyldig e-mailadresse" }, { status: 400, headers: corsHeaders() });
  }

  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!allowed.includes(email.toLowerCase())) {
    return Response.json(
      { error: "Denne e-mailadresse er ikke registreret i systemet" },
      { status: 404, headers: corsHeaders() }
    );
  }

  const code = String(Math.floor(1000 + Math.random() * 9000));
  await redis.set(`admin:otp:${email.toLowerCase()}`, code, { ex: 300 });

  const namePart = email.split("@")[0].split(".")[0].split("+")[0];
  const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);

  await resend.emails.send({
    from: process.env.RESEND_FROM ?? "Duckert Design <noreply@duckert.design>",
    to: email,
    subject: "Din login-kode til mit.duckert.design",
    html: buildEmailHtml(name, code),
  });

  return Response.json({ ok: true }, { headers: corsHeaders() });
}

function buildEmailHtml(name: string, code: string): string {
  return `<!DOCTYPE html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f9f9;padding:48px 20px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;">
      <tr>
        <td style="background:#1647FB;padding:24px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-family:Arial,sans-serif;font-size:18px;font-weight:bold;color:#ffffff;letter-spacing:-0.02em;">Duckert Design</td>
              <td align="right"><div style="width:28px;height:28px;background:rgba(255,255,255,0.2);border-radius:6px;display:inline-block;"></div></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:40px 40px 16px;">
          <p style="font-family:Arial,sans-serif;font-size:22px;font-weight:bold;color:#080808;margin:0 0 20px;letter-spacing:-0.02em;">Hej ${name},</p>
          <p style="font-family:Arial,sans-serif;font-size:14px;color:rgba(8,8,8,0.6);margin:0 0 8px;line-height:1.7;">Du modtager denne mail fordi du har bedt om adgang til mit.duckert.design.</p>
          <p style="font-family:Arial,sans-serif;font-size:14px;color:rgba(8,8,8,0.6);margin:0 0 28px;line-height:1.7;">Din midlertidige kode er:</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="background:#f0f4ff;border-radius:14px;border:2px solid rgba(22,71,251,0.15);padding:24px 16px;">
                <span style="font-family:Arial,sans-serif;font-size:48px;font-weight:bold;color:#1647FB;letter-spacing:0.25em;">${code}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 40px;">
          <p style="font-family:Arial,sans-serif;font-size:13px;color:rgba(8,8,8,0.55);margin:0 0 6px;line-height:1.6;">Indtast koden på siden for at logge ind.</p>
          <p style="font-family:Arial,sans-serif;font-size:13px;color:rgba(8,8,8,0.55);margin:0 0 28px;line-height:1.6;">Koden udløber om <strong>5 minutter</strong>, så brug den med det samme.</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="border-top:1px solid rgba(0,0,0,0.07);padding-top:24px;">
              <p style="font-family:Arial,sans-serif;font-size:12px;color:rgba(8,8,8,0.35);margin:0;line-height:1.6;">
                Hvis du ikke har bedt om denne kode, kan du se bort fra denne mail.<br>
                Har du spørgsmål, er du altid velkommen til at kontakte os.
              </p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
