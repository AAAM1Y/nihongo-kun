import type { Question } from "@/types/question"

let cache: Question[] | null = null

export async function loadLocalQuestions(): Promise<Question[]> {
  if (cache) return cache
  const res = await fetch("/local/questions.json")
  const raw = (await res.json()) as { id?: number; question: string; options: string[]; correctIndex: number; grammarPoint: string; level: string; frequency: string | null; explanation: string | null }[]
  cache = raw.map((r, i) => ({
    id: r.id ?? i + 1,
    question: r.question,
    options: r.options,
    correctIndex: r.correctIndex,
    grammarPoint: r.grammarPoint,
    level: r.level,
    frequency: r.frequency,
    explanation: r.explanation ?? undefined,
  }))
  return cache
}

/** 模拟 count + range 查询 */
export function queryLocal(
  questions: Question[],
  opts: { category: "grammar" | "vocab"; level: string; frequency: string; count: number; offset: number }
): { data: Question[]; total: number } {
  let filtered = questions.filter(q => {
    const isVocab = q.grammarPoint === "語彙"
    if (opts.category === "grammar") {
      if (isVocab) return false
    } else {
      if (!isVocab) return false
    }
    if (opts.level !== "全部" && q.level !== opts.level) return false
    if (opts.frequency !== "全部") {
      const f = opts.frequency === "高频" ? "high" : opts.frequency === "中频" ? "mid" : "low"
      if (q.frequency !== f) return false
    }
    return true
  })

  return {
    total: filtered.length,
    data: filtered.slice(opts.offset, opts.offset + opts.count),
  }
}

/** 本地模式计数 */
export function countLocal(
  questions: Question[],
  opts: { category: "grammar" | "vocab"; level: string; frequency: string }
): number {
  return queryLocal(questions, { ...opts, count: 0, offset: 0 }).total
}
