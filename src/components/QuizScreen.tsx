import type { Question } from "@/types/question"
import type { AnalysisReport } from "@/lib/mockAnalysis"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface Props {
  currentQuestion: Question
  currentIndex: number
  totalQuestions: number
  answeredCount: number
  category: string
  appMode: string
  totalRounds: number
  isComplete: boolean
  answers: Record<number, number>
  selectAnswer: (qid: number, idx: number) => void
  goPrev: () => void
  goNext: () => void
  correctCount: number
  wrongAnswers: { questionId: number; selectedIndex: number; isCorrect: boolean }[]
  roundHistory: { correct: number; total: number }[]
  report: AnalysisReport | null
  isAnalyzing: boolean
  onAnalyze: () => void
  onReset: () => void
}

export default function QuizScreen({
  currentQuestion, currentIndex, totalQuestions, answeredCount,
  category, appMode, totalRounds, isComplete,
  answers, selectAnswer, goPrev, goNext,
  correctCount, wrongAnswers, roundHistory,
  report, isAnalyzing, onAnalyze, onReset,
}: Props) {
  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          Nihongo-Kun · {category === "grammar" ? "语法" : "词汇"}{" "}
          {appMode === "study" ? "学测" : totalRounds > 1 ? `第` : ""}
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{answeredCount} / {totalQuestions} 题</span>
          <Button variant="outline" size="sm" onClick={onReset}>主页</Button>
        </div>
      </header>

      <div className="w-full bg-secondary rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }} />
      </div>

      {!isComplete ? (
        <div className="bg-card text-card-foreground rounded-xl border shadow-sm">
          <div className="flex flex-col gap-1.5 p-6">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{currentQuestion.level}</Badge>
              {currentQuestion.frequency && (
                <Badge variant="outline" className="text-[10px]">{currentQuestion.frequency === 'high' ? '高频' : currentQuestion.frequency === 'mid' ? '中频' : '低频'}</Badge>
              )}
              <Badge variant="outline">{currentQuestion.grammarPoint}</Badge>
            </div>
            <div className="font-semibold leading-none tracking-tight text-lg mt-2">
              第 {currentIndex + 1} 题：{currentQuestion.question}
            </div>
          </div>
          <div className="p-6 pt-0 flex flex-col gap-2">
            {currentQuestion.options.map((option, i) => {
              const isSelected = answers[currentQuestion.id] === i
              const isCorrectAnswer = i === currentQuestion.correctIndex
              const showResult = answers[currentQuestion.id] !== undefined
              let variant: "default" | "destructive" | "outline" | "secondary" = "outline"
              if (showResult) {
                if (isCorrectAnswer) variant = "default"
                else if (isSelected) variant = "destructive"
                else variant = "secondary"
              }
              return (
                <Button key={i} variant={variant} size="lg" className="justify-start text-left w-full"
                  disabled={showResult} onClick={() => selectAnswer(currentQuestion.id, i)}>
                  <span className="font-mono mr-2">{String.fromCharCode(65 + i)}.</span>
                  {option}
                </Button>
              )
            })}
          </div>
          {answers[currentQuestion.id] !== undefined && currentQuestion.explanation && (
            <div className="flex items-center p-6 pt-0">
              <p className="text-muted-foreground text-sm">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bg-card text-card-foreground rounded-xl border shadow-sm">
            <div className="flex flex-col gap-1.5 p-6">
              <div className="font-semibold leading-none tracking-tight text-lg">完成！</div>
              <div className="text-muted-foreground text-sm">
                {appMode === "study" ? "学测" : `${totalRounds} 轮`} · 正确率{" "}
                {Math.round((correctCount / answeredCount) * 100)}%（{correctCount}/{answeredCount}）
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
              {wrongAnswers.length > 0 && !report && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">错题 {wrongAnswers.length} 道，点击下方按钮让 AI 帮你分析：</p>
                  <Button className="w-full" size="lg" onClick={onAnalyze} disabled={isAnalyzing}>
                    {isAnalyzing ? <><Loader2 className="animate-spin" />AI 正在分析...</> : "AI 弱点分析"}
                  </Button>
                </div>
              )}
              {wrongAnswers.length === 0 && !report && (
                <p className="text-muted-foreground">全部正确，太棒了！</p>
              )}
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
        </>
      )}

      {!isComplete && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={goPrev} disabled={currentIndex === 0}>上一题</Button>
          <Button onClick={goNext} disabled={currentIndex === totalQuestions - 1}>下一题</Button>
        </div>
      )}

      {isComplete && <Button variant="outline" onClick={onReset}>重新开始</Button>}
    </main>
  )
}
