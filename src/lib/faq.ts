import { redis } from "@/lib/redis";

export type FaqEntry = {
  id: string;
  category: "admin" | "customer";
  question: string;
  answer: string;
  createdAt: number;
  updatedAt: number;
};

export async function getFaqEntries(category: "admin" | "customer"): Promise<FaqEntry[]> {
  const ids = await redis.smembers(`faq:${category}:idx`);
  if (!ids.length) return [];
  const entries: FaqEntry[] = [];
  for (const id of ids) {
    const raw = await redis.get<string>(`faq:${category}:${id}`);
    if (!raw) continue;
    try { entries.push(typeof raw === "string" ? JSON.parse(raw) : raw); } catch {}
  }
  return entries.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

export function faqToPromptBlock(entries: FaqEntry[]): string {
  if (!entries.length) return "";
  return entries.map((e) => `[${e.id}] Spørgsmål: ${e.question}\nSvar: ${e.answer}`).join("\n\n");
}
