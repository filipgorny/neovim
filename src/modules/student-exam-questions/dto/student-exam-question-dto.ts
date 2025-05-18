interface StudentExamQuestionDto {
  student_passage_id: string,
  original_exam_question_id: string
  question_content: string,
  answer_definition: any,
  explanation: string,
  chapter: string,
  question_type: string,
  correct_answer: string,
  order: number
}

export const makeDTO = (
  student_passage_id: string,
  question_content: string,
  answer_definition: any,
  explanation: string,
  chapter: string,
  question_type: string,
  correct_answer: string,
  order: number,
  original_exam_question_id: string
): StudentExamQuestionDto => ({
  student_passage_id,
  question_content,
  answer_definition,
  explanation,
  chapter,
  question_type,
  correct_answer,
  order,
  original_exam_question_id,
})

export default StudentExamQuestionDto
