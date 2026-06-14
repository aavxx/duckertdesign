import { corsHeaders } from "@/lib/cors";
import { redis } from "@/lib/redis";
import { randomBytes } from "crypto";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  let email: string, code: string;
  try {
    ({ email, code } = await req.json());
  } catch {
    return Response.json({ error: "Ugyldig forespørgsel" }, { status: 400, headers: corsHeaders() });
  }

  const stored = await redis.get(`admin:otp:${email.toLowerCase()}`);
  if (!stored || String(stored) !== String(code)) {
    return Response.json(
      { error: "Forkert eller udløbet kode. Prøv igen." },
      { status: 401, headers: corsHeaders() }
    );
  }

  await redis.del(`admin:otp:${email.toLowerCase()}`);

  const token = randomBytes(32).toString("hex");
  // 15-minute session (sliding window refreshed on each request)
  await redis.set(`admin:session:${token}`, email, { ex: 900 });

  return Response.json({ token }, { headers: corsHeaders() });
}
