import { updateSRS, getDueReviewIds, getMasteredIds } from "@/lib/srs"
import { useState, useEffect, useCallback, useRef } from "react"
import { useQuizStore } from "@/hooks/useQuizStore"
import { supabase } from "@/lib/supabase"
import type { Question } from "@/types/question"
import { getCount, fetchQuestions } from "@/lib/dataAdapter"
import type { VocabRow } from "@/lib/dataAdapter"
import { mockAnalyze, type AnalysisReport } from "@/lib/mockAnalysis"
import { saveRecord, buildRecord } from "@/lib/history"
import { useBrowse } from "@/hooks/useBrowse"
import { Button } from "@/components/ui/button"
import CompletionScreen from "@/components/CompletionScreen"
import StartScreen from "@/components/StartScreen"
import HistoryScreen from "@/components/HistoryScreen"
import StudyCards from "@/components/StudyCards"
import QuizScreen from "@/components/QuizScreen"
import BrowseTable from "@/components/BrowseTable"
import { Loader2 } from "lucide-react"

type AppMode = "practice" | "browse" | "study"
type Category = "grammar" | "vocab"
type CountOption = 10 | 15 | 20
type Screen = "start" | "quiz" | "complete" | "roundBreak" | "browseTable" | "studyCards" | "history"

