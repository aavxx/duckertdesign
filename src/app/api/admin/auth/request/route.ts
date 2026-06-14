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
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:'Montserrat',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f9f9;padding:48px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
      <tr>
        <td style="background:#ffffff;border-radius:50px;padding:52px 52px 44px;position:relative;">
          <!-- Blue square top-right -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
            <tr>
              <td style="vertical-align:top;">
                <p style="font-family:'Montserrat',Arial,sans-serif;font-size:24px;font-weight:800;color:#080808;margin:0;letter-spacing:-0.03em;">Hej ${name},</p>
              </td>
              <td align="right" style="vertical-align:top;padding-left:16px;">
                <div style="width:69px;height:69px;background:#1647FB;border-radius:16px;display:inline-block;"></div>
              </td>
            </tr>
          </table>
          <p style="font-family:'Montserrat',Arial,sans-serif;font-size:14px;color:rgba(8,8,8,0.6);margin:0 0 6px;line-height:1.75;">Du modtager denne mail fordi du har bedt om adgang til Mit Duckert Design.</p>
          <p style="font-family:'Montserrat',Arial,sans-serif;font-size:14px;color:rgba(8,8,8,0.6);margin:0 0 32px;line-height:1.75;">Din midlertidige login-kode er:</p>
          <!-- Code block -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
            <tr>
              <td align="center" style="background:#f0f4ff;border-radius:18px;border:2px solid rgba(22,71,251,0.15);padding:28px 16px;">
                <span style="font-family:'Montserrat',Arial,sans-serif;font-size:52px;font-weight:800;color:#1647FB;letter-spacing:0.3em;display:block;">${code}</span>
              </td>
            </tr>
          </table>
          <p style="font-family:'Montserrat',Arial,sans-serif;font-size:13px;color:rgba(8,8,8,0.55);margin:0 0 6px;line-height:1.65;">Indtast koden på siden for at logge ind. Koden udløber om <strong>5 minutter</strong>.</p>
          <!-- Divider -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
            <tr><td style="border-top:1px solid rgba(0,0,0,0.06);padding-top:24px;">
              <p style="font-family:'Montserrat',Arial,sans-serif;font-size:12px;color:rgba(8,8,8,0.32);margin:0;line-height:1.6;">
                Hvis du ikke har bedt om denne kode, kan du roligt se bort fra denne mail.
              </p>
            </td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 0 0;text-align:center;">
          <p style="font-family:'Montserrat',Arial,sans-serif;font-size:12px;color:rgba(8,8,8,0.3);margin:0;">Duckert Design · mit.duckert.design</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
