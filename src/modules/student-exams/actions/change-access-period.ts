import R from 'ramda'
import { validateDateIsNotFromPast } from '../validation/validate-date-not-from-past'
import { setAccessibleTo } from '../student-exam-service'
import { findOneOrFail } from '../student-exam-repository'
import { findOneOrFail as findStudent } from '../../students/student-repository'
import { STUDENT_EXAM_STATUS_EXPIRED } from '../student-exam-statuses'
import { STUDENT_EXAM_LOG_EXAM_EXPIRED } from '../../student-exam-logs/student-exam-log-types'
import { fetchLastExamLogWithType } from '../../student-exam-logs/student-exam-logs-repository'

export default async (examId, instance, impersonator, payload) => {
  const { expiration_date } = payload

  validateDateIsNotFromPast(expiration_date)

  const exam = await findOneOrFail({ id: examId })
  const student = await findStudent({ id: exam.student_id })
  const adminId = impersonator ? impersonator.impersonated_by.id : instance.id

  if (exam.status === STUDENT_EXAM_STATUS_EXPIRED) {
    const examLog = await fetchLastExamLogWithType(exam.id, STUDENT_EXAM_LOG_EXAM_EXPIRED)

    exam.status = R.propOr(exam.status, 'content')(examLog)
  }

  return setAccessibleTo(exam, expiration_date, adminId, student)
}
