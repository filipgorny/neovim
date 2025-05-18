import { findOneOrFail } from '../student-exam-repository'
import { saveTimers } from '../student-exam-service'

const findExam = student => async id => (
  findOneOrFail({
    student_id: student.id,
    id,
  })
)

export default async (student, id, payload) => {
  const { timers, timerCheckboxes } = payload
  const exam = await findExam(student)(id)

  return saveTimers(id, timers, timerCheckboxes)
}
