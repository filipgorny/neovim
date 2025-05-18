import { findOneOrFail } from '../student-exam-repository'
import { updateExamSecondsLeft } from '../student-exam-service'
import { validateTimeLeft } from '../validation/validate-time-left'
import { validateExpiredExam } from '../validation/validate-expired-exam'

const findExam = student => async id => (
  findOneOrFail({
    student_id: student.id,
    id,
  })
)

export default async (student, id, payload) => {
  const exam = await findExam(student)(id)

  validateExpiredExam(exam)

  const examSecondsLeft = JSON.parse(exam.exam_seconds_left)

  if (examSecondsLeft) {
    validateTimeLeft(examSecondsLeft)(payload)
  }

  return updateExamSecondsLeft(id, {
    exam_seconds_left: JSON.stringify(payload.exam_seconds_left),
  })
}
