import { useMemo } from "react"
import { getHistory } from "@/lib/history"
import { getDueReviewIds, getMasteredIds } from "@/lib/srs"

export default function StudyStats() {
  const stats = useMemo(() => {
    const history = getHistory()
    const today = new Date().toISOString().slice(0, 10)

    // 今日数据
    const todayRecords = history.filter(r => r.date.slice(0, 10) === today)
    const todayQuestions = todayRecords.reduce((a, r) => a + r.total, 0)
    const todayCorrect = todayRecords.reduce((a, r) => a + r.correct, 0)
    const todayAccuracy = todayQuestions > 0 ? Math.round((todayCorrect / todayQuestions) * 100) : 0

    // SRS
    const dueCount = getDueReviewIds().length
    const masteredCount = getMasteredIds().length

    // 连续学习天数
    const dates = [...new Set(history.map(r => r.date.slice(0, 10)))].sort().reverse()
    let streak = 0
    const now = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().slice(0, 10)
      if (dates.includes(ds)) streak++
      else break
    }

    return { todayQuestions, todayAccuracy, dueCount, masteredCount, streak }
  }, [])

  return (
    <div className="grid grid-cols-5 gap-2">
      {([
        ["今日", `${stats.todayQuestions}题`],
        ["正确率", `${stats.todayAccuracy}%`],
        ["待复习", `${stats.dueCount}题`],
        ["已掌握", `${stats.masteredCount}词`],
        ["连续", `${stats.streak}天`],
      ] as const).map(([label, value]) => (
        <div key={label} className="bg-card border rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-sm font-bold mt-0.5">{value}</div>
        </div>
      ))}
    </div>
  )
}
