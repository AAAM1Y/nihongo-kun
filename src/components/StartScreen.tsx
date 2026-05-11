import { Button } from "@/components/ui/button"
import BrowseTable from "@/components/BrowseTable"
import DataToggle from "@/components/DataToggle"
import StudyStats from "@/components/StudyStats"
import { Loader2 } from "lucide-react"
import type { AppMode, Category, CountOption } from "@/types/question"
import type { VocabRow } from "@/lib/dataAdapter"
import { getDueReviewIds } from "@/lib/srs"

interface Props {
  appMode: AppMode
  setAppMode: (m: AppMode) => void
  category: Category
  setCategory: (c: Category) => void
  selectedLevel: string
  setSelectedLevel: (l: string) => void
  selectedFrequency: string
  setSelectedFrequency: (f: string) => void
  questionCount: CountOption
  setQuestionCount: (n: CountOption) => void
  totalRounds: number
  setTotalRounds: (n: number) => void
  verticalLayout: boolean
  setVerticalLayout: (v: boolean) => void
  browseLoading: boolean
  browsePreview: VocabRow[] | null
  setBrowsePreview: (p: VocabRow[] | null) => void
  onStartPractice: () => void
  onLoadBrowsePreview: () => void
  onStartBrowse: () => void
  onStartStudy: () => void
  onStartSrsReview: () => void
  onOpenHistory: () => void
}

