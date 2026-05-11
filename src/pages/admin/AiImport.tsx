import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useAdminAuth } from "./Login"
import { parseAiQuestions } from "@/lib/parseAiQuestions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

export interface ParsedQuestion {
  question: string
  options: string[]
  correctIndex: number
  grammarPoint: string
  level: string
}

export default function AiImport() {
  const isAuth = useAdminAuth()
  const nav = useNavigate()

  const [text, setText] = useState("")
  const [parsed, setParsed] = useState<ParsedQuestion[]>([])
  const [level, setLevel] = useState("N1")
  const [importing, setImporting] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    if (!isAuth) nav("/admin/login")
  }, [isAuth, nav])

  if (!isAuth) return null

  const parseText = () => {
    const questions = parseAiQuestions(text, level)
    setParsed(questions)
    setMsg(questions.length > 0 ? `解析出 ${questions.length} 道题` : "未能解析，请检查粘贴格式")
  }

  const handleImport = async () => {
    if (parsed.length === 0) return
    setImporting(true)
    let ok = 0
    for (let i = 0; i < parsed.length; i += 50) {
      const batch = parsed.slice(i, i + 50).map(q => ({
        question: q.question,
        options: q.options.slice(0, 4),
        correct_index: q.correctIndex,
        grammar_point: q.grammarPoint || "語彙",
        level: q.level || level,
        explanation: null,
      }))
      const { error } = await supabase.from("questions").insert(batch)
      if (error) { setMsg(`导入失败: ${error.message}`); setImporting(false); return }
      ok += batch.length
    }
    // 同时更新本地 JSON
    setMsg(`成功导入 ${ok} 道题`)
    setParsed([])
    setText("")
    setImporting(false)
  }

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">AI 粘贴导入</h1>
          <p className="text-sm text-muted-foreground">粘贴 AI 返回的题目内容，自动解析并导入题库</p>
        </div>
        <Link to="/admin"><Button variant="outline" size="sm">返回后台</Button></Link>
      </header>

      <div className="flex items-center gap-2">
        <span className="text-sm">默认等级：</span>
        {["N1", "N2", "N3", "N4", "N5"].map(l => (
          <Button key={l} variant={level === l ? "default" : "outline"} size="sm" onClick={() => setLevel(l)}>{l}</Button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={"粘贴 AI 返回的题目到这里...\n\n支持三种格式：\n1. CSV 逗号分隔\n2. Markdown 表格\n3. 编号格式（1. 题干 / A. 选项 / B. 选项...）"}
        className="w-full h-48 rounded-lg border border-input bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
      />

      <div className="flex gap-2">
        <Button onClick={parseText} disabled={!text.trim()}>解析题目</Button>
        {parsed.length > 0 && (
          <Button onClick={handleImport} disabled={importing}>
            {importing ? <><Loader2 className="animate-spin size-4" /> 导入中...</> : `导入 ${parsed.length} 道题`}
          </Button>
        )}
      </div>

      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}

      {parsed.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">预览（{parsed.length} 道）</h2>
          {parsed.map((q, i) => (
            <div key={i} className="bg-card border rounded-lg p-3 text-sm">
              <p className="font-semibold mb-1">{i + 1}. {q.question}</p>
              <div className="flex gap-3 text-muted-foreground ml-4">
                {q.options.map((o, j) => (
                  <span key={j} className={j === q.correctIndex ? "font-bold text-green-600" : ""}>
                    {String.fromCharCode(65 + j)}. {o}
                  </span>
                ))}
              </div>
              <div className="flex gap-1 mt-1 ml-4">
                <Badge variant="secondary">{q.level || level}</Badge>
                {q.grammarPoint && <Badge variant="outline">{q.grammarPoint}</Badge>}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
