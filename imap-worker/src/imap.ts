import { ImapFlow } from "imapflow";

const WEBHOOK_URL = process.env.WEBHOOK_URL!;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET!;

async function postToWebhook(payload: object): Promise<void> {
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-secret": WEBHOOK_SECRET,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Webhook failed ${res.status}: ${text}`);
  }
}

async function processUid(client: ImapFlow, uid: number): Promise<void> {
  try {
    // Fetch envelope + raw source for body parsing
    const msg = await client.fetchOne(
      String(uid),
      { envelope: true, source: true },
      { uid: true }
    ) as { uid: number; envelope: {
      messageId?: string; inReplyTo?: string; subject?: string; date?: string | Date;
      from?: Array<{ name?: string; address?: string }>;
      to?: Array<{ name?: string; address?: string }>;
    }; source?: Buffer };

    if (!msg?.envelope) return;

    const { envelope } = msg;
    const fmtAddr = (parts?: Array<{ name?: string; address?: string }>) => {
      if (!parts?.length) return "";
      const p = parts[0];
      return p.name ? `${p.name} <${p.address}>` : (p.address ?? "");
    };

    let text: string | null = null;
    let html: string | null = null;

    if (msg.source) {
      const src = msg.source.toString("utf8");
      const textM = src.match(/Content-Type:\s*text\/plain[^\r\n]*\r\n(?:[^\r\n]+\r\n)*\r\n([\s\S]*?)(?:\r\n--[^\n]|$)/i);
      const htmlM = src.match(/Content-Type:\s*text\/html[^\r\n]*\r\n(?:[^\r\n]+\r\n)*\r\n([\s\S]*?)(?:\r\n--[^\n]|$)/i);
      if (textM) text = textM[1].trim();
      if (htmlM) html = htmlM[1].trim();
      if (!text && !html) text = src;
    }

    await postToWebhook({
      uid: msg.uid,
      messageId: envelope.messageId,
      inReplyTo: envelope.inReplyTo,
      subject: envelope.subject ?? "(ingen emne)",
      from: fmtAddr(envelope.from),
      to: fmtAddr(envelope.to),
      text,
      html,
      ts: envelope.date ? new Date(envelope.date).getTime() : Date.now(),
    });

    console.log(`[imap-worker] posted uid=${uid} subject="${envelope.subject}"`);
  } catch (err) {
    console.error(`[imap-worker] failed to process uid=${uid}:`, err);
  }
}

export async function startIdleLoop(): Promise<void> {
  let backoff = 2_000;

  while (true) {
    const client = new ImapFlow({
      host: process.env.IMAP_HOST!,
      port: parseInt(process.env.IMAP_PORT ?? "993"),
      secure: parseInt(process.env.IMAP_PORT ?? "993") === 993,
      auth: { user: process.env.IMAP_USER!, pass: process.env.IMAP_PASS! },
      logger: false,
    });

    try {
      await client.connect();
      console.log("[imap-worker] connected");
      backoff = 2_000;

      const lock = await client.getMailboxLock("INBOX");

      // Process any unseen on startup
      const unseenUids = await client.search({ unseen: true });
      if (unseenUids.length) {
        console.log(`[imap-worker] ${unseenUids.length} unseen on startup`);
        for (const uid of unseenUids) await processUid(client, uid);
      }

      // EXISTS fires when new messages arrive during IDLE
      client.on("exists", async (info: { count: number; prevCount: number }) => {
        if (info.count <= info.prevCount) return;
        const newUids = await client.search({ unseen: true });
        for (const uid of newUids) await processUid(client, uid);
      });

      // IDLE loop: imapflow's idle() resolves after ~29 min or on EXISTS
      while (true) {
        await client.idle();
      }
    } catch (err) {
      console.error("[imap-worker] error:", err);
      try { client.close(); } catch {}
    } finally {
      lock?.release?.();
    }

    console.log(`[imap-worker] reconnecting in ${backoff / 1000}s`);
    await new Promise((r) => setTimeout(r, backoff));
    backoff = Math.min(backoff * 2, 60_000);
  }
}
