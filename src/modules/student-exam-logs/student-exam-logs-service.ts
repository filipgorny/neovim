import { create, deleteLogsByStudentExamId } from './student-exam-logs-repository'
import { makeDTO } from './dto/student-exam-log-dto'
import {
  STUDENT_EXAM_LOG_ACCESS_PERIOD_UPDATED, STUDENT_EXAM_LOG_EXAM_EXPIRED
} from './student-exam-log-types'

export const logAccessPeriodUpdated = async (
  exam_id: string,
  admin_id: string,
  access_period
) => (
  create(
    makeDTO(exam_id, admin_id, STUDENT_EXAM_LOG_ACCESS_PERIOD_UPDATED, access_period)
  )
)

export const logExamExpired = async (
  exam_id: string,
  admin_id: string,
  exam_status
) => (
  create(
    makeDTO(exam_id, admin_id, STUDENT_EXAM_LOG_EXAM_EXPIRED, exam_status)
  )
)

export const deleteStudentExamLogs = async (exam_id: string) => (
  deleteLogsByStudentExamId(exam_id)
)
