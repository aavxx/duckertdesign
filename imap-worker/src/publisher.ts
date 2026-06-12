import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function publishNewEmail(uid: number, from: string, subject: string) {
  const event = {
    type: "new_email",
    uid: String(uid),
    from,
    subject,
    ts: Date.now(),
  };
  await redis.publish("admin:events", JSON.stringify(event));
}
