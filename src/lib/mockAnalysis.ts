import type { AnswerRecord, Question } from "@/types/question"

export interface AnalysisReport {
  weakPoints: { point: string; reason: string }[]
  confusions: string[]
  suggestions: string[]
}

export async function mockAnalyze(
  wrongAnswers: AnswerRecord[],
  questions: Question[]
): Promise<AnalysisReport> {
  // Simulate API latency
  await new Promise(r => setTimeout(r, 1500))

  const wrongQuestions = wrongAnswers.map(w => {
    const q = questions.find(q => q.id === w.questionId)!
    return {
      question: q.question,
      grammarPoint: q.grammarPoint,
      level: q.level,
      userAnswer: q.options[w.selectedIndex],
      correctAnswer: q.options[q.correctIndex],
    }
  })

  const grammarPoints = [...new Set(wrongQuestions.map(w => w.grammarPoint))]

  // Generate report based on actual wrong answers
  const weakPoints = grammarPoints.slice(0, 2).map(gp => {
    const count = wrongQuestions.filter(w => w.grammarPoint === gp).length
    return {
      point: gp,
      reason: `在 ${count} 道与「${gp}」相关的题目中选择了错误选项，可能存在对该语法使用场景的理解偏差。`,
    }
  })

  const confusions = generateConfusions(wrongQuestions)

  const suggestions = [
    `针对「${weakPoints.map(w => w.point).join("」和「")}」进行专项练习，特别注意说话者与听话者之间的上下关系。`,
    `建议整理一张敬语对照表（尊敬語・謙譲語・丁寧語），标注每种句型的使用场景（谁对谁、什么场合），每日复习。`,
  ]

  return { weakPoints, confusions, suggestions }
}

function generateConfusions(wrongQuestions: { grammarPoint: string; userAnswer: string; correctAnswer: string }[]): string[] {
  const confusions: string[] = []

  const hasKeigo = wrongQuestions.some(w => w.grammarPoint === "尊敬語")
  const hasKenjo = wrongQuestions.some(w => w.grammarPoint === "謙譲語" || w.grammarPoint === "謙譲語の誤用")

  if (hasKeigo && hasKenjo) {
    confusions.push('尊敬語（「お〜になる」）和謙譲語（「お〜する」）的句型结构相似，容易在判断「谁做动作」时混淆。')
  }

  const keigoErrors = wrongQuestions.filter(w => w.grammarPoint === "尊敬語")
  if (keigoErrors.length >= 2) {
    confusions.push("尊敬語的多种表达方式（「お〜になる」「〜られる」「お〜ください」）在不同语境下的选择容易出错。")
  }

  if (confusions.length === 0) {
    confusions.push("敬语体系中的「内」与「外」关系判断是常见混淆点，需要结合实际对话场景理解。")
  }

  return confusions
}
