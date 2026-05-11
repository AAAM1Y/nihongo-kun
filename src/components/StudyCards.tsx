import type { Question } from "@/types/question"
import { extractWord, extractReading, extractDefinition } from "@/lib/questionTransform"
import { Button } from "@/components/ui/button"

interface Props {
  studyWords: Question[]
  studyCardIdx: number
  studyCardFlipped: boolean
  setStudyCardIdx: (i: number | ((i: number) => number)) => void
  setStudyCardFlipped: (f: boolean | ((f: boolean) => boolean)) => void
  onExit: () => void
  onStartQuiz: () => void
}

export default function StudyCards({
  studyWords, studyCardIdx, studyCardFlipped,
  setStudyCardIdx, setStudyCardFlipped, onExit, onStartQuiz
}: Props) {
  const card = studyWords[studyCardIdx]
  const word = extractWord(card.question)
  const reading = extractReading(card)
  const def = extractDefinition(card.explanation)

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-12 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">学习 · {studyCardIdx + 1}/{studyWords.length}</h1>
        <Button variant="outline" size="sm" onClick={onExit}>退出</Button>
      </div>

      <div className="w-full bg-secondary rounded-full h-1.5">
        <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${((studyCardIdx + 1) / studyWords.length) * 100}%` }} />
      </div>

      <div
        className="bg-card border rounded-xl p-12 text-center cursor-pointer min-h-[280px] flex flex-col items-center justify-center gap-4 select-none"
        onClick={() => setStudyCardFlipped(f => !f)}
      >
        <p className="text-3xl font-bold">{word}</p>
        {studyCardFlipped && (
          <div className="space-y-2 animate-in fade-in">
            <p className="text-xl text-muted-foreground">{reading}</p>
            <p className="text-sm text-muted-foreground">{def}</p>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">{studyCardFlipped ? "点击收起" : "点击看读音释义"}</p>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => { setStudyCardIdx(i => i - 1); setStudyCardFlipped(false); }} disabled={studyCardIdx === 0}>
          上一张
        </Button>
        {studyCardIdx < studyWords.length - 1 ? (
          <Button onClick={() => { setStudyCardIdx(i => i + 1); setStudyCardFlipped(false); }}>下一张</Button>
        ) : (
          <Button onClick={onStartQuiz}>开始测试</Button>
        )}
      </div>
    </main>
  )
}
