import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useAdminAuth } from "./Login"
import { parseCSVLine } from "@/lib/csv"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

interface QuestionRow {
  id: number
  question: string
  grammar_point: string
  level: string
}

const CATEGORIES = ["全部", "单词", "语法"] as const
const LEVELS = ["全部", "N1", "N2", "N3", "N4", "N5"] as const
const PAGE_SIZE = 100

export default function Dashboard() {
  const isAuth = useAdminAuth()
  const nav = useNavigate()
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [adminCategory, setAdminCategory] = useState<string>("全部")
  const [adminLevel, setAdminLevel] = useState<string>("全部")
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!isAuth) { nav("/admin/login"); return }

    let query = supabase.from("questions").select("id, question, grammar_point, level", { count: "estimated" }).order("id", { ascending: false })

    // 分类筛选
    if (adminCategory === "语法") {
      query = query.neq("grammar_point", "語彙")
    } else if (adminCategory === "单词") {
      query = query.eq("grammar_point", "語彙")
    }

    // 等级筛选
    if (adminLevel !== "全部") {
      query = query.eq("level", adminLevel)
    }

    query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1).then(({ data, count }) => {
      if (data) setQuestions(data as QuestionRow[])
      if (count != null) setTotal(count)
      setLoading(false)
    })
  }, [adminCategory, adminLevel, page])

  useEffect(() => {
    setPage(0)
    setLoading(true)
  }, [adminCategory, adminLevel])

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除这道题？")) return
    setDeleting(id)
    await supabase.from("questions").delete().eq("id", id)
    setQuestions(prev => prev.filter(q => q.id !== id))
    setDeleting(null)
  }

  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState("")
  const [csvCategory, setCsvCategory] = useState<"auto" | "vocab" | "grammar">("auto")

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportMsg("")

    const reader = new FileReader()
    reader.onload = async () => {
      const text = reader.result as string
      const lines = text.split("\n").filter(l => l.trim())
      if (lines.length < 2) { setImportMsg("CSV 至少需要一行表头 + 一行数据"); setImporting(false); return }

      const rows = lines.slice(1).map(line => {
        const cols = parseCSVLine(line)
        if (cols.length < 7) return null
        // 根据导入类型决定 grammar_point
        let gp = cols[6] || ""
        if (csvCategory === "vocab") gp = "語彙"
        else if (csvCategory === "grammar" && gp === "語彙") gp = cols[0].substring(0, 20) // fallback
        return {
          question: cols[0],
          options: [cols[1], cols[2], cols[3], cols[4]],
          correct_index: parseInt(cols[5]) || 0,
          grammar_point: gp,
          level: cols[7] || "N1",
          frequency: cols[8] || null,
          explanation: cols[9] || null,
        }
      }).filter(Boolean)

      if (rows.length === 0) { setImportMsg("没有解析到有效数据行"); setImporting(false); return }

      let ok = 0
      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50)
        const { error } = await supabase.from("questions").insert(batch)
        if (error) { setImportMsg(`失败: ${error.message}`); setImporting(false); return }
        ok += batch.length
      }
      setImportMsg(`成功导入 ${ok} 道题目`)
      setImporting(false)
      // 刷新列表
      window.location.reload()
    }
    reader.readAsText(file)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">题库管理</h1>
          <p className="text-sm text-muted-foreground">约 {total} 道题</p>
        </div>
        <div className="flex gap-2">
          <Link to="/"><Button variant="outline" size="sm">前台</Button></Link>
          <div className="flex items-center gap-1">
            <select value={csvCategory} onChange={e => setCsvCategory(e.target.value as typeof csvCategory)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs">
              <option value="auto">自动</option>
              <option value="vocab">单词</option>
              <option value="grammar">语法</option>
            </select>
            <label className={`cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs ${importing ? "opacity-50 pointer-events-none" : ""}`}>
              {importing ? "导入中..." : "CSV 导入"}
              <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} disabled={importing} />
            </label>
          </div>
          <Link to="/admin/ai-import"><Button variant="outline" size="sm">AI 粘贴</Button></Link>
          <Link to="/admin/new"><Button size="sm"><Plus className="size-4" /> 新增题目</Button></Link>
        </div>
        {importMsg && <p className="text-sm text-muted-foreground">{importMsg}</p>}
      </header>

      <div className="space-y-2">
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <Button key={c} variant={adminCategory === c ? "default" : "outline"} size="sm" onClick={() => setAdminCategory(c)}>
              {c}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {LEVELS.map(l => (
            <Button key={l} variant={adminLevel === l ? "default" : "outline"} size="sm" onClick={() => setAdminLevel(l)}>
              {l}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin size-6 text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {questions.map(q => (
              <div key={q.id} className="flex items-center justify-between bg-card border rounded-lg p-4 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{q.question}</p>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="secondary">{q.level}</Badge>
                    <Badge variant="outline">{q.grammar_point}</Badge>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Link to={`/admin/edit/${q.id}`}>
                    <Button variant="ghost" size="sm"><Pencil className="size-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)} disabled={deleting === q.id}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
