export type BookContentQuestion = {
  question: string,
  explanation: string,
  answer_definition: object,
  correct_answers: object,
}

export type NewBookContentQuestion = {
  id: string,
  content_id: string,
  question_id: string,
  subchapter_id: string,
  order?: number,
  subchapter_order: number,
}
