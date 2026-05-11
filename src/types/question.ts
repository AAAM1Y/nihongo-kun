/** 一道选择题 */
export interface Question {
  id: number
  /** 题干 */
  question: string
  /** 四个选项 */
  options: string[]
  /** 正确答案的索引（0开始） */
  correctIndex: number
  /** 所属语法点 */
  grammarPoint: string
  /** JLPT 等级 */
  level: string
  /** 解析说明（可选） */
  explanation?: string
  /** 频率（可选） */
  frequency?: string | null
}

/** 一条答题记录 */
export interface AnswerRecord {
  questionId: number
  selectedIndex: number
  isCorrect: boolean
}

// ── 共享类型 ──
export type AppMode = "practice" | "browse" | "study"
export type Category = "grammar" | "vocab"
export type CountOption = 10 | 15 | 20
