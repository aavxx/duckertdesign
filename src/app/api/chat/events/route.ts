import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";

const enc = new TextEncoder();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400 });
  }

  const subscriber = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  let controller: ReadableStreamDefaultController<Uint8Array>;
  let closed = false;
  // eslint-disable-next-line prefer-const
  let heartbeatInterval: ReturnType<typeof setInterval>;

  const sub = subscriber.subscribe<string>(`chat:reply:${sessionId}`);

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      controller = ctrl;

      heartbeatInterval = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(enc.encode(": heartbeat\n\n"));
        } catch {
          closed = true;
          clearInterval(heartbeatInterval);
        }
      }, 8_000);

      sub.on("message", (event) => {
        if (closed) return;
        try {
          const data = typeof event.message === "string" ? event.message : JSON.stringify(event.message);
          controller.enqueue(enc.encode(`data: ${data}\n\n`));
        } catch {
          closed = true;
        }
      });
    },
    cancel() {
      closed = true;
      clearInterval(heartbeatInterval);
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
