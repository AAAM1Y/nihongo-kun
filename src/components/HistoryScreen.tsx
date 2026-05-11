import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getHistory, clearHistory } from "@/lib/history"

interface Props {
  onBack: () => void
  onCleared: () => void
}

export default function HistoryScreen({ onBack, onCleared }: Props) {
  const records = getHistory()

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">学习记录</h1>
        <div className="flex gap-2">
          {records.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => { clearHistory(); onCleared() }}>清空</Button>
          )}
          <Button variant="outline" size="sm" onClick={onBack}>返回</Button>
        </div>
      </header>

      {records.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>暂无学习记录</p>
          <p className="text-sm mt-1">完成一轮练习或学测后自动记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.slice(0, 50).map((r, i) => (
            <div key={i} className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{r.level}</Badge>
                  <Badge variant="outline">{r.category === "grammar" ? "语法" : "词汇"}</Badge>
                  <Badge variant="outline">{r.mode === "practice" ? "练习" : "学测"}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.date).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-semibold">{Math.round((r.correct / r.total) * 100)}%</span>
                <span className="text-muted-foreground">{r.correct}/{r.total}</span>
                {r.wrongWords.length > 0 && <span className="text-destructive text-xs">错 {r.wrongWords.length} 词</span>}
              </div>
              {r.wrongWords.length > 0 && (
                <details className="mt-2 text-xs text-muted-foreground">
                  <summary className="cursor-pointer">查看错词</summary>
                  <div className="mt-1 space-y-1">
                    {r.wrongWords.map((w, j) => (
                      <div key={j} className="flex gap-2">
                        <span className="font-semibold">{w.word}</span>
                        <span>你选: <span className="text-destructive">{w.userAnswer}</span></span>
                        <span>正确: <span className="text-green-600">{w.correctAnswer}</span></span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
