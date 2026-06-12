import "dotenv/config";
import { startIdleLoop } from "./imap.js";

const required = ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "IMAP_HOST", "IMAP_USER", "IMAP_PASS"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

console.log("[imap-worker] Starting IMAP IDLE listener…");
startIdleLoop().catch((err) => {
  console.error("[imap-worker] Fatal:", err);
  process.exit(1);
});
