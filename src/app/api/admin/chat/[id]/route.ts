import { requireAdmin } from "@/lib/auth";
import { getChatSession } from "@/lib/chatStore";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { id } = await params;
  const session = await getChatSession(id);
  if (!session) return new Response("Not found", { status: 404 });

  return Response.json(session);
}
