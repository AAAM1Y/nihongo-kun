// 从题干字符串中提取结构化数据，统一处理 `「XX」的读音是什么？` 格式

import type { Question } from "@/types/question"

/** 从题干提取单词 */
export function extractWord(question: string): string {
  return question.replace("「", "").replace("」的读音是什么？", "").replace("」の読み方は？", "")
}

/** 从 options + correctIndex 提取读音 */
export function extractReading(question: Question): string {
  return question.options[question.correctIndex]
}

/** 从 explanation 提取释义（格式：XX（读音）—— 释义） */
export function extractDefinition(explanation?: string): string {
  return (explanation || "").split("——")[1]?.trim() || ""
}

/** 格式化频率 */
export function formatFrequency(freq?: string | null): string {
  if (freq === "high") return "高"
  if (freq === "mid") return "中"
  if (freq === "low") return "低"
  return ""
}

/** 从 Question 生成 VocabRow */
export function questionToVocabRow(q: Question): { word: string; reading: string; definition: string; level: string; frequency: string | null } {
  return {
    word: extractWord(q.question),
    reading: extractReading(q),
    definition: extractDefinition(q.explanation),
    level: q.level,
    frequency: q.frequency ?? null,
  }
}
