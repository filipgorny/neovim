import { findOneOrFail } from '../student-book-content-question-repository'
import { resetQuestion } from '../student-book-content-question-service'
import { StudentCourse } from '../../../types/student-course'

export default async (question_id: string, user, studentCourse: StudentCourse) => {
  const question = await findOneOrFail({ original_content_question_id: question_id, student_course_id: studentCourse.id })

  if (!question.answered_at) {
    return
  }

  const student = user.toJSON()

  return resetQuestion(question, student)
}
