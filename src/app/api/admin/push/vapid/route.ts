import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return Response.json({ error: "VAPID not configured" }, { status: 503 });
  return Response.json({ publicKey: key });
}
