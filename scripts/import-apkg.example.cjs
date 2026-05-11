// 从 Anki APKG 单词牌组生成选择题，导入 Supabase
// ⚠️ 使用前：复制本文件为 import-apkg.cjs，填入你的 Supabase URL 和 anon key
const { DatabaseSync } = require("node:sqlite")
const { createClient } = require("@supabase/supabase-js")

const SUPABASE_URL = "https://你的项目.supabase.co"
const SUPABASE_KEY = "你的anon密钥"

const levelFilter = process.argv[2] || "N3::N3高频"
const levelLabel = process.argv[3] || "N3"
const frequency = process.argv[4] || "high"

const db = new DatabaseSync("路径/collection.anki21", { readonly: true })

function getWords(filter) {
  return db.prepare("SELECT flds FROM notes WHERE tags LIKE :tag")
    .all({ tag: `%${filter}%` })
    .map(row => { const f = row.flds.split("\x1f"); return { word: f[1], reading: f[4], definition: f[5] } })
    .filter(w => w.word && w.reading)
}

function pickRandom(arr, n, exclude) {
  const pool = arr.filter(x => x !== exclude); const result = []; const used = new Set()
  while (result.length < n && result.length < pool.length) {
    const idx = Math.floor(Math.random() * pool.length)
    if (!used.has(idx)) { used.add(idx); result.push(pool[idx]) }
  }
  return result
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const words = getWords(levelFilter)
  console.log(`Level: ${levelLabel} | Freq: ${frequency} | ${words.length} words`)
  const questions = []
  for (const w of words) {
    const distractors = pickRandom(words, 3, w.reading)
    if (distractors.length < 3) continue
    const opts = [w.reading, ...distractors.map(d => d.reading)]
    const shuffled = opts.map((opt, i) => ({ opt, orig: i })).sort(() => Math.random() - 0.5)
    const ci = shuffled.findIndex(s => s.orig === 0)
    questions.push({ question: `「${w.word}」的读音是什么？`, options: shuffled.map(s => s.opt), correct_index: ci, grammar_point: "語彙", level: levelLabel, frequency, explanation: `${w.word}（${w.reading}）—— ${w.definition}` })
  }
  console.log(`${questions.length} questions generated`)
  let inserted = 0
  for (let i = 0; i < questions.length; i += 100) {
    const { error } = await supabase.from("questions").insert(questions.slice(i, i + 100))
    if (error) console.error(`FAIL:`, error.message)
    else { inserted += Math.min(100, questions.length - i); console.log(`${inserted}/${questions.length}`) }
  }
  console.log("Done!")
}
main()
