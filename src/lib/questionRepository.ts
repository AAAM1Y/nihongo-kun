import { supabase } from "@/lib/supabase"
import { loadLocalQuestions, queryLocal, countLocal } from "@/lib/localData"
import { isLocal } from "@/lib/dataSource"
import type { Question } from "@/types/question"

export interface QueryOpts {
  category: "grammar" | "vocab"
  level: string
  frequency: string
}

function freqKey(f: string): string | null {
  return f === "高频" ? "high" : f === "中频" ? "mid" : f === "低频" ? "low" : null
}

export async function getCount(opts: QueryOpts): Promise<number> {
  if (isLocal()) {
    const all = await loadLocalQuestions()
    return countLocal(all, opts)
  }
  let q = supabase.from("questions").select("id", { count: "estimated", head: true })
  if (opts.category === "grammar") q = q.neq("grammar_point", "語彙").eq("level", opts.level)
  else q = q.eq("grammar_point", "語彙").eq("level", opts.level)
  const fk = freqKey(opts.frequency)
  if (fk) q = q.eq("frequency", fk)
  const { count } = await q
  return count || 0
}

export async function fetchQuestions(opts: QueryOpts & { offset: number; limit: number }): Promise<Question[]> {
  if (isLocal()) {
    const all = await loadLocalQuestions()
    return queryLocal(all, { ...opts, count: opts.limit, offset: opts.offset }).data
  }
  let q = supabase.from("questions").select("*")
  if (opts.category === "grammar") q = q.neq("grammar_point", "語彙").eq("level", opts.level)
  else q = q.eq("grammar_point", "語彙").eq("level", opts.level)
  const fk = freqKey(opts.frequency)
  if (fk) q = q.eq("frequency", fk)
  const { data } = await q.range(opts.offset, opts.offset + opts.limit - 1)
  if (!data) return []
  return (data as unknown as Record<string, unknown>[]).map(r => ({
    id: r.id as number,
    question: r.question as string,
    options: r.options as string[],
    correctIndex: r.correct_index as number,
    grammarPoint: r.grammar_point as string,
    level: r.level as string,
    frequency: (r.frequency as string) || null,
    explanation: (r.explanation as string) ?? undefined,
  }))
}
