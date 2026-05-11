// 向后兼容的 re-export，实际逻辑拆分为 dataSource / questionRepository / vocabRepository
export { getDataSource, setDataSource } from "@/lib/dataSource"
export { getCount, fetchQuestions } from "@/lib/questionRepository"
export type { QueryOpts } from "@/lib/questionRepository"
export { fetchAllVocab } from "@/lib/vocabRepository"
export type { VocabRow } from "@/lib/vocabRepository"
