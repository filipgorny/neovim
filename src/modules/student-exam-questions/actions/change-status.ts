import { validateQuestionBelongsToStudent } from '../validation/validate-question-belongs-to-student'
import { findOneOrFail } from '../student-exam-question-repository'
import { changeStatus } from '../student-exam-question-service'

export default async (id, student, payload) => {
  const question = await findOneOrFail({ id }, ['passage.section.exam'])

  validateQuestionBelongsToStudent(student.id)(question)

  return changeStatus(question, payload.question_status)
}
