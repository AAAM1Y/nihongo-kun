import { useState, useCallback, useMemo } from "react"
import type { Question, AnswerRecord } from "@/types/question"

export function useQuizStore(questions: Question[]) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})

  const selectAnswer = useCallback((questionId: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
  }, [])

  const goNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1))
  }, [questions.length])

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }, [])

  const reset = useCallback(() => {
    setCurrentIndex(0)
    setAnswers({})
  }, [])

  /** 当前题目 */
  const currentQuestion = questions[currentIndex]

  /** 已答题数 */
  const answeredCount = Object.keys(answers).length

  /** 是否全部答完 */
  const isComplete = answeredCount === questions.length

  /** 错题列表 */
  const wrongAnswers: AnswerRecord[] = useMemo(() => {
    return questions
      .filter(q => answers[q.id] !== undefined && answers[q.id] !== q.correctIndex)
      .map(q => ({
        questionId: q.id,
        selectedIndex: answers[q.id],
        isCorrect: false,
      }))
  }, [questions, answers])

  /** 正确数 */
  const correctCount = answeredCount - wrongAnswers.length

  /** 正确率（0-100） */
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0

  return {
    currentIndex,
    currentQuestion,
    answers,
    selectAnswer,
    goNext,
    goPrev,
    reset,
    totalQuestions: questions.length,
    answeredCount,
    isComplete,
    wrongAnswers,
    correctCount,
    accuracy,
  }
}
