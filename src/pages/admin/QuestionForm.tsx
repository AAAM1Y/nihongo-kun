import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useAdminAuth } from "./Login"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function QuestionForm() {
  const isAuth = useAdminAuth()
  const nav = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [form, setForm] = useState({
    question: "",
    option1: "", option2: "", option3: "", option4: "",
    correctIndex: 0,
    grammarPoint: "語彙",
    level: "N2",
    explanation: "",
  })

  useEffect(() => {
    if (!isAuth) { nav("/admin/login"); return }
    if (!isEdit) return
    supabase
      .from("questions")
      .select("*")
      .eq("id", Number(id))
      .single()
      .then(({ data }) => {
        if (data) {
          const opts = data.options as string[]
          setForm({
            question: data.question as string,
            option1: opts[0] || "", option2: opts[1] || "", option3: opts[2] || "", option4: opts[3] || "",
            correctIndex: data.correct_index as number,
            grammarPoint: data.grammar_point as string,
            level: data.level as string,
            explanation: (data.explanation as string) || "",
          })
        }
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      question: form.question,
      options: [form.option1, form.option2, form.option3, form.option4],
      correct_index: form.correctIndex,
      grammar_point: form.grammarPoint,
      level: form.level,
      explanation: form.explanation || null,
    }

    if (isEdit) {
      await supabase.from("questions").update(payload).eq("id", Number(id))
    } else {
      await supabase.from("questions").insert(payload)
    }

    nav("/admin")
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin size-8 text-muted-foreground" />
      </main>
    )
  }

  const field = (label: string, value: string, set: (v: string) => void, textarea?: boolean) => (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={e => set(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[80px]" />
      ) : (
        <input value={value} onChange={e => set(e.target.value)}
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      )}
    </label>
  )

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <h1 className="text-xl font-bold">{isEdit ? "编辑题目" : "新增题目"}</h1>

      {field("题干", form.question, v => setForm(p => ({ ...p, question: v })), true)}

      <div className="grid grid-cols-2 gap-4">
        {field("选项 A", form.option1, v => setForm(p => ({ ...p, option1: v })))}
        {field("选项 B", form.option2, v => setForm(p => ({ ...p, option2: v })))}
        {field("选项 C", form.option3, v => setForm(p => ({ ...p, option3: v })))}
        {field("选项 D", form.option4, v => setForm(p => ({ ...p, option4: v })))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">正确答案</span>
          <select value={form.correctIndex} onChange={e => setForm(p => ({ ...p, correctIndex: Number(e.target.value) }))}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
            {[0, 1, 2, 3].map(i => <option key={i} value={i}>{String.fromCharCode(65 + i)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">语法点</span>
          <input value={form.grammarPoint} onChange={e => setForm(p => ({ ...p, grammarPoint: e.target.value }))}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">等级</span>
          <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
            {["N5", "N4", "N3", "N2", "N1"].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
      </div>

      {field("解析（可选）", form.explanation, v => setForm(p => ({ ...p, explanation: v })), true)}

      <div className="flex gap-2">
        <Button className="flex-1" onClick={handleSave} disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </Button>
        <Button variant="outline" onClick={() => nav("/admin")}>取消</Button>
      </div>
    </main>
  )
}
