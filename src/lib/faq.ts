import { supabase } from "@/lib/supabase";

export type FaqEntry = {
  id: string;
  category: "admin" | "customer";
  question: string;
  answer: string;
  source?: "manual" | "learned";
  createdAt: number;
  updatedAt: number;
};

type FaqRow = {
  id: string;
  category: "admin" | "customer";
  question: string;
  answer: string;
  source: "manual" | "learned";
  created_at: string;
  updated_at: string;
};

export function rowToFaq(row: FaqRow): FaqEntry {
  return {
    id: row.id,
    category: row.category,
    question: row.question,
    answer: row.answer,
    source: row.source,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export async function getFaqEntries(category: "admin" | "customer"): Promise<FaqEntry[]> {
  const { data, error } = await supabase
    .from("faq_entries")
    .select("id, category, question, answer, source, created_at, updated_at")
    .eq("category", category);
  if (error || !data) return [];
  return (data as FaqRow[])
    .map(rowToFaq)
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

export function faqToPromptBlock(entries: FaqEntry[]): string {
  if (!entries.length) return "";
  return entries.map((e) => `[${e.id}] Spørgsmål: ${e.question}\nSvar: ${e.answer}`).join("\n\n");
}
