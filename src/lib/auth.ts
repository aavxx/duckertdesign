import { corsHeaders } from "@/lib/cors";

export function requireAdminKey(req: Request): Response | null {
  const key = req.headers.get("x-admin-key");
  if (!process.env.ADMIN_API_KEY || key !== process.env.ADMIN_API_KEY) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders() });
  }
  return null;
}