export default function QuizApp() {
  // ── 模式 ──
  const [appMode, setAppMode] = useState<AppMode>("practice")
  const [category, setCategory] = useState<Category>("vocab")
  const [selectedLevel, setSelectedLevel] = useState("N1")
  const [selectedFrequency, setSelectedFrequency] = useState<string>("全部")
  const [questionCount, setQuestionCount] = useState<CountOption>(10)
  const [verticalLayout, setVerticalLayout] = useState(true)
  const [totalRounds, setTotalRounds] = useState(1)
  const [currentRound, setCurrentRound] = useState(0)

  // ── 题目 & 状态 ──
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roundHistory, setRoundHistory] = useState<{ correct: number; total: number }[]>([])
  const [screen, setScreen] = useState<Screen>("start")

  // ── 背词 ──
  const clearKey = `${category}-${selectedLevel}-${selectedFrequency}`
  const { browseWords, setBrowseWords, browsePreview, setBrowsePreview, browseLoading, loadBrowsePreview, startBrowse } = useBrowse(clearKey)

  // ── 学测 ──
  const [studyWords, setStudyWords] = useState<Question[]>([])
  const [studyCardIdx, setStudyCardIdx] = useState(0)
  const [studyCardFlipped, setStudyCardFlipped] = useState(false)

  const {
    currentIndex, currentQuestion, answers, selectAnswer,
    goNext, goPrev, totalQuestions, answeredCount, isComplete,
    wrongAnswers, correctCount, reset,
  } = useQuizStore(questions)

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const quizSession = useRef({ category, level: selectedLevel, mode: appMode === "study" ? "study" as const : "practice" as const })

  const queryOpts = useCallback(() => ({
    category, level: selectedLevel, frequency: selectedFrequency
  }), [category, selectedLevel, selectedFrequency])

  // ── 练习：开始一轮 ──
  const startPracticeRound = useCallback(async (round: number, wordList?: Question[]) => {
    setLoading(true)
    setReport(null)
    reset()
    quizSession.current = { category, level: selectedLevel, mode: appMode === "study" ? "study" : "practice" }

    if (wordList) {
      const shuffled = [...wordList].sort(() => Math.random() - 0.5)
      setQuestions(shuffled.slice(0, questionCount))
    } else {
      const opts = queryOpts()
      const count = await getCount(opts)
      if (count === 0) { setError("该分类暂无题目"); setLoading(false); return }
      const offset = Math.floor(Math.random() * Math.max(0, count - questionCount))
      const limit = Math.min(questionCount * 3, count)
      const data = await fetchQuestions({ ...opts, offset, limit })
      const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, questionCount)
      setQuestions(shuffled)
    }

    setCurrentRound(round)
    setScreen("quiz")
    setLoading(false)
  }, [queryOpts, questionCount, reset])

  // ── 背词 wrapper ──
  const startBrowseFull = useCallback(async () => {
    setLoading(true)
    await startBrowse(queryOpts())
    setScreen("browseTable")
    setLoading(false)
  }, [startBrowse, queryOpts])

  const loadBrowsePreviewFull = useCallback(async () => {
    await loadBrowsePreview(queryOpts())
  }, [loadBrowsePreview, queryOpts])

  // 切等级时重置频率
  useEffect(() => {
    if (selectedLevel === "N4" || selectedLevel === "N5") setSelectedFrequency("全部")
    else if ((selectedLevel === "N2" || selectedLevel === "N3") && selectedFrequency === "中频") setSelectedFrequency("全部")
  }, [selectedLevel])

  // ── 学测：加载 N 个词 ──
  const startStudy = useCallback(async () => {
    setLoading(true)
    setStudyCardIdx(0)
    setStudyCardFlipped(false)
    const opts = queryOpts()
    const count = await getCount(opts)
    if (count === 0) { setError('该分类暂无题目'); setLoading(false); return }
    const offset = Math.floor(Math.random() * Math.max(0, count - questionCount))
    const limit = Math.min(questionCount * 3, count)
    const data = await fetchQuestions({ ...opts, offset, limit })
    const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, questionCount)
    setStudyWords(shuffled)
    setScreen('studyCards')
    setLoading(false)
  }, [queryOpts, questionCount])

  // ── SRS 复习 ──
  const startSrsReview = useCallback(async () => {
    setLoading(true)
    setReport(null)
    reset()
    quizSession.current = { category: "vocab", level: "SRS", mode: "practice" }

    const dueIds = getDueReviewIds().slice(0, 30)
    if (dueIds.length === 0) { setError("暂无待复习题目，先去做一些练习吧！"); setLoading(false); return }

    // 按 ID 批量取题
    const chunkSize = 100
    const allData: Question[] = []
    for (let i = 0; i < dueIds.length; i += chunkSize) {
      const batch = dueIds.slice(i, i + chunkSize)
      const { data: batchData, error: batchErr } = await supabase.from("questions").select("*").in("id", batch)
      if (batchErr) { setError(batchErr.message); setLoading(false); return }
      if (batchData) allData.push(...(batchData as unknown as Record<string, unknown>[]).map(parseRow))
    }

    if (allData.length === 0) { setError("无法加载复习题目"); setLoading(false); return }
    setQuestions(allData)
    setCurrentRound(1)
    setScreen("quiz")
    setLoading(false)
  }, [reset])

  // ── 始测试 ──
  const startStudyQuiz = () => startPracticeRound(1, studyWords)

  // ── 解析行数据 ──
  function parseRow(row: Record<string, unknown>): Question {
    return {
      id: row.id as number,
      question: row.question as string,
      options: row.options as string[],
      correctIndex: row.correct_index as number,
      grammarPoint: row.grammar_point as string,
      level: row.level as string,
      explanation: (row.explanation as string) ?? undefined,
      frequency: (row.frequency as string) ?? null,
    }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    const result = await mockAnalyze(wrongAnswers, questions)
    setReport(result)
    setIsAnalyzing(false)
  }

  const handleRoundComplete = () => {
    setRoundHistory(prev => [...prev, { correct: correctCount, total: answeredCount }])
    // 保存最后一轮记录到 localStorage
    if (wrongAnswers.length > 0 || correctCount > 0) {
      const s = quizSession.current
      saveRecord(buildRecord(s.category, s.level, s.mode, correctCount, answeredCount, wrongAnswers.map(w => questions.find(q => q.id === w.questionId)!).filter(Boolean) as Question[], answers))
    }
    // 更新 SRS 记录
    for (const q of questions) {
      const selected = answers[q.id]
      if (selected !== undefined) updateSRS(q.id, selected === q.correctIndex)
    }
    if (currentRound < totalRounds) setScreen("roundBreak")
    else setScreen("complete")
  }

  const handleReset = () => {
    setError(null); setReport(null); setRoundHistory([])
    setCurrentRound(0); setScreen("start"); setBrowseWords([]); setBrowsePreview(null)
    setStudyWords([]); setStudyCardIdx(0); reset()
  }

  useEffect(() => {
    if (isComplete && questions.length > 0 && screen === "quiz") handleRoundComplete()
  }, [isComplete])

  // ── 答对自动跳题 ──
  useEffect(() => {
    if (!currentQuestion || isComplete || screen !== "quiz") return
    const selected = answers[currentQuestion.id]
    if (selected !== undefined && selected === currentQuestion.correctIndex && currentIndex < totalQuestions - 1) {
      const timer = setTimeout(goNext, 1500)
      return () => clearTimeout(timer)
    }
  }, [answers, currentIndex, screen])

  // ═══════════════════════════════════════════════
  // 渲染
  // ═══════════════════════════════════════════════

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin size-8 text-muted-foreground" /></main>
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-destructive font-semibold">加载失败</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={handleReset}>返回</Button>
        </div>
      </main>
    )
  }

  // ═══ 开始页面 ═══
  if (screen === "start") {
    return (
      <StartScreen
        appMode={appMode} setAppMode={setAppMode}
        category={category} setCategory={setCategory}
        selectedLevel={selectedLevel} setSelectedLevel={setSelectedLevel}
        selectedFrequency={selectedFrequency} setSelectedFrequency={setSelectedFrequency}
        questionCount={questionCount} setQuestionCount={setQuestionCount}
        totalRounds={totalRounds} setTotalRounds={setTotalRounds}
        verticalLayout={verticalLayout} setVerticalLayout={setVerticalLayout}
        browseLoading={browseLoading} browsePreview={browsePreview} setBrowsePreview={setBrowsePreview}
        onStartPractice={() => startPracticeRound(1)}
        onLoadBrowsePreview={loadBrowsePreviewFull}
        onStartBrowse={startBrowseFull}
        onStartStudy={startStudy}
        onStartSrsReview={startSrsReview}
        onOpenHistory={() => setScreen("history")}
      />
    )
  }

  // ═══ 背词：词汇表 ═══
  if (screen === "browseTable") {
    return <BrowseTable words={browseWords} level={selectedLevel} onBack={() => setScreen("start")} />
  }

  // ═══ 学测：学习卡片 ═══
  if (screen === "studyCards") {
    return (
      <StudyCards
        studyWords={studyWords}
        studyCardIdx={studyCardIdx} studyCardFlipped={studyCardFlipped}
        setStudyCardIdx={setStudyCardIdx} setStudyCardFlipped={setStudyCardFlipped}
        onExit={() => setScreen("start")}
        onStartQuiz={startStudyQuiz}
      />
    )
  }

  // ═══ 学习记录 ═══
  if (screen === "history") {
    return <HistoryScreen onBack={() => setScreen("start")} onCleared={() => setScreen("start")} />
  }

  // ═══ 最终完成 ═══
  if (screen === "complete") {
    const overallCorrect = roundHistory.reduce((a, r) => a + r.correct, 0)
    const overallTotal = roundHistory.reduce((a, r) => a + r.total, 0)
    return (
      <CompletionScreen
        totalRounds={totalRounds} roundHistory={roundHistory}
        correctCount={overallCorrect} answeredCount={overallTotal}
        wrongAnswersCount={wrongAnswers.length}
        report={report} isAnalyzing={isAnalyzing}
        wrongAnswers={wrongAnswers} questions={questions}
        onAnalyze={handleAnalyze} onReset={handleReset}
      />
    )
  }

  // ═══ 轮间休息 ═══
  if (screen === "roundBreak") {
    const last = roundHistory[roundHistory.length - 1]
    const overallCorrect = roundHistory.reduce((a, r) => a + r.correct, 0)
    const overallTotal = roundHistory.reduce((a, r) => a + r.total, 0)
    return (
      <main className="min-h-screen max-w-lg mx-auto px-4 py-16 flex flex-col gap-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">第 {currentRound} 轮完成</h1>
          <p className="text-muted-foreground">
            本轮正确率 {Math.round((last.correct / last.total) * 100)}%（{last.correct}/{last.total}）
          </p>
          <p className="text-sm text-muted-foreground">
            累计 {overallCorrect}/{overallTotal} · 剩余 {totalRounds - currentRound} 轮
          </p>
        </div>
        <Button size="lg" className="w-full" onClick={() => startPracticeRound(currentRound + 1)}>
          开始第 {currentRound + 1} 轮
        </Button>
      </main>
    )
  }

  // ═══ 答题页面（练习 / 学测共用） ═══
  return (
    <QuizScreen
      currentQuestion={currentQuestion}
      currentIndex={currentIndex}
      totalQuestions={totalQuestions}
      answeredCount={answeredCount}
      category={category}
      appMode={appMode}
      totalRounds={totalRounds}
      isComplete={isComplete}
      answers={answers}
      selectAnswer={selectAnswer}
      goPrev={goPrev}
      goNext={goNext}
      correctCount={correctCount}
      wrongAnswers={wrongAnswers}
      roundHistory={roundHistory}
      report={report}
      isAnalyzing={isAnalyzing}
      onAnalyze={handleAnalyze}
      onReset={handleReset}
    />
  )
}