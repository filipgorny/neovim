interface ExamQuestionDto {
  passage_id: string,
  question_content: string,
  answer_definition: any,
  explanation: string,
  chapter: string,
  question_type: string,
  correct_answer: string,
  order: number
}

export const makeDTO = (
  passage_id: string,
  question_content: string,
  answer_definition: any,
  explanation: string,
  chapter: string,
  question_type: string,
  correct_answer: string,
  order: number
): ExamQuestionDto => ({
  passage_id,
  question_content,
  answer_definition,
  explanation,
  chapter,
  question_type,
  correct_answer,
  order,
})

export default ExamQuestionDto
