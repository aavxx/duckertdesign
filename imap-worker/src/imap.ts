import { ImapFlow } from "imapflow";
import { publishNewEmail } from "./publisher.js";

let retryDelay = 5_000;
const MAX_DELAY = 60_000;

export async function startIdleLoop() {
  while (true) {
    try {
      await runIdle();
      retryDelay = 5_000; // reset on clean exit
    } catch (err) {
      console.error(`[imap] Error: ${err}. Retrying in ${retryDelay / 1000}s`);
      await sleep(retryDelay);
      retryDelay = Math.min(retryDelay * 2, MAX_DELAY);
    }
  }
}

async function runIdle() {
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

  await client.connect();
  console.log("[imap] Connected");

  const lock = await client.getMailboxLock("INBOX");

  try {
    // Listen for EXISTS events (new mail) while in IDLE
    client.on("exists", async (data: { path: string; count: number; prevCount: number }) => {
      if (data.count <= data.prevCount) return;
      console.log(`[imap] New mail detected (count: ${data.prevCount} → ${data.count})`);

      // Fetch the newest message(s)
      const newCount = data.count - data.prevCount;
      const start = data.count - newCount + 1;

      try {
        for await (const msg of client.fetch(`${start}:${data.count}`, {
          uid: true,
          envelope: true,
        })) {
          const from = msg.envelope.from?.[0]
            ? `${msg.envelope.from[0].name ?? ""} <${msg.envelope.from[0].address}>`.trim()
            : "Ukendt";
          const subject = msg.envelope.subject ?? "(ingen emne)";
          console.log(`[imap] Publishing: ${from} — ${subject}`);
          await publishNewEmail(msg.uid, from, subject);
        }
      } catch (fetchErr) {
        console.error("[imap] Failed to fetch new message details:", fetchErr);
      }
    });

    // IDLE loop — imapflow handles keep-alive and re-IDLEing automatically
    await client.idle();
  } finally {
    lock.release();
    await client.logout();
    console.log("[imap] Disconnected");
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
