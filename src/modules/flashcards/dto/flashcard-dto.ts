export type BookContentFlashcardDTO = {
  question: string,
  raw_question: string,
  question_image?: string,
  explanation: string,
  explanation_image?: string,
  raw_explanation: string
  question_html: string,
  explanation_html: string,
}

export const makeDTO = (question: string, raw_question: string, question_image: string, explanation: string, explanation_image: string, raw_explanation: string, question_html: string, explanation_html: string): BookContentFlashcardDTO => ({
  question,
  raw_question,
  question_image,
  explanation,
  raw_explanation,
  explanation_image,
  question_html,
  explanation_html,
})

export default BookContentFlashcardDTO
