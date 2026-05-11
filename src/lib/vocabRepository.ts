import { supabase } from "@/lib/supabase"
import { loadLocalQuestions, queryLocal } from "@/lib/localData"
import { isLocal } from "@/lib/dataSource"
import { extractWord, extractDefinition } from "@/lib/questionTransform"
import type { Question } from "@/types/question"
import type { QueryOpts } from "@/lib/questionRepository"

export interface VocabRow { word: string; reading: string; definition: string; level: string; frequency: string | null }

export async function fetchAllVocab(opts: QueryOpts): Promise<VocabRow[]> {
  if (isLocal()) {
    const all = await loadLocalQuestions()
    return queryLocal(all, { ...opts, count: 100000, offset: 0 }).data.map(toVocabRow)
  }
  let q = supabase.from("questions").select("question, options, correct_index, explanation, level, frequency")
  if (opts.category === "grammar") q = q.neq("grammar_point", "語彙").eq("level", opts.level)
  else q = q.eq("grammar_point", "語彙").eq("level", opts.level)
  const fk = opts.frequency === "高频" ? "high" : opts.frequency === "中频" ? "mid" : opts.frequency === "低频" ? "low" : null
  if (fk) q = q.eq("frequency", fk)
  const { data } = await q.limit(5000)
  if (!data) return []
  return (data as unknown as Record<string, unknown>[]).map(toVocabRow)
}

function toVocabRow(row: Record<string, unknown> | Question): VocabRow {
  return {
    word: extractWord(row.question as string),
    reading: (row.options as string[])[(row as Record<string, unknown>).correct_index as number ?? (row as Question).correctIndex],
    definition: extractDefinition(row.explanation as string),
    level: row.level as string,
    frequency: (row.frequency as string) || null,
  }
}
