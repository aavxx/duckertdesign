import { requireAdminKey } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import nodemailer from "nodemailer";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  const authErr = requireAdminKey(req);
  if (authErr) return authErr;

  let to: string, subject: string, body: string, inReplyTo: string | undefined;
  try {
    ({ to, subject, body, inReplyTo } = await req.json());
  } catch {
    return new Response("Bad request", { status: 400, headers: corsHeaders() });
  }

  if (!to || !subject || !body) {
    return new Response("Missing to, subject, or body", { status: 400, headers: corsHeaders() });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: parseInt(process.env.SMTP_PORT ?? "587") === 465,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text: body,
      ...(inReplyTo && { inReplyTo, references: inReplyTo }),
    });
    return Response.json({ ok: true }, { headers: corsHeaders() });
  } catch (err) {
    console.error("SMTP send error:", err);
    return new Response("SMTP error", { status: 502, headers: corsHeaders() });
  }
}
