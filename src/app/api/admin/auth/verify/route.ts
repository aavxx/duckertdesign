import { redis } from "@/lib/redis";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  let email: string, code: string;
  try {
    ({ email, code } = await req.json());
  } catch {
    return Response.json({ error: "Ugyldig forespørgsel" }, { status: 400 });
  }

  const stored = await redis.get<string>(`admin:otp:${email.toLowerCase()}`);
  if (!stored || String(stored) !== String(code)) {
    return Response.json({ error: "Forkert eller udløbet kode." }, { status: 401 });
  }

  await redis.del(`admin:otp:${email.toLowerCase()}`);
  const token = randomBytes(32).toString("hex");
  await redis.set(`admin:session:${token}`, email, { ex: 3600 });

  return Response.json({ token });
}
