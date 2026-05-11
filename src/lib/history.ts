import type { Question } from "@/types/question"
import { extractWord } from "@/lib/questionTransform"

export interface StudyRecord {
  date: string
  category: "grammar" | "vocab"
  level: string
  mode: "practice" | "study"
  correct: number
  total: number
  wrongWords: { word: string; reading: string; userAnswer: string; correctAnswer: string }[]
}

const KEY = "nihongo-history"

export function getHistory(): StudyRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]")
  } catch {
    return []
  }
}

export function saveRecord(record: StudyRecord) {
  const history = getHistory()
  history.unshift(record) // 新记录在前面
  // 最多保留 100 条
  localStorage.setItem(KEY, JSON.stringify(history.slice(0, 100)))
}

export function clearHistory() {
  localStorage.removeItem(KEY)
}

export function buildRecord(
  category: "grammar" | "vocab",
  level: string,
  mode: "practice" | "study",
  correct: number,
  total: number,
  wrongList: Question[],
  answers: Record<number, number>
): StudyRecord {
  return {
    date: new Date().toISOString(),
    category,
    level,
    mode,
    correct,
    total,
    wrongWords: wrongList.map(w => ({
      word: extractWord(w.question),
      reading: (w.options[w.correctIndex]),
      userAnswer: w.options[answers[w.id]],
      correctAnswer: w.options[w.correctIndex],
    })),
  }
}