export default function StartScreen(props: Props) {
  const {
    appMode, setAppMode, category, setCategory,
    selectedLevel, setSelectedLevel, selectedFrequency, setSelectedFrequency,
    questionCount, setQuestionCount, totalRounds, setTotalRounds,
    verticalLayout, setVerticalLayout,
    browseLoading, browsePreview, setBrowsePreview,
    onStartPractice, onLoadBrowsePreview, onStartBrowse, onStartStudy, onStartSrsReview,
    onOpenHistory,
  } = props

  const settings = (
    <>
      {/* 题型 */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">题型</h2>
        <div className={verticalLayout ? "flex flex-col gap-2" : "grid grid-cols-2 gap-3"}>
          {(["vocab", "grammar"] as const).map(k => (
            <button key={k}
              onClick={() => setCategory(k)}
              className={`text-left p-3 rounded-lg border-2 transition-colors ${category === k ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
              <div className="font-semibold text-sm">{k === "vocab" ? "词汇题" : "语法题"}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{k === "vocab" ? "単語の読み方" : "尊敬語・謙譲語など"}</div>
            </button>
          ))}
        </div>
      </div>
      {/* 等级 */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">JLPT 等级</h2>
        <div className={verticalLayout ? "flex flex-col gap-1" : "flex gap-2"}>
          {["N5","N4","N3","N2","N1"].map(lvl => (
            <Button key={lvl} variant={selectedLevel === lvl ? "default" : "outline"} size="sm"
              className={verticalLayout ? "justify-start" : "flex-1"}
              onClick={() => setSelectedLevel(lvl)}>{lvl}</Button>
          ))}
        </div>
      </div>
      {/* 频率 */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">频率</h2>
        <div className={verticalLayout ? "flex flex-col gap-1" : "flex gap-2"}>
          {(["全部"].concat(
            selectedLevel === "N1" ? ["高频","中频","低频"] :
            selectedLevel === "N2" || selectedLevel === "N3" ? ["高频","低频"] : []
          )).map(f => (
            <Button key={f} variant={selectedFrequency === f ? "default" : "outline"} size="sm"
              className={verticalLayout ? "justify-start" : "flex-1"}
              onClick={() => setSelectedFrequency(f)}>{f}</Button>
          ))}
        </div>
      </div>
      {appMode !== "browse" && (
        <>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">每次题量</h2>
            <div className={verticalLayout ? "flex flex-col gap-1" : "flex gap-2"}>
              {([10,15,20] as const).map(n => (
                <Button key={n} variant={questionCount === n ? "default" : "outline"}
                  className={verticalLayout ? "justify-start" : "flex-1"}
                  onClick={() => setQuestionCount(n)}>{n} 题</Button>
              ))}
            </div>
          </div>
          {appMode === "practice" && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">练习轮次</h2>
              <div className={verticalLayout ? "flex flex-col gap-1" : "flex gap-2"}>
                {([1,2,3] as const).map(n => (
                  <Button key={n} variant={totalRounds === n ? "default" : "outline"}
                    className={verticalLayout ? "justify-start" : "flex-1"}
                    onClick={() => setTotalRounds(n)}>{n === 1 ? "单轮" : `${n} 轮`}</Button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )

  return (
    <main className={`min-h-screen mx-auto px-4 py-12 flex flex-col gap-6 ${verticalLayout ? "max-w-4xl" : "max-w-lg"}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nihongo-Kun</h1>
          <p className="text-muted-foreground text-sm">日语能力考练习 · AI 弱点分析</p>
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={onOpenHistory}>学习记录</Button>
          <DataToggle />
          <Button variant={verticalLayout ? "ghost" : "outline"} size="sm" onClick={() => setVerticalLayout(!verticalLayout)}>
            {verticalLayout ? "横排" : "竖排"}
          </Button>
        </div>
      </div>

      <StudyStats />

      {/* 模式选择 */}
      <div className="flex gap-1">
        {([["practice","练习","随机抽题考试"],["browse","背词","浏览全部词汇"],["study","学测","先学后测闭环"]] as const).map(([key, label, desc]) => (
          <button key={key as string}
            onClick={() => setAppMode(key as AppMode)}
            className={`flex-1 text-center p-3 rounded-lg border-2 transition-colors ${appMode === key ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
            <div className="font-semibold text-sm">{label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
          </button>
        ))}
      </div>

      {/* SRS 复习入口 */}
      <SrsButton onClick={onStartSrsReview} />

      {verticalLayout ? (
        <div className="flex gap-8">
          <div className="w-56 shrink-0 flex flex-col gap-5 border-r pr-6">{settings}</div>
          <div className="flex-1 flex flex-col gap-4 overflow-auto">
            {appMode === "browse" && browseLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin size-6 text-muted-foreground" /></div>
            ) : appMode === "browse" && browsePreview ? (
              <BrowseTable words={browsePreview} level={selectedLevel} onBack={() => setBrowsePreview(null)} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <p className="text-xl font-semibold">
                  {appMode === "browse" ? "背词" : appMode === "study" ? "学测" : "练习"} · {category === "grammar" ? "语法" : "词汇"} · {selectedLevel}
                </p>
                <p className="text-muted-foreground text-sm">
                  {appMode === "browse" ? "浏览全部词汇" : `${questionCount} 题${appMode === "practice" && totalRounds > 1 ? ` × ${totalRounds} 轮` : ""}`}
                </p>
                <Button size="lg" className="text-lg h-12 px-12" onClick={() => {
                  if (appMode === "practice") onStartPractice()
                  else if (appMode === "browse") onLoadBrowsePreview()
                  else onStartStudy()
                }}>
                  开始{appMode === "practice" ? "练习" : appMode === "browse" ? "背词" : "学习"}
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {settings}
          <Button size="lg" className="w-full text-lg h-12" onClick={() => {
            if (appMode === "practice") onStartPractice()
            else if (appMode === "browse") onStartBrowse()
            else onStartStudy()
          }}>
            开始{appMode === "practice" ? "练习" : appMode === "browse" ? "背词" : "学习"}
          </Button>
        </>
      )}
    </main>
  )
}

// ── SRS 按钮 ──
function SrsButton({ onClick }: { onClick: () => void }) {
  const due = getDueReviewIds().length
  return (
    <button onClick={onClick} disabled={due === 0}
      className="w-full text-left p-3 rounded-lg border-2 border-dashed border-amber-400 hover:border-amber-500 bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-sm">今日待复习</div>
          <div className="text-xs text-muted-foreground mt-0.5">SRS 智能间隔复习</div>
        </div>
        <span className="text-lg font-bold text-amber-600">{due === 0 ? "暂无" : `${due} 题`}</span>
      </div>
    </button>
  )
}
