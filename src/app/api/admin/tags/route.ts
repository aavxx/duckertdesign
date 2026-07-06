import { requireAdmin } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getChatSession, saveChatSession } from "@/lib/chatStore";
import type { EmailThread } from "@/lib/types";

export async function POST(req: Request) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { type, id, tag, action } = await req.json() as {
    type: "chat" | "email";
    id: string;
    tag: string;
    action: "add" | "remove";
  };

  if (!type || !id || !tag || !action) return new Response("Missing fields", { status: 400 });

  if (type === "chat") {
    const session = await getChatSession(id);
    if (!session) return new Response("Not found", { status: 404 });
    if (!session.tags) session.tags = [];
    if (action === "add") {
      if (!session.tags.includes(tag)) session.tags.push(tag);
    } else {
      session.tags = session.tags.filter((t) => t !== tag);
    }
    await saveChatSession(session);
  } else {
    const key = `email:thread:${id}`;
    const raw = await redis.get<string>(key);
    if (!raw) return new Response("Not found", { status: 404 });
    const thread: EmailThread = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (action === "add") {
      if (!thread.tags.includes(tag)) thread.tags.push(tag);
    } else {
      thread.tags = thread.tags.filter((t) => t !== tag);
    }
    await redis.set(key, JSON.stringify(thread));
  }

  return Response.json({ ok: true });
}
