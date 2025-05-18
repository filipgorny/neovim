import { validateQuestionBelongsToStudent } from '../validation/validate-question-belongs-to-student'
import { findOneOrFail } from '../student-exam-question-repository'
import { toggleQuestionFlag } from '../student-exam-question-service'

export default async (id, student) => {
  const question = await findOneOrFail({ id }, ['passage.section.exam'])

  validateQuestionBelongsToStudent(student.id)(question)

  return toggleQuestionFlag(question)
}
