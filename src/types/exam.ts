export type QuestionGroup = {
  question: string,
  answers: string[],
  chapter: string,
  explanation: string,
  correctAnswer?: string,
}

export type QuestionSet = {
  passage: string,
  questions: QuestionGroup[]
}
