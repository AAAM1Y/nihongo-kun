// SRS 间隔重复算法（SM-2 简化版）

export interface SrsRecord {
  questionId: number
  ease: number        // 难度系数，默认 2.5
  interval: number    // 当前间隔（天），0 = 新词/刚错
  nextReview: string  // 下次复习日期 ISO String
  correctStreak: number // 连续答对次数
}

const KEY = "nihongo-srs"

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

/** 读取所有 SRS 记录 */
export function getSrsRecords(): SrsRecord[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]") }
  catch { return [] }
}

/** 保存 SRS 记录 */
function saveRecords(records: SrsRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(records))
}

/** 更新一条记录：答对 → 间隔拉长，答错 → 重置 */
export function updateSRS(questionId: number, isCorrect: boolean) {
  const records = getSrsRecords()
  const idx = records.findIndex(r => r.questionId === questionId)
  const existing = idx >= 0 ? records[idx] : {
    questionId, ease: 2.5, interval: 0, nextReview: daysFromNow(0), correctStreak: 0
  }

  if (isCorrect) {
    existing.ease = Math.max(1.3, existing.ease + 0.15)
    existing.interval = existing.interval === 0 ? 1 : Math.round(existing.interval * existing.ease)
    existing.nextReview = daysFromNow(existing.interval)
    existing.correctStreak += 1
  } else {
    existing.ease = Math.max(1.3, existing.ease - 0.2)
    existing.interval = 0
    existing.nextReview = daysFromNow(0)
    existing.correctStreak = 0
  }

  if (idx >= 0) records[idx] = existing
  else records.push(existing)

  saveRecords(records)
}

/** 获取今日待复习的 questionId 列表 */
export function getDueReviewIds(): number[] {
  const now = new Date().toISOString()
  return getSrsRecords()
    .filter(r => r.nextReview <= now || r.correctStreak < 2)
    .map(r => r.questionId)
}

/** 获取已掌握的 questionId 列表（连续答对 ≥ 2 次） */
export function getMasteredIds(): number[] {
  return getSrsRecords()
    .filter(r => r.correctStreak >= 2)
    .map(r => r.questionId)
}

/** 清除所有 SRS 数据 */
export function clearSrs() {
  localStorage.removeItem(KEY)
}
