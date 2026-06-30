import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";
import nodemailer from "nodemailer";
import type { EmailThread, EmailMessage } from "@/lib/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { id } = await params;
  const raw = await redis.get<string>(`email:thread:${id}`);
  if (!raw) return new Response("Not found", { status: 404 });

  const thread: EmailThread = typeof raw === "string" ? JSON.parse(raw) : raw;
  const { body } = await req.json() as { body: string };

  if (!body?.trim()) return new Response("Body required", { status: 400 });

  // Find the original sender to reply to
  const originalMsg = thread.messages.find((m) => m.direction === "inbound");
  const replyTo = originalMsg?.from ?? thread.participants[0];
  const replyToAddr = replyTo.match(/<([^>]+)>/)?.[1] ?? replyTo;
  const replySubject = `Re: ${thread.subject}`;
  const lastInbound = [...thread.messages].reverse().find((m) => m.direction === "inbound");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: parseInt(process.env.SMTP_PORT ?? "587") === 465,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: replyToAddr,
    subject: replySubject,
    text: body.trim(),
    ...(lastInbound?.messageId && {
      inReplyTo: lastInbound.messageId,
      references: lastInbound.messageId,
    }),
  });

  // Store outbound message in thread
  const outMsg: EmailMessage = {
    id: crypto.randomUUID(),
    from: process.env.SMTP_USER ?? "",
    to: replyToAddr,
    subject: replySubject,
    text: body.trim(),
    html: null,
    ts: Date.now(),
    direction: "outbound",
    messageId: info.messageId,
  };

  thread.messages.push(outMsg);
  thread.updatedAt = Date.now();
  thread.status = "waiting";
  await redis.set(`email:thread:${id}`, JSON.stringify(thread));
  await redis.zadd("email:threads:idx", { score: thread.updatedAt, member: id });
  await redis.zadd("inbox:idx", { score: thread.updatedAt, member: `email:${id}` });

  return Response.json({ ok: true });
}
