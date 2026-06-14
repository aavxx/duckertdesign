import { requireAdminKey } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { ImapFlow } from "imapflow";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: Request) {
  const authErr = await requireAdminKey(req);
  if (authErr) return authErr;

  const client = new ImapFlow({
    host: process.env.IMAP_HOST!,
    port: parseInt(process.env.IMAP_PORT ?? "993"),
    secure: true,
    auth: {
      user: process.env.IMAP_USER!,
      pass: process.env.IMAP_PASS!,
    },
    logger: false,
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    const emails: object[] = [];

    try {
      // Fetch last 50 messages, newest first
      const status = await client.status("INBOX", { messages: true });
      const total = status.messages ?? 0;
      const start = Math.max(1, total - 49);

      for await (const msg of client.fetch(`${start}:*`, {
        uid: true,
        envelope: true,
        bodyStructure: true,
        flags: true,
      })) {
        const env = msg.envelope;
        const flags = msg.flags;
        emails.push({
          uid: msg.uid,
          subject: env?.subject ?? "(ingen emne)",
          from: env?.from?.[0]
            ? `${env.from[0].name ?? ""} <${env.from[0].address}>`.trim()
            : "Ukendt",
          date: env?.date?.toISOString() ?? null,
          seen: flags?.has("\\Seen") ?? false,
        });
      }
    } finally {
      lock.release();
    }

    await client.logout();
    return Response.json(emails.reverse(), { headers: corsHeaders() });
  } catch (err) {
    console.error("IMAP fetch error:", err);
    return new Response("IMAP error", { status: 502, headers: corsHeaders() });
  }
}
