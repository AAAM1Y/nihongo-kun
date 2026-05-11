import { parseCSVLine } from "@/lib/csv"
import type { ParsedQuestion } from "@/pages/admin/AiImport"

export function parseAiQuestions(text: string, defaultLevel: string): ParsedQuestion[] {
  const lines = text.split("\n").filter(l => l.trim() && !l.startsWith("question") && !l.startsWith("CSV"))

  // 策略 1：逗号分隔 CSV
  let result = parseCSV(lines)
  // 策略 2：Markdown 表格
  if (result.length === 0) result = parseMarkdown(lines)
  // 策略 3：编号格式
  if (result.length === 0) result = parseNumbered(text)

  // 补默认等级
  return result.map(q => ({ ...q, level: q.level || defaultLevel }))
}

function parseCSV(lines: string[]): ParsedQuestion[] {
  const questions: ParsedQuestion[] = []
  for (const line of lines) {
    const fields = parseCSVLine(line)
    if (fields.length < 7) continue
    const opts = fields.slice(1, 5).filter(o => o)
    if (opts.length < 4) continue
    questions.push({
      question: fields[0].replace(/^"|"$/g, ""),
      options: opts,
      correctIndex: Math.min(Math.max(0, parseInt(fields[5]) || 0), 3),
      grammarPoint: fields[6] || "",
      level: fields[7] || "",
    })
  }
  return questions
}

function parseMarkdown(lines: string[]): ParsedQuestion[] {
  const questions: ParsedQuestion[] = []
  const tableLines = lines.filter(l => l.includes("|") && !l.includes("---"))
  for (const line of tableLines) {
    const cells = line.split("|").map(c => c.trim()).filter(c => c)
    if (cells.length < 7) continue
    const opts = cells.slice(1, 5).filter(o => o)
    if (opts.length < 4) continue
    questions.push({
      question: cells[0],
      options: opts,
      correctIndex: Math.min(Math.max(0, parseInt(cells[5]) || 0), 3),
      grammarPoint: cells[6] || "",
      level: cells[7] || "",
    })
  }
  return questions
}

function parseNumbered(text: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = []
  const blocks = text.split(/\n(?=\d+[\.\s）\)])/)
  for (const block of blocks) {
    const lines = block.split("\n").filter(l => l.trim())
    if (lines.length < 3) continue
    const q = lines[0].replace(/^\d+[\.\s）\)]+/, "").trim()
    const opts: string[] = []
    let correct = 0
    for (let i = 1; i < lines.length; i++) {
      const optLine = lines[i].replace(/^[A-D][\.\s）\)]+/, "").trim()
      if (optLine) {
        if (lines[i].includes("★") || lines[i].startsWith("✓")) correct = opts.length
        opts.push(optLine.replace(/[★✓\[\]]/g, "").trim())
      }
    }
    if (opts.length === 4) {
      questions.push({ question: q, options: opts, correctIndex: correct, grammarPoint: "", level: "" })
    }
  }
  return questions
}
