import { findOneOrFail } from '../student-exam-repository'
import { resumeExam } from '../student-exam-service'
import { STUDENT_EXAM_STATUS_PAUSED } from '../student-exam-statuses'

const findExam = student => async id => (
  findOneOrFail({
    student_id: student.id,
    id,
  })
)

export default async (student, id: string) => {
  const exam = await findExam(student)(id)

  // exam not paused - do nothing
  if (exam.status !== STUDENT_EXAM_STATUS_PAUSED) {
    return exam
  }

  return resumeExam(exam.id)
}
