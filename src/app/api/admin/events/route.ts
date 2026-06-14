import { requireAdminKey } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";

const enc = new TextEncoder();

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: Request) {
  const authErr = await requireAdminKey(req);
  if (authErr) return authErr;

  const subscriber = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  let controller: ReadableStreamDefaultController<Uint8Array>;
  let closed = false;
  // eslint-disable-next-line prefer-const
  let heartbeatInterval: ReturnType<typeof setInterval>;

  const sub = subscriber.subscribe<string>("admin:events");

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
      }, 20_000);

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
      ...corsHeaders(),
    },
  });
}
