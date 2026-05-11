import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { VocabRow } from "@/lib/dataAdapter"

export default function BrowseTable({ words, level, onBack }: { words: VocabRow[]; level: string; onBack: () => void }) {
  const [page, setPage] = useState(0)
  const SIZE = 25
  const totalPages = Math.ceil(words.length / SIZE)
  const pageWords = words.slice(page * SIZE, (page + 1) * SIZE)

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-bold">{level} · 共 {words.length} 词</h2>
        <Button variant="outline" size="sm" onClick={onBack}>返回</Button>
      </div>
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 p-2 bg-secondary/50 text-xs font-semibold text-muted-foreground border-b">
          <div className="col-span-1">#</div>
          <div className="col-span-3">单词</div>
          <div className="col-span-3">读音</div>
          <div className="col-span-5">释义</div>
        </div>
        {pageWords.map((w, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 p-2 text-sm border-b last:border-0 hover:bg-accent/50">
            <div className="col-span-1 text-muted-foreground text-xs">{page * SIZE + i + 1}</div>
            <div className="col-span-3 font-semibold truncate">{w.word} {w.frequency && <span className="text-[10px] text-muted-foreground ml-0.5">{w.frequency === 'high' ? '高' : w.frequency === 'mid' ? '中' : '低'}</span>}</div>
            <div className="col-span-3 truncate">{w.reading}</div>
            <div className="col-span-5 text-muted-foreground truncate">{w.definition}</div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground">{page + 1}/{totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </>
  )
}
