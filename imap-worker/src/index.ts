import { startIdleLoop } from "./imap.js";

const required = ["IMAP_HOST", "IMAP_USER", "IMAP_PASS", "WEBHOOK_URL", "WEBHOOK_SECRET"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

console.log(`[imap-worker] starting — host=${process.env.IMAP_HOST} user=${process.env.IMAP_USER}`);
startIdleLoop().catch((err) => {
  console.error("[imap-worker] fatal error:", err);
  process.exit(1);
});
