import { requireAdminKey } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { ImapFlow } from "imapflow";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const authErr = await requireAdminKey(req);
  if (authErr) return authErr;

  const { uid } = await params;
  if (!uid || !/^\d+$/.test(uid)) {
    return new Response("Invalid UID", { status: 400, headers: corsHeaders() });
  }

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

    try {
      const msg = await client.fetchOne(uid, {
        envelope: true,
        source: true,
        flags: true,
      }, { uid: true });

      if (!msg) {
        return new Response("Not found", { status: 404, headers: corsHeaders() });
      }

      const raw = msg.source?.toString("utf8") ?? "";
      const { text, html } = extractBodies(raw);
      const env = msg.envelope;

      return Response.json({
        uid: msg.uid,
        subject: env?.subject ?? "(ingen emne)",
        from: env?.from?.[0]
          ? `${env.from[0].name ?? ""} <${env.from[0].address}>`.trim()
          : "Ukendt",
        to: env?.to?.[0]?.address ?? null,
        date: env?.date?.toISOString() ?? null,
        seen: msg.flags?.has("\\Seen") ?? false,
        text,
        html,
      }, { headers: corsHeaders() });
    } finally {
      lock.release();
    }
  } catch (err) {
    console.error("IMAP fetch body error:", err);
    return new Response("IMAP error", { status: 502, headers: corsHeaders() });
  } finally {
    await client.logout().catch(() => {});
  }
}

// ── Minimal MIME parser ─────────────────────────────────────────────────────

function extractBodies(raw: string): { text: string | null; html: string | null } {
  // Normalise line endings
  const src = raw.replace(/\r\n/g, "\n");
  const sep = src.indexOf("\n\n");
  if (sep === -1) return { text: src, html: null };

  const topHeaders = src.slice(0, sep);
  const body = src.slice(sep + 2);

  const boundary = parseBoundary(topHeaders);
  if (!boundary) {
    if (/content-type:\s*text\/html/i.test(topHeaders)) {
      return { text: null, html: decodeBody(body, topHeaders) };
    }
    return { text: decodeBody(body, topHeaders), html: null };
  }
  return parseParts(body, boundary);
}

function parseParts(
  body: string,
  boundary: string
): { text: string | null; html: string | null } {
  let text: string | null = null;
  let html: string | null = null;

  const re = new RegExp(`--${escapeRe(boundary)}(?:--)?`);
  const parts = body.split(re);

  for (const part of parts) {
    const trimmed = part.trimStart();
    if (!trimmed || trimmed === "--\n" || trimmed === "--") continue;

    const sep = trimmed.indexOf("\n\n");
    if (sep === -1) continue;

    const partHeaders = trimmed.slice(0, sep);
    const partBody = trimmed.slice(sep + 2);

    // Recurse into nested multipart
    const nested = parseBoundary(partHeaders);
    if (nested) {
      const inner = parseParts(partBody, nested);
      text = text ?? inner.text;
      html = html ?? inner.html;
      continue;
    }

    if (/content-type:\s*text\/plain/i.test(partHeaders)) {
      text = text ?? decodeBody(partBody, partHeaders);
    } else if (/content-type:\s*text\/html/i.test(partHeaders)) {
      html = html ?? decodeBody(partBody, partHeaders);
    }
  }

  return { text, html };
}

function parseBoundary(headers: string): string | null {
  const m =
    headers.match(/boundary="([^"]+)"/i) ??
    headers.match(/boundary=([^\s;]+)/i);
  return m?.[1] ?? null;
}

function decodeBody(body: string, headers: string): string {
  const enc = headers.match(/content-transfer-encoding:\s*(\S+)/i)?.[1]?.toLowerCase();
  const cleaned = body.replace(/\n$/, "");
  if (enc === "base64") {
    return Buffer.from(cleaned.replace(/\s+/g, ""), "base64").toString("utf8");
  }
  if (enc === "quoted-printable") {
    return cleaned
      .replace(/=\n/g, "")
      .replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  }
  return cleaned;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
