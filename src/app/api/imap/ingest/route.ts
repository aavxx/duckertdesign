import { redis } from "@/lib/redis";
import type { EmailThread, EmailMessage, AdminEvent } from "@/lib/types";

export async function POST(req: Request) {
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.IMAP_WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: {
    uid: number;
    messageId?: string;
    inReplyTo?: string;
    subject: string;
    from: string;
    to: string;
    text: string | null;
    html: string | null;
    ts: number;
  };

  try {
    payload = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const { uid, messageId, inReplyTo, subject, from, to, text, html, ts } = payload;

  // Dedup: check if UID already processed
  const existing = await redis.get<string>(`email:uid:${uid}`);
  if (existing) return Response.json({ ok: true, duplicate: true });

  // Determine thread: match by inReplyTo → messageId, or by subject
  let threadId: string | null = null;

  if (inReplyTo) {
    threadId = await redis.get<string>(`email:msgid:${inReplyTo}`);
  }

  if (!threadId) {
    const normalizedSubject = subject.replace(/^(Re:|Fw:|Fwd:)\s*/i, "").trim().toLowerCase();
    threadId = await redis.get<string>(`email:subject:${normalizedSubject}`);
  }

  const now = Date.now();
  const msgId = crypto.randomUUID();

  const message: EmailMessage = {
    id: msgId,
    from,
    to,
    subject,
    text,
    html,
    ts: ts ?? now,
    direction: "inbound",
    messageId,
    inReplyTo,
  };

  if (threadId) {
    // Add to existing thread
    const raw = await redis.get<string>(`email:thread:${threadId}`);
    if (raw) {
      const thread: EmailThread = typeof raw === "string" ? JSON.parse(raw) : raw;
      thread.messages.push(message);
      thread.updatedAt = now;
      thread.status = "new";
      if (!thread.participants.includes(from)) thread.participants.push(from);
      await redis.set(`email:thread:${threadId}`, JSON.stringify(thread));
    }
  } else {
    // Create new thread
    threadId = crypto.randomUUID();
    const thread: EmailThread = {
      id: threadId,
      subject,
      participants: [from],
      messages: [message],
      status: "new",
      tags: [],
      createdAt: now,
      updatedAt: now,
    };
    await redis.set(`email:thread:${threadId}`, JSON.stringify(thread));

    // Index by subject for future threading
    const normalizedSubject = subject.replace(/^(Re:|Fw:|Fwd:)\s*/i, "").trim().toLowerCase();
    await redis.set(`email:subject:${normalizedSubject}`, threadId, { ex: 60 * 60 * 24 * 90 });
  }

  // Index by messageId for reply threading
  if (messageId) {
    await redis.set(`email:msgid:${messageId}`, threadId, { ex: 60 * 60 * 24 * 90 });
  }

  // Map UID → threadId for dedup
  await redis.set(`email:uid:${uid}`, threadId, { ex: 60 * 60 * 24 * 90 });

  // Update sorted set indices
  await redis.zadd("email:threads:idx", { score: now, member: threadId });
  await redis.zadd("inbox:idx", { score: now, member: `email:${threadId}` });

  // Publish to admin SSE channel
  const event: AdminEvent = {
    type: "new_email",
    threadId,
    from,
    subject,
    ts: now,
  };
  await redis.publish("admin:events", JSON.stringify(event)).catch(() => {});

  return Response.json({ ok: true, threadId });
}
