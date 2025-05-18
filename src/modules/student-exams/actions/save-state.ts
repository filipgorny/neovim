import { findOneOrFail } from '../student-exam-repository'
import { saveExamState } from '../student-exam-service'
import { STUDENT_EXAM_STATUS_PAUSED } from '../student-exam-statuses'
import { validateTimeLeft } from '../validation/validate-time-left'
import { breachSection } from '../../student-exam-sections/student-exam-section-service'
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

  await breachSection(payload.section_id)

  return saveExamState(id, {
    exam_seconds_left: JSON.stringify(payload.exam_seconds_left),
    current_page: payload.current_page,
    is_intact: false,
    status: STUDENT_EXAM_STATUS_PAUSED,
  })
}
