import { redis } from "@/lib/redis";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";

const enc = new TextEncoder();

export async function GET(req: Request) {
  // EventSource can't send custom headers — accept token as query param
  const url = new URL(req.url);
  const token = req.headers.get("x-admin-key") ?? url.searchParams.get("token");
  if (!token) return new Response("Unauthorized", { status: 401 });
  const email = await redis.get<string>(`admin:session:${token}`);
  if (!email) return new Response("Unauthorized", { status: 401 });
  await redis.expire(`admin:session:${token}`, 3600).catch(() => {});

  const subscriber = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  let closed = false;
  let heartbeat: ReturnType<typeof setInterval>;

  const sub = subscriber.subscribe<string>("admin:events");

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      heartbeat = setInterval(() => {
        if (closed) return;
        try { ctrl.enqueue(enc.encode(": heartbeat\n\n")); } catch { closed = true; clearInterval(heartbeat); }
      }, 15_000);

      sub.on("message", (event) => {
        if (closed) return;
        try {
          const data = typeof event.message === "string" ? event.message : JSON.stringify(event.message);
          ctrl.enqueue(enc.encode(`data: ${data}\n\n`));
        } catch { closed = true; }
      });
    },
    cancel() {
      closed = true;
      clearInterval(heartbeat);
      sub.unsubscribe().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
