import { corsHeaders } from "@/lib/cors";
import { supabase } from "@/lib/supabase";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  let sessionId: string, rating: number;
  try {
    ({ sessionId, rating } = await req.json());
  } catch {
    return new Response("Bad request", { status: 400, headers: corsHeaders() });
  }

  if (!sessionId || typeof rating !== "number" || rating < 1 || rating > 5) {
    return new Response("Missing sessionId or rating", { status: 400, headers: corsHeaders() });
  }

  const { error } = await supabase.from("chat_feedback").insert({
    session_id: sessionId,
    rating,
  });
  if (error) console.error("Supabase feedback error:", error.message);

  return Response.json({ ok: true }, { headers: corsHeaders() });
}
