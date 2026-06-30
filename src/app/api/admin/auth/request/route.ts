import { redis } from "@/lib/redis";
import { Resend } from "resend";

export async function POST(req: Request) {
  let email: string;
  try {
    ({ email } = await req.json());
  } catch {
    return Response.json({ error: "Ugyldig forespørgsel" }, { status: 400 });
  }

  if (!email?.includes("@")) {
    return Response.json({ error: "Ugyldig e-mailadresse" }, { status: 400 });
  }

  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!allowed.includes(email.toLowerCase())) {
    return Response.json({ error: "Denne e-mailadresse er ikke registreret" }, { status: 404 });
  }

  const code = String(Math.floor(1000 + Math.random() * 9000));
  await redis.set(`admin:otp:${email.toLowerCase()}`, code, { ex: 300 });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const name = email.split("@")[0].split(".")[0];
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  await resend.emails.send({
    from: process.env.RESEND_FROM ?? "Duckert Design <noreply@duckert.design>",
    to: email,
    subject: "Din login-kode",
    html: `<!DOCTYPE html><html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:40px 20px;background:#f9f9f9;font-family:Arial,sans-serif;">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;">
  <div style="width:48px;height:48px;background:#1647FB;border-radius:12px;margin:0 0 24px;"></div>
  <h1 style="font-size:20px;font-weight:700;color:#080808;margin:0 0 8px;">Hej ${displayName},</h1>
  <p style="color:rgba(8,8,8,0.55);font-size:14px;margin:0 0 28px;line-height:1.6;">Her er din 4-cifrede login-kode til Mit Duckert Design. Koden udløber om 5 minutter.</p>
  <div style="background:#f0f4ff;border:2px solid rgba(22,71,251,0.2);border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
    <span style="font-size:48px;font-weight:800;color:#1647FB;letter-spacing:0.25em;">${code}</span>
  </div>
  <p style="color:rgba(8,8,8,0.35);font-size:12px;margin:0;line-height:1.6;">Hvis du ikke bad om denne kode, kan du ignorere denne mail.</p>
</div>
</body></html>`,
  });

  return Response.json({ ok: true });
}
