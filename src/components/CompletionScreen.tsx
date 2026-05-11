import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import type { AnalysisReport } from "@/lib/mockAnalysis"
import type { Question } from "@/types/question"

interface Props {
  totalRounds: number
  roundHistory: { correct: number; total: number }[]
  correctCount: number
  answeredCount: number
  wrongAnswersCount: number
  report: AnalysisReport | null
  isAnalyzing: boolean
  wrongAnswers: { questionId: number; selectedIndex: number; isCorrect: boolean }[]
  questions: Question[]
  onAnalyze: () => void
  onReset: () => void
}

export default function CompletionScreen({
  totalRounds, roundHistory, correctCount, answeredCount,
  wrongAnswersCount, report, isAnalyzing, wrongAnswers, questions, onAnalyze, onReset
}: Props) {
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm">
        <div className="flex flex-col gap-1.5 p-6">
          <div className="font-semibold leading-none tracking-tight text-lg">练习完成！</div>
          <div className="text-muted-foreground text-sm">
            {totalRounds} 轮共 {answeredCount} 题 · 正确率 {accuracy}%（{correctCount}/{answeredCount}）
          </div>
        </div>
        <div className="p-6 pt-0">
          {roundHistory.length > 1 && (
            <div className="mb-4 space-y-1">
              {roundHistory.map((r, i) => (
                <div key={i} className="flex justify-between text-sm text-muted-foreground">
                  <span>第 {i + 1} 轮</span><span>{r.correct}/{r.total}（{Math.round((r.correct / r.total) * 100)}%）</span>
                </div>
              ))}
            </div>
          )}
          {wrongAnswersCount === 0 ? (
            <p className="text-muted-foreground">全部正确，太棒了！</p>
          ) : !report ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">错题 {wrongAnswersCount} 道，点击下方按钮让 AI 帮你分析：</p>
              <Button className="w-full" size="lg" onClick={onAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? <><Loader2 className="animate-spin" />AI 正在分析...</> : "AI 弱点分析"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {report && (
        <div className="bg-card text-card-foreground rounded-xl border shadow-sm">
          <div className="flex flex-col gap-1.5 p-6">
            <div className="font-semibold leading-none tracking-tight">AI 诊断报告</div>
            <div className="text-muted-foreground text-sm">根据你的错题生成的个性化分析</div>
          </div>
          <div className="p-6 pt-0 flex flex-col gap-4">
            <section>
              <h3 className="text-sm font-semibold mb-2">薄弱语法点</h3>
              {report.weakPoints.map((wp, i) => (
                <div key={i} className="bg-secondary/50 rounded-lg p-3 mb-2">
                  <Badge variant="secondary" className="mb-1">{wp.point}</Badge>
                  <p className="text-sm text-muted-foreground">{wp.reason}</p>
                </div>
              ))}
            </section>
            <section>
              <h3 className="text-sm font-semibold mb-2">易混淆点</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {report.confusions.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </section>
            <section>
              <h3 className="text-sm font-semibold mb-2">学习建议</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {report.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </section>
          </div>
        </div>
      )}

      <Button variant="outline" onClick={onReset}>重新开始</Button>
    </main>
  )
}
