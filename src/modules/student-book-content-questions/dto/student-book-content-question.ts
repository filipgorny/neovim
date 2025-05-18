import { BookContentQuestionType } from '../../book-content-questions/book-content-question-types'

export type StudentBookContentQuestionDTO = {
  content_id: string,
  original_content_question_id: string,
  student_course_id: string
}

export const makeDTO = (
  content_id: string,
  original_content_question_id: string,
  student_course_id: string
): StudentBookContentQuestionDTO => ({
  content_id,
  original_content_question_id,
  student_course_id,
})

export default StudentBookContentQuestionDTO
